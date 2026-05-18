import { supabase } from '../lib/supabase.js';

const REQUIRED = ['doctor_first_name', 'doctor_last_name', 'profession', 'operation', 'address', 'starts_at'];

export async function listRendezvous(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('rendezvous')
      .select('*')
      .order('starts_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function nextRendezvous(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('rendezvous')
      .select('*')
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

    const { doctor_first_name, doctor_last_name, profession, operation, address, starts_at, profile_picture } = req.body;

    const { data, error } = await supabase
      .from('rendezvous')
      .insert({ doctor_first_name, doctor_last_name, profession, operation, address, starts_at, profile_picture: profile_picture ?? null })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}
