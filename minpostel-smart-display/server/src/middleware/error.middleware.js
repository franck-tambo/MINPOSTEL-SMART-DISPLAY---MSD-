import { sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`API Exception on ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational ? err.message : 'Une erreur serveur est survenue / An internal server error occurred';

  return sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

export const notFoundHandler = (req, res) => {
  return sendError(res, `Route non trouvée / Route not found: ${req.originalUrl}`, 404);
};
