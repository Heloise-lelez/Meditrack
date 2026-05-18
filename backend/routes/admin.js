import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listUsers, updateUserRole } from '../controllers/adminController.js';

const router = Router();
const isSuperAdmin = [requireAuth, requireRole('SUPER_ADMIN')];

router.get('/users', ...isSuperAdmin, listUsers);
router.put('/users/:id/role', ...isSuperAdmin, updateUserRole);

export default router;
