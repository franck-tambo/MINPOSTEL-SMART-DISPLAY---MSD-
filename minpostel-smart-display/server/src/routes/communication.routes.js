import { Router } from 'express';
import {
  getCommunications,
  createCommunication,
  updateCommunication,
  deleteCommunication,
  togglePublishCommunication
} from '../controllers/communication.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getCommunications);
router.post('/', authenticateToken, createCommunication);
router.put('/:id', authenticateToken, updateCommunication);
router.delete('/:id', authenticateToken, deleteCommunication);
router.patch('/:id/publish', authenticateToken, togglePublishCommunication);

export default router;
