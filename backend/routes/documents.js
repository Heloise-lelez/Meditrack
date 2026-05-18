import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import { listDocuments, createDocument, uploadDocument, getDocumentUrl, deleteDocument } from '../controllers/documentsController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listDocuments);
router.get('/:id/url', getDocumentUrl);
router.post('/', createDocument);
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    handleUploadError(err, res);
  });
}, uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
