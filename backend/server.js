import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import rendezvousRouter from './routes/rendezvous.js';
import documentsRouter from './routes/documents.js';
import tachesRouter from './routes/taches.js';
import etapesRouter from './routes/etapes.js';
import profileRouter from './routes/profile.js';
import adminRouter from './routes/admin.js';
import doctorRouter from './routes/doctor.js';
import assistantRouter from './routes/assistant.js';
import aideRouter from './routes/aide.js';
import auditRouter from './routes/audit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { auditRequestLogger } from './middleware/audit.js';
import Pyroscope from '@pyroscope/nodejs';

Pyroscope.init({
  serverAddress: process.env.PYROSCOPE_SERVER_ADDRESS,
  appName: 'meditrack-backend',
  basicAuthUser: process.env.PYROSCOPE_USER,
  basicAuthPassword: process.env.PYROSCOPE_TOKEN,
  logLevel: 'debug', // force les logs, même les erreurs internes
});
Pyroscope.start();

const app = express();
const trustProxy = ['1', 'true', 'yes'].includes(String(process.env.TRUST_PROXY).toLowerCase());

if (process.env.VERCEL || trustProxy) {
  app.set('trust proxy', true);
}

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());
app.use(auditRequestLogger);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/rendezvous', rendezvousRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/taches', tachesRouter);
app.use('/api/etapes', etapesRouter);
app.use('/api/profile', profileRouter);
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/aide', aideRouter);
app.use('/api/audit', auditRouter);

app.use(errorHandler);

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
