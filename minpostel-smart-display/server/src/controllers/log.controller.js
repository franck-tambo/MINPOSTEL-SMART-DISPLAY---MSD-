import { sendSuccess, sendError } from '../utils/response.util.js';
import { store, recordActivityLog, saveStore } from '../utils/store.util.js';

export const getActivityLogs = (req, res) => {
  let list = Array.isArray(store.logs) ? [...store.logs] : [];

  const { action, entity_type, search, limit } = req.query;

  if (action && action !== 'ALL') {
    list = list.filter(l => l.action === action.toUpperCase());
  }

  if (entity_type && entity_type !== 'ALL') {
    list = list.filter(l => l.entity_type === entity_type.toUpperCase());
  }

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    list = list.filter(l =>
      (l.description && l.description.toLowerCase().includes(q)) ||
      (l.user && l.user.toLowerCase().includes(q)) ||
      (l.ip_address && l.ip_address.includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.entity_type && l.entity_type.toLowerCase().includes(q))
    );
  }

  const max = limit ? parseInt(limit, 10) : 300;
  return sendSuccess(res, 'Journal d\'activités récupéré', list.slice(0, max));
};

export const clearActivityLogs = (req, res) => {
  store.logs = [];
  saveStore();

  const io = req.app.get('io');
  if (io) {
    io.emit('ACTIVITY_LOGS_CLEARED');
  }

  recordActivityLog({
    action: 'CLEAR_LOGS',
    entity_type: 'AUDIT',
    description: 'Réinitialisation du journal d\'audit et des activités par l\'administrateur',
    req
  });

  return sendSuccess(res, 'Journal d\'activités réinitialisé avec succès');
};

