import { supabaseAdmin } from '../lib/supabase.js';

export async function getMyDoctors(req, res, next) {
  try {
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('doctor_patient')
      .select('doctor_id')
      .eq('patient_id', req.user.id);

    if (assignError) throw assignError;
    if (!assignments.length) return res.json([]);

    const doctorIds = assignments.map((a) => a.doctor_id);
    const { data: doctors, error: docError } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom')
      .in('id', doctorIds);

    if (docError) throw docError;
    res.json(doctors);
  } catch (err) {
    next(err);
  }
}

export async function getMyRole(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ role: data?.role ?? 'PATIENT' });
  } catch (err) {
    next(err);
  }
}
