import { supabase, supabaseAdmin } from '../lib/supabase.js';
import { auditEvent, auditError } from '../lib/auditLogger.js';

async function attachUserRole(req) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) {
    void auditError(req, 'auth.profile_role.lookup_failure', error);
    return;
  }

  req.userRole = data?.role ?? null;
}

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401);
    void auditEvent(req, 'auth.require_auth.missing_token');
    return res.json({ error: 'Unauthorized' });
  }

  // Support test token in test environment
  if (process.env.NODE_ENV === 'test' && token === 'test-token') {
    req.user = { id: '123', email: 'test@example.com' };
    req.userToken = token;
    await attachUserRole(req);
    void auditEvent(req, 'auth.require_auth.success');
    return next();
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401);
    void auditError(req, 'auth.require_auth.invalid_token', error);
    return res.json({ error: 'Unauthorized' });
  }

  req.user = data.user;
  req.userToken = token;
  await attachUserRole(req);
  void auditEvent(req, 'auth.require_auth.success');
  next();
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.userRole) {
      await attachUserRole(req);
    }

    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403);
      void auditEvent(req, 'auth.require_role.forbidden', {
        requiredRoles: roles,
        actualRole: req.userRole ?? null,
      });
      return res.json({ error: 'Forbidden' });
    }
    void auditEvent(req, 'auth.require_role.success', {
      requiredRoles: roles,
      actualRole: req.userRole,
    });
    next();
  };
}
