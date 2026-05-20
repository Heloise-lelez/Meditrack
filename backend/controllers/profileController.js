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
      .select('id, nom, prenom, tel, specialite, num_service, horaire_service')
      .in('id', doctorIds);

    if (docError) throw docError;

    let emailMap = {};
    try {
      const emailResults = await Promise.all(
        doctorIds.map((id) => supabaseAdmin.auth.admin.getUserById(id))
      );
      emailMap = Object.fromEntries(
        emailResults.map(({ data }) => [data?.user?.id, data?.user?.email ?? null])
      );
    } catch { /* non-fatal — doctors returned without email */ }

    res.json(doctors.map((d) => ({ ...d, email: emailMap[d.id] ?? null })));
  } catch (err) {
    next(err);
  }
}

export async function listDoctors(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, specialite')
      .eq('role', 'DOCTOR')
      .order('nom', { ascending: true });

    if (error) throw error;
    res.json(data);
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

export async function getMyAides(req, res, next) {
  try {
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('aide_patient')
      .select('aide_id, assigned_at')
      .eq('patient_id', req.user.id);

    if (assignError) throw assignError;
    if (!assignments.length) return res.json([]);

    const aideIds = assignments.map((a) => a.aide_id);
    const { data: aides, error: aideError } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom')
      .in('id', aideIds);

    if (aideError) throw aideError;

    const aideMap = Object.fromEntries(aides.map((a) => [a.id, a]));
    res.json(
      assignments.map((a) => ({
        aide_id: a.aide_id,
        assigned_at: a.assigned_at,
        profiles: aideMap[a.aide_id] ?? null,
      }))
    );
  } catch (err) {
    next(err);
  }
}
