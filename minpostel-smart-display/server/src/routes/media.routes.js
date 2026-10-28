import { Router } from 'express';
import { getMediaList, uploadMiddleware, handleUploadMedia, deleteMedia } from '../controllers/media.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getMediaList);
router.post('/upload', authenticateToken, uploadMiddleware, handleUploadMedia);
router.delete('/:id', authenticateToken, deleteMedia);

export default router;
