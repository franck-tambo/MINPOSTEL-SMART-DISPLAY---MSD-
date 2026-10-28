import { Router } from 'express';
import { getSettings, updateSettings, restartTunnelHandler } from '../controllers/setting.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', getSettings);
router.put('/', authenticateToken, updateSettings);
router.post('/tunnel/restart', authenticateToken, restartTunnelHandler);

export default router;
