import { createUserClient, supabaseAdmin } from '../lib/supabase.js';
import { encryptBuffer, decryptBuffer } from '../lib/encrypt.js';
import { auditEvent, auditError } from '../lib/auditLogger.js';

export async function listDocuments(req, res, next) {
  try {
    const db = createUserClient(req.userToken);
    let query = db
      .from('document')
      .select('*')
      .eq('user_id', req.user.id)
      .order('publication_date', { ascending: false });

    const limit = parseInt(req.query.limit, 10);
    if (!isNaN(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createDocument(req, res, next) {
  try {
    const { titre, type } = req.body;
    if (!titre || !type) {
      return res.status(400).json({ error: 'Missing required fields: titre, type' });
    }

    const { publication_date, download_link, size_kb } = req.body;
    const db = createUserClient(req.userToken);

    const { data, error } = await db
      .from('document')
      .insert({
        titre,
        type,
        publication_date: publication_date ?? null,
        download_link: download_link ?? null,
        size_kb: size_kb ?? null,
        user_id: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      void auditEvent(req, 'document.upload.missing_file');
      return res.status(400).json({ error: 'No file provided' });
    }

    const { titre, type, publication_date } = req.body;
    if (!titre || !type) {
      return res.status(400).json({ error: 'Missing required fields: titre, type' });
    }

    const ext = req.file.originalname.includes('.') ? req.file.originalname.split('.').pop() : '';
    const safeTitle = titre
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '');
    const randomId = crypto.randomUUID();
    const storagePath = `uploads/${randomId}-${safeTitle}${ext ? `.${ext}` : ''}`;

    const db = createUserClient(req.userToken);

    const encrypted = encryptBuffer(req.file.buffer);
    void auditEvent(req, 'document.upload.storage_attempt', {
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

    const { error: storageErr } = await db.storage
      .from('documents')
      .upload(storagePath, encrypted, {
        contentType: 'application/octet-stream',
        upsert: false,
      });

    if (storageErr) {
      void auditError(req, 'document.upload.storage_failure', storageErr, {
        storagePath,
        originalName: req.file.originalname,
      });
      throw storageErr;
    }

    const sizeKb = Math.max(1, Math.round(req.file.size / 1024));

    let data;
    try {
      const { data: inserted, error: insertErr } = await db
        .from('document')
        .insert({
          titre,
          type,
          publication_date: publication_date || null,
          download_link: storagePath,
          size_kb: sizeKb,
          user_id: req.user.id,
          mime_type: req.file.mimetype || 'application/octet-stream',
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      data = inserted;
    } catch (insertErr) {
      void auditError(req, 'document.upload.database_failure', insertErr, {
        storagePath,
        originalName: req.file.originalname,
      });
      await db.storage.from('documents').remove([storagePath]);
      throw insertErr;
    }

    void auditEvent(req, 'document.upload.success', {
      documentId: data.id_document,
      titre: data.titre,
      type: data.type,
      originalName: req.file.originalname,
      storagePath,
      sizeKb,
    });

    res.status(201).json(data);
  } catch (err) {
    void auditError(req, 'document.upload.failure', err, {
      originalName: req.file?.originalname,
      size: req.file?.size,
      mimeType: req.file?.mimetype,
    });
    next(err);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const { id } = req.params;
    const db = createUserClient(req.userToken);

    const { data: doc, error: fetchErr } = await db
      .from('document')
      .select('download_link, titre, mime_type')
      .eq('id_document', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr || !doc) return res.status(404).json({ error: 'Document introuvable' });
    if (!doc.download_link)
      return res.status(404).json({ error: 'Aucun fichier associé à ce document' });

    void auditEvent(req, 'document.download.storage_attempt', {
      documentId: id,
      titre: doc.titre,
      storagePath: doc.download_link,
    });

    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from('documents')
      .download(doc.download_link);

    if (dlErr) {
      void auditError(req, 'document.download.storage_failure', dlErr, {
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
    void auditEvent(req, 'document.download.success', {
      documentId: id,
      titre: doc.titre,
      mimeType: contentType,
      storagePath: doc.download_link,
      size: decrypted.length,
    });
    res.send(decrypted);
  } catch (err) {
    void auditError(req, 'document.download.failure', err, {
      documentId: req.params?.id,
    });
    next(err);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const db = createUserClient(req.userToken);

    const { data: doc, error: fetchErr } = await db
      .from('document')
      .select('download_link')
      .eq('id_document', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr || !doc) return res.status(404).json({ error: 'Document introuvable' });

    if (doc.download_link) {
      await db.storage.from('documents').remove([doc.download_link]);
    }

    const { error: delErr } = await db
      .from('document')
      .delete()
      .eq('id_document', id)
      .eq('user_id', req.user.id);

    if (delErr) throw delErr;

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
