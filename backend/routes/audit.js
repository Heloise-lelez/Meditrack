import { Router } from 'express';
import { auditEvent } from '../lib/auditLogger.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const PUBLIC_CLIENT_ACTIONS = new Set([
  'auth.sign_in.attempt',
  'auth.sign_in.success',
  'auth.sign_in.failure',
  'auth.sign_up.attempt',
  'auth.sign_up.success',
  'auth.sign_up.failure',
  'auth.password_reset.request',
  'auth.password_reset.success',
  'auth.password_reset.failure',
]);

const PRIVATE_CLIENT_ACTIONS = new Set(['auth.sign_out']);

function clientDetails(req) {
  return {
    action: req.body?.action,
    email: req.body?.email ?? null,
    metadata: req.body?.metadata ?? {},
  };
}

router.post('/client', async (req, res) => {
  const action = req.body?.action;
  if (!PUBLIC_CLIENT_ACTIONS.has(action)) {
    return res.status(400).json({ error: 'Unsupported audit action' });
  }

  await auditEvent(req, action, clientDetails(req));
  res.status(204).end();
});

router.post('/client/authenticated', requireAuth, async (req, res) => {
  const action = req.body?.action;
  if (!PRIVATE_CLIENT_ACTIONS.has(action)) {
    return res.status(400).json({ error: 'Unsupported audit action' });
  }

  await auditEvent(req, action, clientDetails(req));
  res.status(204).end();
});

export default router;
