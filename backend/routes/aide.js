import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listMyPatients,
  getPatientTaches,
  getPatientEtapes,
  getPatientRendezvous,
} from '../controllers/aideController.js';

const router = Router();
const isAide = [requireAuth, requireRole('AIDE')];

// Liste des patients assignés à l'aide connecté
router.get('/patients', ...isAide, listMyPatients);

// Détail d'un patient : tâches du jour, étapes, rendez-vous (lecture seule)
router.get('/patients/:patientId/taches', ...isAide, getPatientTaches);
router.get('/patients/:patientId/etapes', ...isAide, getPatientEtapes);
router.get('/patients/:patientId/rendezvous', ...isAide, getPatientRendezvous);

export default router;
