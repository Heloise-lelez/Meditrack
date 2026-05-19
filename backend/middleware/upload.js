import multer from 'multer';

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
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, WebP, GIF.'));
    }
  },
});

export function handleUploadError(err, res) {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: `Fichier trop volumineux. Taille maximale : ${MAX_SIZE_BYTES / 1024 / 1024} Mo.`,
    });
  }
  if (err) return res.status(400).json({ error: err.message });
}
