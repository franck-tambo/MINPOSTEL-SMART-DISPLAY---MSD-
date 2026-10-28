import { Router } from 'express';
import { getActivityLogs, clearActivityLogs } from '../controllers/log.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', authenticateToken, getActivityLogs);
router.delete('/', authenticateToken, clearActivityLogs);

export default router;
