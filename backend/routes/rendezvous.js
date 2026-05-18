import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listRendezvous, nextRendezvous, createRendezvous, deleteRendezvous } from '../controllers/rendezvousController.js';

const router = Router();
router.use(requireAuth);

router.get('/next', nextRendezvous);
router.get('/', listRendezvous);
router.post('/', createRendezvous);
router.delete('/:id', deleteRendezvous);

export default router;
