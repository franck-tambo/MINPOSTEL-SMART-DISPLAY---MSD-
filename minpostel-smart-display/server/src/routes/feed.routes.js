import { Router } from 'express';
import { getFeeds } from '../controllers/feed.controller.js';

const router = Router();

router.get('/ticker', getFeeds);

export default router;
