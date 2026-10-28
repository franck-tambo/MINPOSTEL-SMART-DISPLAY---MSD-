import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDisplaySockets } from './sockets/display.socket.js';
import { startPowerManagement } from './services/power.service.js';
import { startTunnelService } from './services/tunnel.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import app from './app.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach Socket.IO to App Request context
app.set('io', io);

// Initialize Display Sockets & Heartbeat Gateway
setupDisplaySockets(io);
startPowerManagement(io);
startTunnelService(io);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERREUR PORT OCCUPÉ] Le port ${PORT} est déjà utilisé par un autre processus.`);
    console.error(`Pour libérer le port, exécutez dans PowerShell :`);
    console.error(`  Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
  } else {
    console.error('[SERVER ERROR]', err);
  }
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`🚀 MINPOSTEL Smart Display Backend Server Running`);
  console.log(`📡 Local:   http://localhost:${PORT}`);
  console.log(`📡 Network: http://192.168.100.64:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});

