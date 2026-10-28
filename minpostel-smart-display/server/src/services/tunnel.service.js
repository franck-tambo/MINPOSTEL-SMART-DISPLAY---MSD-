import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { store, saveStore } from '../utils/store.util.js';
import logger from '../utils/logger.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getLocalIpAddress } from '../utils/store.util.js';

let tunnelProcess = null;
let currentTunnelUrl = null;
let isRestarting = false;
let retryTimer = null;
let retryCount = 0;
let isRateLimited = false;

// Search for cloudflared binary in common paths
function findCloudflaredBinary() {
  const possiblePaths = [
    path.resolve(__dirname, '../../cloudflared.exe'),
    path.resolve(__dirname, '../../../cloudflared.exe'),
    path.resolve(__dirname, '../../../../cloudflared.exe'),
    'cloudflared.exe',
    'cloudflared'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

/**
 * Automatically starts and maintains Cloudflare Tunnel
 * so anyone on mobile data (4G/5G) can scan the QR code and load visitor guide
 */
export function startTunnelService(io) {
  const binaryPath = findCloudflaredBinary();
  if (!binaryPath) {
    logger.warn('[TUNNEL] cloudflared.exe not found. Public tunnel not started.');
    return;
  }

  console.log('[TUNNEL] Found cloudflared binary at:', binaryPath);
  launchTunnel(binaryPath, io);
}

function launchTunnel(binaryPath, io) {
  if (tunnelProcess) {
    try { tunnelProcess.kill(); } catch (e) {}
    tunnelProcess = null;
  }

  console.log('[TUNNEL] Initializing live public HTTPS tunnel to port 5000...');
  
  // Point tunnel to Express server (port 5000) which serves both API and Client SPA
  tunnelProcess = spawn(binaryPath, ['tunnel', '--url', 'http://127.0.0.1:5000'], {
    windowsHide: true
  });

  const handleOutput = (data) => {
    const text = data.toString();
    
    // Check for error code 1015 / rate limit
    if (text.includes('429') || text.includes('1015') || text.toLowerCase().includes('rate limit')) {
      isRateLimited = true;
    }

    // Check for real trycloudflare.com URL - EXCLUDE api.trycloudflare.com
    const match = text.match(/https:\/\/(?!api\.)[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && match[0] && match[0] !== currentTunnelUrl) {
      currentTunnelUrl = match[0];
      isRateLimited = false;
      retryCount = 0;
      
      console.log('\n========================================================================');
      console.log('🌐 [PUBLIC MOBILE ACCESS ACTIVE]');
      console.log('📱 QR Codes are now live for ANY phone on ANY network (4G/5G/Wi-Fi):');
      console.log(`👉 ${currentTunnelUrl}/visitor`);
      console.log('========================================================================\n');

      // Update store settings with live public URL
      store.settings.public_base_url = currentTunnelUrl;
      saveStore();

      // Notify Display Screen & Admin in real time to re-render QR codes immediately
      if (io) {
        io.emit('SETTINGS_UPDATED', {
          ...store.settings,
          public_base_url: currentTunnelUrl,
          is_tunnel_active: true
        });
      }
    }
  };

  tunnelProcess.stdout.on('data', handleOutput);
  tunnelProcess.stderr.on('data', handleOutput);

  tunnelProcess.on('close', (code) => {
    tunnelProcess = null;
    currentTunnelUrl = null;

    // Purge any stale trycloudflare URL from store
    if (store.settings.public_base_url && store.settings.public_base_url.includes('trycloudflare.com')) {
      store.settings.public_base_url = '';
      saveStore();
      if (io) {
        io.emit('SETTINGS_UPDATED', {
          ...store.settings,
          public_base_url: '',
          is_tunnel_active: false
        });
      }
    }

    if (isRestarting) return;

    let delayMs = 15000;
    if (isRateLimited) {
      // Exponential backoff up to 5 minutes so Cloudflare cooldown resets
      delayMs = Math.min(300000, 60000 * Math.pow(2, Math.min(retryCount, 3)));
      retryCount++;
      const localIp = getLocalIpAddress();
      console.warn(`[TUNNEL] Cloudflare Tunnel rate-limited (Code 1015). Cooling down for ${delayMs / 1000}s.`);
      console.log(`[TUNNEL] Notice: Mobile QR access remains 100% active on local Wi-Fi: http://${localIp}:5173/visitor\n`);
    }

    isRestarting = true;
    retryTimer = setTimeout(() => {
      isRestarting = false;
      launchTunnel(binaryPath, io);
    }, delayMs);
  });

  tunnelProcess.on('error', (err) => {
    console.error('[TUNNEL ERROR]', err.message);
  });
}

export function restartTunnel(io) {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  isRestarting = false;
  isRateLimited = false;
  retryCount = 0;
  const binaryPath = findCloudflaredBinary();
  if (binaryPath) {
    launchTunnel(binaryPath, io);
  }
}

export function isTunnelActive() {
  return !!currentTunnelUrl;
}

export function getCurrentTunnelUrl() {
  return currentTunnelUrl;
}

export function stopTunnelService() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (tunnelProcess) {
    try {
      tunnelProcess.kill();
    } catch (e) {}
    tunnelProcess = null;
  }
  currentTunnelUrl = null;
}

export default { startTunnelService, restartTunnel, isTunnelActive, getCurrentTunnelUrl, stopTunnelService };

