import { supabaseAdmin } from '../lib/supabase.js';

async function assertAideOwnsPatient(aideId, patientId) {
  const { data, error } = await supabaseAdmin
    .from('aide_patient')
    .select('aide_id')
    .eq('aide_id', aideId)
    .eq('patient_id', patientId)
    .single();

  if (error || !data) return false;
  return true;
}

export async function listMyPatients(req, res, next) {
  try {
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('aide_patient')
      .select('patient_id, assigned_at')
      .eq('aide_id', req.user.id);

    if (assignError) throw assignError;
    if (!assignments.length) return res.json([]);

    const patientIds = assignments.map((a) => a.patient_id);
    const { data: patients, error: patError } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom')
      .in('id', patientIds);

    if (patError) throw patError;

    const patMap = Object.fromEntries(patients.map((p) => [p.id, p]));
    res.json(
      assignments.map((a) => ({
        patient_id: a.patient_id,
        assigned_at: a.assigned_at,
        profiles: patMap[a.patient_id] ?? null,
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function listPatientsRendezvous(req, res, next) {
  try {
    const { data: assignments, error: aErr } = await supabaseAdmin
      .from('aide_patient')
      .select('patient_id')
      .eq('aide_id', req.user.id);
    if (aErr) throw aErr;
    if (!assignments?.length) return res.json([]);

    const patientIds = assignments.map((a) => a.patient_id);

    const [{ data: profiles, error: pErr }, { data: rdvs, error: rErr }] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, nom, prenom').in('id', patientIds),
      supabaseAdmin
        .from('rendezvous')
        // L'aide ne voit PAS le champ "operation"
        .select(
          'id_rendezvous, doctor_first_name, doctor_last_name, profession, starts_at, address, user_id'
        )
        .in('user_id', patientIds)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true }),
    ]);
    if (pErr) throw pErr;
    if (rErr) throw rErr;

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
    res.json(rdvs.map((r) => ({ ...r, patient: profileMap[r.user_id] ?? null })));
  } catch (err) {
    next(err);
  }
}

export async function getPatientTaches(req, res, next) {
  try {
    const { patientId } = req.params;
    if (!(await assertAideOwnsPatient(req.user.id, patientId))) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { date } = req.query;
    let query = supabaseAdmin
      .from('tachesjour')
      .select('id_tache, statut, heure, date_tache, nom_tache, commentaire')
      .eq('user_id', patientId)
      .order('created_at', { ascending: false });
    if (date) query = query.eq('date_tache', date);
    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getPatientEtapes(req, res, next) {
  try {
    const { patientId } = req.params;
    if (!(await assertAideOwnsPatient(req.user.id, patientId))) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { data, error } = await supabaseAdmin
      .from('etape')
      .select('*')
      .eq('user_id', patientId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getPatientRendezvous(req, res, next) {
  try {
    const { patientId } = req.params;
    if (!(await assertAideOwnsPatient(req.user.id, patientId))) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // L'aide ne voit PAS le champ "operation"
    const { data, error } = await supabaseAdmin
      .from('rendezvous')
      .select(
        'id_rendezvous, doctor_first_name, doctor_last_name, profession, starts_at, address, profile_picture'
      )
      .eq('user_id', patientId)
      .order('starts_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getPatientChirurgies(req, res, next) {
  try {
    const { patientId } = req.params;
    if (!(await assertAideOwnsPatient(req.user.id, patientId))) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { data, error } = await supabaseAdmin
      .from('chirurgie')
      .select(
        'id, titre, date_chirurgie, salle_anesthesie, salle_operation, salle_reveil, created_at'
      )
      .eq('patient_id', patientId)
      .order('date_chirurgie', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}
