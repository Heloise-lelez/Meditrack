import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listTaches, updateTacheStatut } from '../controllers/tachesController.js';

const router = Router();

router.get('/', requireAuth, listTaches);
router.put('/:id', requireAuth, updateTacheStatut);

export default router;
