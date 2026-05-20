import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getMyDoctors,
  getMyRole,
  listDoctors,
  getMyAides,
  updateProfile,
} from '../controllers/profileController.js';

const router = Router();

router.get('/my-role', requireAuth, getMyRole);
router.get('/my-doctors', requireAuth, getMyDoctors);
router.get('/my-aides', requireAuth, getMyAides);
router.get('/doctors', requireAuth, listDoctors);
router.put('/update/:id', requireAuth, updateProfile);

export default router;
