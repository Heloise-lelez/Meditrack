import { Router } from 'express';
import { listRendezvous, nextRendezvous, createRendezvous } from '../controllers/rendezvousController.js';

const router = Router();

router.get('/next', nextRendezvous);
router.get('/', listRendezvous);
router.post('/', createRendezvous);

export default router;
