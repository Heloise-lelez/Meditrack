import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import {
  listMyPatients,
  listPatientRendezvous,
  createPatientRendezvous,
  deletePatientRendezvous,
  listPatientTaches,
  createPatientTache,
  deletePatientTache,
  listPatientEtapes,
  createPatientEtape,
  deletePatientEtape,
  listPatientDocuments,
  uploadDocumentForPatient,
  getMyProfile,
  updateMyProfile,
  searchPatients,
  selfAssign,
  selfUnassign,
} from '../controllers/doctorController.js';

const router = Router();
const isDoctor = [requireAuth, requireRole('DOCTOR')];

// Profile routes must come before /patients/:pid to avoid param capture
router.get('/profile', ...isDoctor, getMyProfile);
router.put('/profile', ...isDoctor, updateMyProfile);

router.get('/patients/search', ...isDoctor, searchPatients);
router.post('/patients/self-assign', ...isDoctor, selfAssign);
router.delete('/patients/self-unassign', ...isDoctor, selfUnassign);

router.get('/patients', ...isDoctor, listMyPatients);

router.get('/patients/:pid/rendezvous', ...isDoctor, listPatientRendezvous);
router.post('/patients/:pid/rendezvous', ...isDoctor, createPatientRendezvous);
router.delete('/patients/:pid/rendezvous/:id', ...isDoctor, deletePatientRendezvous);

router.get('/patients/:pid/taches', ...isDoctor, listPatientTaches);
router.post('/patients/:pid/taches', ...isDoctor, createPatientTache);
router.delete('/patients/:pid/taches/:id', ...isDoctor, deletePatientTache);

router.get('/patients/:pid/etapes', ...isDoctor, listPatientEtapes);
router.post('/patients/:pid/etapes', ...isDoctor, createPatientEtape);
router.delete('/patients/:pid/etapes/:id', ...isDoctor, deletePatientEtape);

router.get('/patients/:pid/documents', ...isDoctor, listPatientDocuments);
router.post(
  '/patients/:pid/documents/upload',
  ...isDoctor,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (!err) return next();
      handleUploadError(err, res);
    });
  },
  uploadDocumentForPatient
);

export default router;
