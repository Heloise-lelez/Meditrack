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
    const { data: assistant, error: aErr } = await supabaseAdmin
      .from('profiles')
      .select('etablissement_id')
      .eq('id', req.user.id)
      .single();

    if (aErr) throw aErr;
    if (!assistant.etablissement_id) return res.json([]);

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, specialite, etablissement_id')
      .eq('role', 'DOCTOR')
      .eq('etablissement_id', assistant.etablissement_id)
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

    const [{ data: assistant, error: aErr }, { data: doctor, error: dErr }] = await Promise.all([
      supabaseAdmin.from('profiles').select('etablissement_id').eq('id', req.user.id).single(),
      supabaseAdmin.from('profiles').select('etablissement_id').eq('id', doctor_id).single(),
    ]);

    if (aErr) throw aErr;
    if (dErr) throw dErr;

    if (!assistant.etablissement_id || assistant.etablissement_id !== doctor?.etablissement_id) {
      return res.status(403).json({ error: "Ce médecin n'appartient pas à votre établissement" });
    }

    const { data, error } = await supabaseAdmin
      .from('doctor_patient')
      .insert({ doctor_id, patient_id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505')
        return res.status(409).json({ error: 'Assignation déjà existante' });
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
