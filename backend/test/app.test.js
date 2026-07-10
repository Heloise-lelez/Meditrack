import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.VITE_SUPABASE_URL ??= 'https://example.supabase.co';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??= 'test-publishable-key';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key';
process.env.DOCUMENT_ENCRYPTION_KEY ??= '0'.repeat(64);
process.env.AUDIT_LOG_TO_DB = 'false';
process.env.VERCEL = '1';

const { default: app } = await import('../server.js');

test('GET / exposes the API health response', async () => {
  const response = await request(app).get('/').expect(200);

  assert.equal(response.body.message, 'API is running');
  assert.equal(response.headers['cache-control'], 'public, s-maxage=60, stale-while-revalidate=30');
});

test('protected endpoints reject missing bearer token', async () => {
  const response = await request(app).get('/api/doctor/profile').expect(401);

  assert.deepEqual(response.body, { error: 'Unauthorized' });
});

test('aide endpoints are mounted and protected', async () => {
  const response = await request(app).get('/api/aide/patients').expect(401);

  assert.deepEqual(response.body, { error: 'Unauthorized' });
});

test('public audit client endpoint accepts supported audit actions', async () => {
  await request(app)
    .post('/api/audit/client')
    .send({ action: 'auth.sign_in.attempt', email: 'patient@example.com' })
    .expect(204);
});

test('public audit client endpoint rejects unsupported audit actions', async () => {
  const response = await request(app)
    .post('/api/audit/client')
    .send({ action: 'unknown.action' })
    .expect(400);

  assert.deepEqual(response.body, { error: 'Unsupported audit action' });
});

test('PUT /api/profile/update/:id rejects invalid is_accompanied value', async () => {
  const response = await request(app)
    .put('/api/profile/update/123')
    .set('Authorization', 'Bearer test-token')
    .send({ is_accompanied: 'invalid' })
    .expect(400);

  assert.deepEqual(response.body, { error: 'is_accompanied doit être un boolean' });
});
