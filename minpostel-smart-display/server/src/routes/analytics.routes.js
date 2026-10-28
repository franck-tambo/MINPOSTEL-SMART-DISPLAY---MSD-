import { Router } from 'express';
import { recordScan, getAnalytics } from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public endpoint for QR scanning
router.get('/scan', recordScan);

// Protected endpoint for dashboard
router.get('/', authenticateToken, getAnalytics);

export default router;
