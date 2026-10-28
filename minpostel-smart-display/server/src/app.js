import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import eventRoutes from './routes/event.routes.js';
import communicationRoutes from './routes/communication.routes.js';
import urgentRoutes from './routes/urgent.routes.js';
import locationRoutes from './routes/location.routes.js';
import mediaRoutes from './routes/media.routes.js';
import logRoutes from './routes/log.routes.js';
import settingRoutes from './routes/setting.routes.js';
import feedRoutes from './routes/feed.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disabled for local dev/kiosk media loading
}));

// CORS Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Uploads Folder
app.use('/uploads', express.static('uploads'));

// Serve Static Frontend SPA Build
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/urgent-messages', urgentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/weather', weatherRoutes);

// SPA Fallback for Mobile Visitor & Display routes
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 & Global Error Handlers (for unhandled API routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
