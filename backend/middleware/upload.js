import multer from 'multer';
import { auditEvent, auditError } from '../lib/auditLogger.js';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(req, file, cb) {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      void auditEvent(req, 'file.upload.accepted_by_filter', {
        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
        },
      });
      cb(null, true);
    } else {
      void auditEvent(req, 'file.upload.rejected_by_filter', {
        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
        },
      });
      cb(new Error('Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, WebP, GIF.'));
    }
  },
});

export function handleUploadError(err, req, res) {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    void auditError(req, 'file.upload.too_large', err);
    return res.status(413).json({
      error: `Fichier trop volumineux. Taille maximale : ${MAX_SIZE_BYTES / 1024 / 1024} Mo.`,
    });
  }
  if (err) {
    void auditError(req, 'file.upload.middleware_error', err);
    return res.status(400).json({ error: err.message });
  }
}
