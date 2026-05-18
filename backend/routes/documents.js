import { Router } from 'express';
import { listDocuments, createDocument } from '../controllers/documentsController.js';

const router = Router();

router.get('/', listDocuments);
router.post('/', createDocument);

export default router;
