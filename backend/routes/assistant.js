import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listPatients,
  listDoctors,
  listAssignments,
  createAssignment,
  deleteAssignment,
  listAides,
  createAideAccount,
  assignAideToPatient,
  removeAideFromPatient,
  listAideAssignments,
  listMyChirurgies,
  checkChirurgieStep,
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
router.get('/aide-assignments', ...isAssistant, listAideAssignments);
router.post('/aides', ...isAssistant, createAideAccount);
router.post('/aides/assign', ...isAssistant, assignAideToPatient);
router.delete('/aides/assign', ...isAssistant, removeAideFromPatient);

// Chirurgies
router.get('/chirurgies', ...isAssistant, listMyChirurgies);
router.patch('/chirurgies/:id/step', ...isAssistant, checkChirurgieStep);

export default router;
