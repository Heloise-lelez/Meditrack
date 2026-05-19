import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listUsers,
  updateUserRole,
  listEtablissements,
  createEtablissement,
  updateUserEtablissement,
} from '../controllers/adminController.js';

const router = Router();
const isSuperAdmin = [requireAuth, requireRole('SUPER_ADMIN')];

router.get('/users', ...isSuperAdmin, listUsers);
router.put('/users/:id/role', ...isSuperAdmin, updateUserRole);
router.put('/users/:id/etablissement', ...isSuperAdmin, updateUserEtablissement);

router.get('/etablissements', ...isSuperAdmin, listEtablissements);
router.post('/etablissements', ...isSuperAdmin, createEtablissement);

export default router;
