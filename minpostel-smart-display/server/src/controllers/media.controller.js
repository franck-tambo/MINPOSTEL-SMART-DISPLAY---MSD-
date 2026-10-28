import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File Filter for Security (Allowlist: JPG, PNG, WEBP, MP4, WEBM)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, MP4, WEBM'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB Max
}).single('file');

let mockMediaList = [
  {
    id: 1,
    filename: 'minpostel_banner.png',
    original_name: 'Logo_Officiel_MINPOSTEL.png',
    mime_type: 'image/png',
    file_size: 450000,
    file_path: '/uploads/minpostel_banner.png',
    language: 'BOTH',
    description: 'Bannière officielle du ministère',
    created_at: '2026-09-15T10:00:00.000Z'
  }
];

export const getMediaList = (req, res) => {
  return sendSuccess(res, 'Médiathèque récupérée', mockMediaList);
};

export const handleUploadMedia = (req, res) => {
  if (!req.file) {
    return sendValidationError(res, 'Veuillez sélectionner un fichier media');
  }

  const newMedia = {
    id: Date.now(),
    filename: req.file.filename,
    original_name: req.file.originalname,
    mime_type: req.file.mimetype,
    file_size: req.file.size,
    file_path: `/uploads/${req.file.filename}`,
    language: req.body.language || 'BOTH',
    description: req.body.description || 'Fichier téléversé',
    created_at: new Date().toISOString()
  };

  mockMediaList.unshift(newMedia);
  logger.info(`Media uploaded successfully: ${req.file.originalname}`);

  return sendSuccess(res, 'Fichier téléversé avec succès', newMedia, 201);
};

export const deleteMedia = (req, res) => {
  const id = parseInt(req.params.id, 10);
  mockMediaList = mockMediaList.filter(m => m.id !== id);
  return sendSuccess(res, 'Média supprimé');
};
