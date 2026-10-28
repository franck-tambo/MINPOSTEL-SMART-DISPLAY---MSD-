import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Public health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    system: 'MINPOSTEL Smart Display (MSD) API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
