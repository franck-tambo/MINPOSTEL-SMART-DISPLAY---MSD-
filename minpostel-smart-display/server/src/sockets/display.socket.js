import logger from '../utils/logger.util.js';

const screenStatusMap = new Map();

export function setupDisplaySockets(io) {
  io.on('connection', (socket) => {
    logger.socket(`Client connected: ${socket.id}`);

    // Register Display Screen
    socket.on('DISPLAY_REGISTER', (data) => {
      const screenId = data?.screenId || 'MINPOSTEL-MAIN-ENTRANCE-01';
      socket.join(screenId);
      socket.join('display_screens');

      screenStatusMap.set(screenId, {
        screenId,
        status: 'ONLINE',
        lastHeartbeat: new Date(),
        ip: socket.handshake.address
      });

      logger.socket(`Display Screen Registered: ${screenId}`);
      io.emit('DISPLAY_STATUS_UPDATE', { screenId, status: 'ONLINE', lastHeartbeat: new Date().toISOString() });
    });

    // Receive Display Heartbeat
    socket.on('DISPLAY_HEARTBEAT', (data) => {
      const screenId = data?.screenId || 'MINPOSTEL-MAIN-ENTRANCE-01';
      const record = screenStatusMap.get(screenId) || {};
      record.status = 'ONLINE';
      record.lastHeartbeat = new Date();
      screenStatusMap.set(screenId, record);

      io.emit('DISPLAY_STATUS_UPDATE', { screenId, status: 'ONLINE', lastHeartbeat: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      logger.socket(`Client disconnected: ${socket.id}`);
    });
  });

  // Background Heartbeat Monitor Interval (Checks every 15 seconds)
  setInterval(() => {
    const now = Date.now();
    screenStatusMap.forEach((info, screenId) => {
      const diffSeconds = (now - new Date(info.lastHeartbeat).getTime()) / 1000;
      if (diffSeconds > 45 && info.status === 'ONLINE') {
        info.status = 'OFFLINE';
        logger.warn(`Display Screen Heartbeat Timeout: ${screenId} marked OFFLINE`);
        io.emit('DISPLAY_STATUS_UPDATE', { screenId, status: 'OFFLINE', lastHeartbeat: info.lastHeartbeat });
      }
    });
  }, 15000);
}
