import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listPatients, listDoctors, listAssignments, createAssignment, deleteAssignment } from '../controllers/assistantController.js';

const router = Router();
const isAssistant = [requireAuth, requireRole('ASSISTANT')];

router.get('/patients', ...isAssistant, listPatients);
router.get('/doctors', ...isAssistant, listDoctors);
router.get('/assignments', ...isAssistant, listAssignments);
router.post('/assignments', ...isAssistant, createAssignment);
router.delete('/assignments', ...isAssistant, deleteAssignment);

export default router;
