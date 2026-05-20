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

export async function getSinglePatient(req, res, next) {

  try {

    if(req.query.id) {

      const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, created_at')
      .eq('id', req.query.id)
      .eq('role', 'PATIENT')

      if (error) throw error;
      res.json(data);

    } else {

      const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom')
      .eq('nom', req.query.nom)
      .eq('prenom', req.query.prenom)
      .eq('role', 'PATIENT')

      if (error) throw error;
      res.json(data);
      
    }

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

export async function getSingleDoctor(req, res, next) {
  try {

    if(req.query.id) {

      const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, created_at')
      .eq('id', req.query.id)
      .eq('role', 'DOCTOR');

      if (error) throw error;
      res.json(data);

    } else {

      const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom')
      .eq('nom', req.query.nom)
      .eq('prenom', req.query.prenom)
      .eq('role', 'DOCTOR');

      if (error) throw error;
      res.json(data);
      
    }

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

// ── Gestion des Aides ──────────────────────────────────────

export async function listAides(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, tel, created_at')
      .eq('role', 'AIDE')
      .order('nom', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createAideAccount(req, res, next) {
  try {
    const { email, password, nom, prenom, tel } = req.body;
    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({ error: 'email, password, nom et prenom sont requis' });
    }

    // Créer le user dans Supabase Auth avec le rôle AIDE dans les metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nom, prenom, tel: tel || null, role: 'AIDE' },
    });

    if (authError) throw authError;

    res.status(201).json({
      id: authData.user.id,
      email: authData.user.email,
      nom,
      prenom,
    });
  } catch (err) {
    next(err);
  }
}

export async function assignAideToPatient(req, res, next) {
  try {
    const { aide_id, patient_id } = req.body;
    if (!aide_id || !patient_id) {
      return res.status(400).json({ error: 'aide_id et patient_id sont requis' });
    }

    const { data, error } = await supabaseAdmin
      .from('aide_patient')
      .insert({ aide_id, patient_id })
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

export async function removeAideFromPatient(req, res, next) {
  try {
    const { aide_id, patient_id } = req.body;
    if (!aide_id || !patient_id) {
      return res.status(400).json({ error: 'aide_id et patient_id sont requis' });
    }

    const { error } = await supabaseAdmin
      .from('aide_patient')
      .delete()
      .eq('aide_id', aide_id)
      .eq('patient_id', patient_id);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function listAideAssignments(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('aide_patient')
      .select('aide_id, patient_id, assigned_at');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ── Chirurgies ─────────────────────────────────────────────

const STEP_LABELS = {
  salle_anesthesie: "salle d'anesthésie",
  salle_operation: "salle d'opération",
  salle_reveil: 'salle de réveil',
};

export async function listMyChirurgies(req, res, next) {
  try {
    const { data: chirurgies, error } = await supabaseAdmin
      .from('chirurgie')
      .select('*')
      .eq('assistant_id', req.user.id)
      .order('date_chirurgie', { ascending: true });
    if (error) throw error;
    if (!chirurgies.length) return res.json([]);

    const profileIds = [
      ...new Set([...chirurgies.map((c) => c.patient_id), ...chirurgies.map((c) => c.doctor_id)]),
    ];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom')
      .in('id', profileIds);
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

    res.json(
      chirurgies.map((c) => ({
        ...c,
        patient: profileMap[c.patient_id] ?? null,
        doctor: profileMap[c.doctor_id] ?? null,
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function checkChirurgieStep(req, res, next) {
  try {
    const { id } = req.params;
    const { step } = req.body;
    const VALID_STEPS = ['salle_anesthesie', 'salle_operation', 'salle_reveil'];
    if (!VALID_STEPS.includes(step)) {
      return res.status(400).json({ error: 'Étape invalide' });
    }

    const { data: chirurgie, error: fetchErr } = await supabaseAdmin
      .from('chirurgie')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!chirurgie) return res.status(404).json({ error: 'Chirurgie introuvable' });
    if (chirurgie.assistant_id !== req.user.id) return res.status(403).json({ error: 'Interdit' });
    if (chirurgie[step]) return res.status(400).json({ error: 'Cette étape est déjà validée' });

    if (step === 'salle_operation' && !chirurgie.salle_anesthesie) {
      return res.status(400).json({ error: "La salle d'anesthésie doit être validée en premier" });
    }
    if (step === 'salle_reveil' && !chirurgie.salle_operation) {
      return res.status(400).json({ error: "La salle d'opération doit être validée en premier" });
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('chirurgie')
      .update({ [step]: true })
      .eq('id', id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    // Broadcast to patient's aides
    const { data: patientProfile } = await supabaseAdmin
      .from('profiles')
      .select('nom, prenom')
      .eq('id', chirurgie.patient_id)
      .single();
    const patientName = patientProfile
      ? `${patientProfile.prenom} ${patientProfile.nom}`
      : 'Le patient';

    const { data: aides } = await supabaseAdmin
      .from('aide_patient')
      .select('aide_id')
      .eq('patient_id', chirurgie.patient_id);

    if (aides?.length) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              topic: `patient:${chirurgie.patient_id}`,
              event: 'surgery_step',
              payload: {
                step,
                message: `${patientName} est en ${STEP_LABELS[step]}`,
                chirurgieTitre: chirurgie.titre,
                patientId: chirurgie.patient_id,
                timestamp: new Date().toISOString(),
              },
            },
          ],
        }),
      });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
