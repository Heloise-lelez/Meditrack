import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
  res.json({
    status: 'ok',
    version: '1.0.0',
    generated_at: new Date().toISOString(),
  });
});

export default router;
