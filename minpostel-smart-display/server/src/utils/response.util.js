/**
 * Standardized API Response Utilities
 */

export const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

export const sendValidationError = (res, message = 'Validation failed', errors = []) => {
  return res.status(400).json({
    status: 'fail',
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};
