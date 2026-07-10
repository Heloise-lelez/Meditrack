import { supabaseAdmin } from '../lib/supabase.js';

const VALID_ROLES = ['PATIENT', 'ASSISTANT', 'DOCTOR', 'SUPER_ADMIN', 'AIDE'];
const ETAB_ROLES = ['DOCTOR', 'ASSISTANT'];

export async function listUsers(req, res, next) {
  try {
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, role, etablissement_id, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch emails from auth.users via admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const emailMap = Object.fromEntries(authData.users.map((u) => [u.id, u.email]));

    const users = profiles.map((p) => ({
      ...p,
      email: emailMap[p.id] ?? null,
    }));

    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `role doit être l'un de: ${VALID_ROLES.join(', ')}` });
    }

    // Prevent demoting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Impossible de modifier votre propre rôle' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ── Établissements ────────────────────────────────────────────────────────────

export async function listEtablissements(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('etablissement')
      .select('*')
      .order('nom', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createEtablissement(req, res, next) {
  try {
    const { nom, adresse } = req.body;
    if (!nom) return res.status(400).json({ error: 'nom est requis' });

    const { data, error } = await supabaseAdmin
      .from('etablissement')
      .insert({ nom, adresse: adresse ?? null })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateUserEtablissement(req, res, next) {
  try {
    const { id } = req.params;
    const { etablissement_id } = req.body;

    const { data: profile, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single();

    if (fetchErr || !profile) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (!ETAB_ROLES.includes(profile.role)) {
      return res
        .status(400)
        .json({ error: 'Seuls les DOCTOR et ASSISTANT peuvent être assignés à un établissement' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ etablissement_id: etablissement_id ?? null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getDashboardStats(req, res, next) {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [totalResult, errorResult, rowsResult] = await Promise.all([
      supabaseAdmin
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabaseAdmin
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since)
        .eq('outcome', 'error'),
      supabaseAdmin
        .from('audit_logs')
        .select('actor_id, actor_role, route, method, outcome, duration_ms, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5000),
    ]);

    if (totalResult.error) throw totalResult.error;
    if (errorResult.error) throw errorResult.error;
    if (rowsResult.error) throw rowsResult.error;

    const rows = rowsResult.data ?? [];
    const total = totalResult.count ?? 0;
    const errors = errorResult.count ?? 0;

    const byRoleMap = {};
    const byDayMap = {};
    const byRouteMap = {};
    let durationSum = 0;
    let durationCount = 0;
    const actorIds = new Set();

    for (const row of rows) {
      if (row.actor_id) actorIds.add(row.actor_id);
      if (row.actor_role) byRoleMap[row.actor_role] = (byRoleMap[row.actor_role] ?? 0) + 1;

      const day = row.created_at.slice(0, 10);
      if (!byDayMap[day]) byDayMap[day] = { total: 0, errors: 0 };
      byDayMap[day].total++;
      if (row.outcome === 'error') byDayMap[day].errors++;

      if (row.route) {
        const key = row.route;
        byRouteMap[key] = (byRouteMap[key] ?? 0) + 1;
      }

      if (row.duration_ms != null) {
        durationSum += row.duration_ms;
        durationCount++;
      }
    }

    res.json({
      period_days: days,
      total,
      errors,
      success_rate: total > 0 ? Math.round(((total - errors) / total) * 100) : 100,
      avg_duration_ms: durationCount > 0 ? Math.round(durationSum / durationCount) : 0,
      active_users: actorIds.size,
      by_role: Object.entries(byRoleMap)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count),
      top_routes: Object.entries(byRouteMap)
        .map(([route, count]) => ({ route, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      by_day: Object.entries(byDayMap)
        .map(([date, d]) => ({ date, ...d }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogs(req, res, next) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);

    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (req.query.actor_id) query = query.eq('actor_id', req.query.actor_id);
    if (req.query.actor_email) query = query.ilike('actor_email', `%${req.query.actor_email}%`);
    if (req.query.action) query = query.eq('action', req.query.action);
    if (req.query.event_type) query = query.eq('event_type', req.query.event_type);
    if (req.query.path) query = query.ilike('path', `%${req.query.path}%`);
    if (req.query.from) query = query.gte('created_at', req.query.from);
    if (req.query.to) query = query.lte('created_at', req.query.to);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
}
