import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listEtapes, updateEtapeChecklist } from '../controllers/etapesController.js';

const router = Router();

router.get('/', requireAuth, listEtapes);
router.put('/:id', requireAuth, updateEtapeChecklist);

export default router;
