import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listPatients,
  listDoctors,
  listAssignments,
  createAssignment,
  deleteAssignment,
<<<<<<< HEAD
  listAides,
  createAideAccount,
  assignAideToPatient,
  removeAideFromPatient,
  listAideAssignments,
=======
  createAideAccount,
  listAides,
  assignAideToPatient,
  removeAideFromPatient,
>>>>>>> a793900 (feat: auth role aide - RLS read-only policies, assistant aide management endpoints)
} from '../controllers/assistantController.js';

const router = Router();
const isAssistant = [requireAuth, requireRole('ASSISTANT')];

router.get('/patients', ...isAssistant, listPatients);
router.get('/doctors', ...isAssistant, listDoctors);
router.get('/assignments', ...isAssistant, listAssignments);
router.post('/assignments', ...isAssistant, createAssignment);
router.delete('/assignments', ...isAssistant, deleteAssignment);

// Gestion des aides
router.get('/aides', ...isAssistant, listAides);
<<<<<<< HEAD
router.get('/aide-assignments', ...isAssistant, listAideAssignments);
=======
>>>>>>> a793900 (feat: auth role aide - RLS read-only policies, assistant aide management endpoints)
router.post('/aides', ...isAssistant, createAideAccount);
router.post('/aides/assign', ...isAssistant, assignAideToPatient);
router.delete('/aides/assign', ...isAssistant, removeAideFromPatient);

export default router;
