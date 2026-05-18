import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import rendezvousRouter from './routes/rendezvous.js';
import documentsRouter from './routes/documents.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/rendezvous', rendezvousRouter);
app.use('/api/documents', documentsRouter);

app.use(errorHandler);

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
