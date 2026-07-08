import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import {
  listDocuments,
  createDocument,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from '../controllers/documentsController.js';
import { faker } from '@faker-js/faker';

const router = Router();

// Route de test perf
router.get('/heavy-report', (req, res) => {
  const start = Date.now();
  const dossiers = Array.from({ length: 50000 }, () => ({
    id: faker.string.uuid(),
    patient: faker.person.fullName(),
    dateRdv: faker.date.recent({ days: 90 }),
    statut: faker.helpers.arrayElement(['en_attente', 'termine', 'en_retard']),
    document: faker.lorem.paragraph(),
  }));

  const resultat = dossiers
    .filter((d) => d.statut !== 'termine')
    .sort((a, b) => new Date(b.dateRdv) - new Date(a.dateRdv))
    .filter((d) => d.patient.length > 5)
    .map((d) => ({ ...d, label: `${d.statut.toUpperCase()} - ${d.patient}` }));

  const duration = Date.now() - start;
  console.log(`heavy-report traité en ${duration}ms`);
  res.json({ count: resultat.length, duration_ms: duration, sample: resultat.slice(0, 5) });
});

router.use(requireAuth); // tout ce qui suit reste protégé
router.get('/', listDocuments);
router.get('/:id/download', downloadDocument);
router.post('/', createDocument);
router.post(
  '/upload',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (!err) return next();
      handleUploadError(err, req, res);
    });
  },
  uploadDocument
);
router.delete('/:id', deleteDocument);
export default router;
