import { Router } from 'express';
import { getUrgentMessages, broadcastUrgentMessage, dismissUrgentMessage, rebroadcastUrgentMessage, deleteUrgentMessage } from '../controllers/urgent.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', getUrgentMessages);
router.post('/', authenticateToken, broadcastUrgentMessage);
router.patch('/:id/dismiss', authenticateToken, dismissUrgentMessage);
router.post('/:id/rebroadcast', authenticateToken, rebroadcastUrgentMessage);
router.delete('/:id', authenticateToken, deleteUrgentMessage);

export default router;
