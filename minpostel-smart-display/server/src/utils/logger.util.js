/**
 * Logger Utility
 */

export const logger = {
  info: (msg, meta = '') => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
  },
  error: (msg, err = '') => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, err ? err : '');
  },
  socket: (msg, meta = '') => {
    console.log(`[SOCKET.IO] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
  }
};

export default logger;
