import { createUserClient } from '../lib/supabase.js';

const REQUIRED = [
  'doctor_first_name',
  'doctor_last_name',
  'profession',
  'operation',
  'address',
  'starts_at',
];

export async function listRendezvous(req, res, next) {
  try {
    const db = createUserClient(req.userToken);
    const { data, error } = await db
      .from('rendezvous')
      .select(
        'id_rendezvous, doctor_first_name, doctor_last_name, profession, operation, address, starts_at, profile_picture, checklist'
      )
      .eq('user_id', req.user.id)
      .order('starts_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function nextRendezvous(req, res, next) {
  try {
    const db = createUserClient(req.userToken);
    const { data, error } = await db
      .from('rendezvous')
      .select(
        'id_rendezvous, doctor_first_name, doctor_last_name, profession, operation, address, starts_at, profile_picture, checklist'
      )
      .eq('user_id', req.user.id)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createRendezvous(req, res, next) {
  try {
    const missing = REQUIRED.filter((f) => !req.body[f]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const {
      doctor_first_name,
      doctor_last_name,
      profession,
      operation,
      address,
      starts_at,
      profile_picture,
      checklist,
    } = req.body;
    const db = createUserClient(req.userToken);

    const { data, error } = await db
      .from('rendezvous')
      .insert({
        doctor_first_name,
        doctor_last_name,
        profession,
        operation,
        address,
        starts_at,
        profile_picture: profile_picture ?? null,
        user_id: req.user.id,
        checklist: Array.isArray(checklist) ? checklist : [],
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteRendezvous(req, res, next) {
  try {
    const { id } = req.params;
    const db = createUserClient(req.userToken);
    const { error } = await db
      .from('rendezvous')
      .delete()
      .eq('id_rendezvous', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
export async function updateRdvChecklist(req, res, next) {
  try {
    const { id } = req.params;
    const { checklist } = req.body;

    if (!Array.isArray(checklist)) {
      return res.status(400).json({ error: 'checklist doit être un tableau' });
    }

    const db = createUserClient(req.userToken);
    const { data, error } = await db
      .from('rendezvous')
      .update({ checklist })
      .eq('id_rendezvous', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous introuvable ou permission denied' });
    }

    res.json(data[0]);
  } catch (err) {
    next(err);
  }
}
