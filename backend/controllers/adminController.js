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
      return res.status(400).json({ error: 'Seuls les DOCTOR et ASSISTANT peuvent être assignés à un établissement' });
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
