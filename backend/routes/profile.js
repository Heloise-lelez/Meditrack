import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyDoctors, getMyRole } from '../controllers/profileController.js';

const router = Router();

router.get('/my-role', requireAuth, getMyRole);
router.get('/my-doctors', requireAuth, getMyDoctors);

export default router;
