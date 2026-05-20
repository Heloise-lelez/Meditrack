import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listRendezvous,
  nextRendezvous,
  createRendezvous,
  deleteRendezvous,
  updateRdvChecklist,
} from '../controllers/rendezvousController.js';

const router = Router();
router.use(requireAuth);

router.get('/next', nextRendezvous);
router.get('/', listRendezvous);
router.post('/', createRendezvous);
router.put('/:id', updateRdvChecklist);
router.delete('/:id', deleteRendezvous);

export default router;
