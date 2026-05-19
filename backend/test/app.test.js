import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.VITE_SUPABASE_URL ??= 'https://example.supabase.co';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??= 'test-publishable-key';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key';
process.env.DOCUMENT_ENCRYPTION_KEY ??= '0'.repeat(64);
process.env.VERCEL = '1';

const { default: app } = await import('../server.js');

test('GET / exposes the API health response', async () => {
  const response = await request(app).get('/').expect(200);

  assert.deepEqual(response.body, { message: 'API is running' });
});

test('protected endpoints reject missing bearer token', async () => {
  const response = await request(app).get('/api/doctor/profile').expect(401);

  assert.deepEqual(response.body, { error: 'Unauthorized' });
});
