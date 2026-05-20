import { supabase, supabaseAdmin } from '../lib/supabase.js';
import { auditEvent, auditError } from '../lib/auditLogger.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    void auditEvent(req, 'auth.require_auth.missing_token');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    void auditError(req, 'auth.require_auth.invalid_token', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = data.user;
  req.userToken = token;
  void auditEvent(req, 'auth.require_auth.success');
  next();
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!data || !roles.includes(data.role)) {
      void auditEvent(req, 'auth.require_role.forbidden', {
        requiredRoles: roles,
        actualRole: data?.role ?? null,
      });
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.userRole = data.role;
    void auditEvent(req, 'auth.require_role.success', {
      requiredRoles: roles,
      actualRole: data.role,
    });
    next();
  };
}
