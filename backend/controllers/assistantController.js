import { supabaseAdmin } from '../lib/supabase.js';

export async function listPatients(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, created_at')
      .eq('role', 'PATIENT')
      .order('nom', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function listDoctors(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, created_at')
      .eq('role', 'DOCTOR')
      .order('nom', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function listAssignments(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('doctor_patient')
      .select('doctor_id, patient_id, assigned_at');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createAssignment(req, res, next) {
  try {
    const { doctor_id, patient_id } = req.body;
    if (!doctor_id || !patient_id) {
      return res.status(400).json({ error: 'doctor_id et patient_id sont requis' });
    }

    const { data, error } = await supabaseAdmin
      .from('doctor_patient')
      .insert({ doctor_id, patient_id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Assignation déjà existante' });
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteAssignment(req, res, next) {
  try {
    const { doctor_id, patient_id } = req.body;
    if (!doctor_id || !patient_id) {
      return res.status(400).json({ error: 'doctor_id et patient_id sont requis' });
    }

    const { error } = await supabaseAdmin
      .from('doctor_patient')
      .delete()
      .eq('doctor_id', doctor_id)
      .eq('patient_id', patient_id);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
