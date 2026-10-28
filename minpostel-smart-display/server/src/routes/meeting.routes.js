import { Router } from 'express';
import {
  getMeetings,
  createMeeting,
  updateMeetingStatus,
  deleteMeeting,
  updateMeeting
} from '../controllers/meeting.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getMeetings);
router.post('/', authenticateToken, createMeeting);
router.put('/:id', authenticateToken, updateMeeting);
router.patch('/:id/status', authenticateToken, updateMeetingStatus);
router.delete('/:id', authenticateToken, deleteMeeting);

export default router;
