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

// Cache en mémoire : données sources + résultat du calcul déjà agrégé
let cachedDossiers = null;
let cachedReport = null;

function getDossiers() {
  if (!cachedDossiers) {
    cachedDossiers = Array.from({ length: 50000 }, () => ({
      id: faker.string.uuid(),
      patient: faker.person.fullName(),
      dateRdv: faker.date.recent({ days: 90 }),
      statut: faker.helpers.arrayElement(['en_attente', 'termine', 'en_retard']),
      document: faker.lorem.paragraph(),
    }));
  }
  return cachedDossiers;
}

function computeReport() {
  return getDossiers()
    .filter((d) => d.statut !== 'termine' && d.patient.length > 5)
    .sort((a, b) => b.dateRdv - a.dateRdv)
    .map((d) => ({ ...d, label: `${d.statut.toUpperCase()} - ${d.patient}` }));
}

// Route de test perf : le calcul (filter+sort+map sur 50k lignes) n'est fait
// qu'une fois par instance chaude, les requêtes suivantes lisent le cache.
router.get('/heavy-report', (req, res) => {
  const start = Date.now();
  const cacheHit = cachedReport !== null;
  if (!cacheHit) {
    cachedReport = computeReport();
  }

  const duration = Date.now() - start;
  console.log(`heavy-report ${cacheHit ? 'cache HIT' : 'cache MISS'} en ${duration}ms`);
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  res.json({ count: cachedReport.length, duration_ms: duration, sample: cachedReport.slice(0, 5) });
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
