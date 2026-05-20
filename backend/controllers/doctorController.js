import { supabaseAdmin } from '../lib/supabase.js';
import { encryptBuffer, decryptBuffer } from '../lib/encrypt.js';
import { auditEvent, auditError } from '../lib/auditLogger.js';

// Verify that patientId is assigned to this doctor; returns 403 if not
async function assertPatientOfDoctor(doctorId, patientId, res) {
  const { data, error } = await supabaseAdmin
    .from('doctor_patient')
    .select('patient_id')
    .eq('doctor_id', doctorId)
    .eq('patient_id', patientId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    res.status(403).json({ error: 'Ce patient ne vous est pas assigné' });
    return false;
  }
  return true;
}

// ── Patients list ─────────────────────────────────────────────────────────────

export async function listMyPatients(req, res, next) {
  try {
    const { data: assignments, error: aErr } = await supabaseAdmin
      .from('doctor_patient')
      .select('patient_id, assigned_at')
      .eq('doctor_id', req.user.id);

    if (aErr) throw aErr;
    if (!assignments.length) return res.json([]);

    const patientIds = assignments.map((a) => a.patient_id);
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom')
      .in('id', patientIds)
      .order('nom', { ascending: true });

    if (pErr) throw pErr;

    const assignedAt = Object.fromEntries(assignments.map((a) => [a.patient_id, a.assigned_at]));
    const patients = profiles.map((p) => ({ ...p, assigned_at: assignedAt[p.id] }));
    res.json(patients);
  } catch (err) {
    next(err);
  }
}

// ── Rendez-vous ───────────────────────────────────────────────────────────────

export async function listPatientRendezvous(req, res, next) {
  try {
    const { pid } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const { data, error } = await supabaseAdmin
      .from('rendezvous')
      .select('*')
      .eq('user_id', pid)
      .order('starts_at', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createPatientRendezvous(req, res, next) {
  try {
    const { pid } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const REQUIRED = [
      'doctor_first_name',
      'doctor_last_name',
      'profession',
      'operation',
      'address',
      'starts_at',
    ];
    const missing = REQUIRED.filter((f) => !req.body[f]);
    if (missing.length)
      return res.status(400).json({ error: `Champs manquants: ${missing.join(', ')}` });

    const {
      doctor_first_name,
      doctor_last_name,
      profession,
      operation,
      address,
      starts_at,
      profile_picture,
    } = req.body;
    const { data, error } = await supabaseAdmin
      .from('rendezvous')
      .insert({
        doctor_first_name,
        doctor_last_name,
        profession,
        operation,
        address,
        starts_at,
        profile_picture: profile_picture ?? null,
        user_id: pid,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deletePatientRendezvous(req, res, next) {
  try {
    const { pid, id } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const { error } = await supabaseAdmin
      .from('rendezvous')
      .delete()
      .eq('id_rendezvous', id)
      .eq('user_id', pid);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ── Tâches du jour ────────────────────────────────────────────────────────────

export async function listPatientTaches(req, res, next) {
  try {
    const { pid } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    let query = supabaseAdmin
      .from('tachesjour')
      .select('*')
      .eq('user_id', pid)
      .order('date_tache', { ascending: false });

    if (req.query.date) query = query.eq('date_tache', req.query.date);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createPatientTache(req, res, next) {
  try {
    const { pid } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const REQUIRED = ['nom_tache', 'date_tache'];
    const missing = REQUIRED.filter((f) => !req.body[f]);
    if (missing.length)
      return res.status(400).json({ error: `Champs manquants: ${missing.join(', ')}` });

    const { nom_tache, date_tache, heure, commentaire } = req.body;
    const { data, error } = await supabaseAdmin
      .from('tachesjour')
      .insert({
        nom_tache,
        date_tache,
        heure: heure ?? null,
        commentaire: commentaire ?? null,
        statut: 'a_faire',
        user_id: pid,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deletePatientTache(req, res, next) {
  try {
    const { pid, id } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const { error } = await supabaseAdmin
      .from('tachesjour')
      .delete()
      .eq('id_tache', id)
      .eq('user_id', pid);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ── Étapes ────────────────────────────────────────────────────────────────────

export async function listPatientEtapes(req, res, next) {
  try {
    const { pid } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const { data, error } = await supabaseAdmin
      .from('etape')
      .select('*')
      .eq('user_id', pid)
      .order('date_debut', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createPatientEtape(req, res, next) {
  try {
    const { pid } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const REQUIRED = ['titre', 'date_debut'];
    const missing = REQUIRED.filter((f) => !req.body[f]);
    if (missing.length)
      return res.status(400).json({ error: `Champs manquants: ${missing.join(', ')}` });

    const { titre, detail, date_debut, date_fin, checklist } = req.body;
    const { data, error } = await supabaseAdmin
      .from('etape')
      .insert({
        titre,
        detail: detail ?? null,
        date_debut,
        date_fin: date_fin ?? null,
        checklist: checklist ?? [],
        user_id: pid,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function deletePatientEtape(req, res, next) {
  try {
    const { pid, id } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const { error } = await supabaseAdmin
      .from('etape')
      .delete()
      .eq('id_etape', id)
      .eq('user_id', pid);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ── Profil médecin ────────────────────────────────────────────────────────────

export async function getMyProfile(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom, tel, specialite, num_service, horaire_service')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const { specialite, num_service, horaire_service } = req.body;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        specialite: specialite ?? null,
        num_service: num_service ?? null,
        horaire_service: horaire_service ?? null,
      })
      .eq('id', req.user.id)
      .select('id, nom, prenom, tel, specialite, num_service, horaire_service')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ── Recherche + auto-assignation ──────────────────────────────────────────────

export async function searchPatients(req, res, next) {
  try {
    const q = (req.query.q ?? '').trim();
    if (!q) return res.json([]);

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, nom, prenom')
      .eq('role', 'PATIENT')
      .or(`nom.ilike.%${q}%,prenom.ilike.%${q}%`)
      .order('nom', { ascending: true })
      .limit(20);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function selfAssign(req, res, next) {
  try {
    const { patient_id } = req.body;
    if (!patient_id) return res.status(400).json({ error: 'patient_id est requis' });

    const { data, error } = await supabaseAdmin
      .from('doctor_patient')
      .insert({ doctor_id: req.user.id, patient_id })
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

export async function selfUnassign(req, res, next) {
  try {
    const { patient_id } = req.body;
    if (!patient_id) return res.status(400).json({ error: 'patient_id est requis' });

    const { error } = await supabaseAdmin
      .from('doctor_patient')
      .delete()
      .eq('doctor_id', req.user.id)
      .eq('patient_id', patient_id);

    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ── Documents ─────────────────────────────────────────────────────────────────

export async function listPatientDocuments(req, res, next) {
  try {
    const { pid } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const { data, error } = await supabaseAdmin
      .from('document')
      .select('*')
      .eq('user_id', pid)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function downloadPatientDocument(req, res, next) {
  try {
    const { pid, id } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    const { data: doc, error: fetchErr } = await supabaseAdmin
      .from('document')
      .select('download_link, titre, mime_type')
      .eq('id_document', id)
      .eq('user_id', pid)
      .single();

    if (fetchErr || !doc) return res.status(404).json({ error: 'Document introuvable' });
    if (!doc.download_link)
      return res.status(404).json({ error: 'Aucun fichier associé à ce document' });

    void auditEvent(req, 'doctor.patient_document.download.storage_attempt', {
      patientId: pid,
      documentId: id,
      titre: doc.titre,
      storagePath: doc.download_link,
    });

    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from('documents')
      .download(doc.download_link);

    if (dlErr) {
      void auditError(req, 'doctor.patient_document.download.storage_failure', dlErr, {
        patientId: pid,
        documentId: id,
        titre: doc.titre,
        storagePath: doc.download_link,
      });
      throw dlErr;
    }

    const arrayBuffer = await blob.arrayBuffer();
    const decrypted = decryptBuffer(Buffer.from(arrayBuffer));

    const contentType = doc.mime_type || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.titre)}"`);
    void auditEvent(req, 'doctor.patient_document.download.success', {
      patientId: pid,
      documentId: id,
      titre: doc.titre,
      mimeType: contentType,
      storagePath: doc.download_link,
      size: decrypted.length,
    });
    res.send(decrypted);
  } catch (err) {
    void auditError(req, 'doctor.patient_document.download.failure', err, {
      patientId: req.params?.pid,
      documentId: req.params?.id,
    });
    next(err);
  }
}

export async function uploadDocumentForPatient(req, res, next) {
  try {
    const { pid } = req.params;
    if (!(await assertPatientOfDoctor(req.user.id, pid, res))) return;

    if (!req.file) return res.status(400).json({ error: 'Fichier manquant' });

    const { titre, type, publication_date } = req.body;
    if (!titre || !type) return res.status(400).json({ error: 'Champs manquants: titre, type' });

    const ext = req.file.originalname.includes('.') ? req.file.originalname.split('.').pop() : '';
    const safeTitle = titre
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '');
    const storagePath = `uploads/${crypto.randomUUID()}-${safeTitle}${ext ? `.${ext}` : ''}`;

    const encrypted = encryptBuffer(req.file.buffer);
    void auditEvent(req, 'doctor.patient_document.upload.storage_attempt', {
      patientId: pid,
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath,
      },
      document: {
        titre,
        type,
        publication_date: publication_date || null,
      },
    });

    const { error: storageErr } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, encrypted, {
        contentType: 'application/octet-stream',
        upsert: false,
      });

    if (storageErr) {
      void auditError(req, 'doctor.patient_document.upload.storage_failure', storageErr, {
        patientId: pid,
        storagePath,
        originalName: req.file.originalname,
      });
      throw storageErr;
    }

    const sizeKb = Math.max(1, Math.round(req.file.size / 1024));

    let data;
    try {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('document')
        .insert({
          titre,
          type,
          publication_date: publication_date || null,
          download_link: storagePath,
          size_kb: sizeKb,
          user_id: pid,
          mime_type: req.file.mimetype || 'application/octet-stream',
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      data = inserted;
    } catch (insertErr) {
      void auditError(req, 'doctor.patient_document.upload.database_failure', insertErr, {
        patientId: pid,
        storagePath,
        originalName: req.file.originalname,
      });
      await supabaseAdmin.storage.from('documents').remove([storagePath]);
      throw insertErr;
    }

    void auditEvent(req, 'doctor.patient_document.upload.success', {
      patientId: pid,
      documentId: data.id_document,
      titre: data.titre,
      type: data.type,
      originalName: req.file.originalname,
      storagePath,
      sizeKb,
    });

    res.status(201).json(data);
  } catch (err) {
    void auditError(req, 'doctor.patient_document.upload.failure', err, {
      patientId: req.params?.pid,
      originalName: req.file?.originalname,
      size: req.file?.size,
      mimeType: req.file?.mimetype,
    });
    next(err);
  }
}
