import { supabase } from '../config/supabase.js';
import { sendSuccess } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';
import { store, saveStore, recordActivityLog, getLocalIpAddress } from '../utils/store.util.js';
import { restartTunnel, isTunnelActive, getCurrentTunnelUrl } from '../services/tunnel.service.js';

export const getSettings = async (req, res) => {
  const localIp = getLocalIpAddress();
  const port = process.env.CLIENT_PORT || 5173;

  if (supabase) {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (!error && data) {
        store.settings = { ...store.settings, ...data };
        saveStore();
      }
    } catch (e) {
      logger.warn('Supabase settings query fallback:', e.message);
    }
  }

  // Check real-time tunnel state
  const tunnelActive = isTunnelActive();
  const activeTunnel = getCurrentTunnelUrl();
  const publicUrl = tunnelActive ? (activeTunnel || '') : '';

  // Clear stale trycloudflare URLs from store if tunnel is not active
  if (!tunnelActive && store.settings.public_base_url?.includes('trycloudflare.com')) {
    store.settings.public_base_url = '';
    saveStore();
  }

  return sendSuccess(res, 'Paramètres système récupérés', {
    ...store.settings,
    public_base_url: publicUrl,
    local_ip: localIp,
    local_network_url: `http://${localIp}:${port}`,
    is_tunnel_active: tunnelActive
  });
};

export const updateSettings = async (req, res) => {
  // Disallow api.trycloudflare.com as public_base_url
  if (req.body.public_base_url?.includes('api.trycloudflare.com')) {
    req.body.public_base_url = '';
  }

  const changedKeys = Object.keys(req.body).filter(k => store.settings[k] !== req.body[k]);
  store.settings = { ...store.settings, ...req.body };
  saveStore();

  if (supabase) {
    try {
      await supabase.from('settings').upsert({ id: 1, ...store.settings });
    } catch (e) {
      logger.warn('Supabase settings update fallback:', e.message);
    }
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('SETTINGS_UPDATED', {
      ...store.settings,
      local_ip: getLocalIpAddress(),
      local_network_url: `http://${getLocalIpAddress()}:${process.env.CLIENT_PORT || 5173}`,
      is_tunnel_active: isTunnelActive()
    });
  }

  recordActivityLog({
    action: 'SETTINGS',
    entity_type: 'CONFIG',
    description: `Mise à jour des paramètres système (${changedKeys.join(', ') || 'configuration générale'})`,
    req
  });

  return sendSuccess(res, 'Paramètres mis à jour', store.settings);
};

export const restartTunnelHandler = async (req, res) => {
  const io = req.app.get('io');
  restartTunnel(io);
  return sendSuccess(res, 'Tentative de relance du tunnel Cloudflare initiée');
};


