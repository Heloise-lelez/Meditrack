import { supabase, supabaseAdmin } from '../lib/supabase.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Unauthorized' });

  req.user = data.user;
  req.userToken = token;
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
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.userRole = data.role;
    next();
  };
}
