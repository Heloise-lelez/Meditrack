import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import {
  listDocuments,
  createDocument,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from '../controllers/documentsController.js';

const router = Router();
router.use(requireAuth);

router.get('/', listDocuments);
router.get('/:id/download', downloadDocument);
router.post('/', createDocument);
router.post(
  '/upload',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (!err) return next();
      handleUploadError(err, req, res);
    });
  },
  uploadDocument
);
router.delete('/:id', deleteDocument);

export default router;
