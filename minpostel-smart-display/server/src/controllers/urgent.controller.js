import { sendSuccess, sendError, sendValidationError } from '../utils/response.util.js';
import { store, saveStore, recordActivityLog } from '../utils/store.util.js';

export const getUrgentMessages = (req, res) => {
  // Ensure existing items have proper history structure for traceability
  store.urgentMessages.forEach(item => {
    if (!item.broadcasted_at && item.start_time) {
      item.broadcasted_at = item.start_time;
    }
    if (!Array.isArray(item.broadcast_history) || item.broadcast_history.length === 0) {
      if (item.broadcasted_at || item.start_time) {
        item.broadcast_history = [
          {
            broadcasted_at: item.broadcasted_at || item.start_time,
            stopped_at: item.stopped_at || (item.status === 'INACTIVE' ? item.end_time || null : null)
          }
        ];
      } else {
        item.broadcast_history = [];
      }
    }
  });

  return sendSuccess(res, 'Messages urgents récupérés', store.urgentMessages);
};

export const broadcastUrgentMessage = (req, res) => {
  const { message_fr, message_en, priority } = req.body;

  if (!message_fr || !message_en) {
    return sendValidationError(res, 'Message FR et EN obligatoires');
  }

  const now = new Date().toISOString();

  // Stop any other active message first
  store.urgentMessages.forEach(m => {
    if (m.status === 'ACTIVE') {
      m.status = 'INACTIVE';
      m.stopped_at = now;
      if (Array.isArray(m.broadcast_history)) {
        const lastSession = [...m.broadcast_history].reverse().find(s => !s.stopped_at);
        if (lastSession) {
          lastSession.stopped_at = now;
          lastSession.duration_seconds = Math.max(0, Math.round((new Date(now) - new Date(lastSession.broadcasted_at)) / 1000));
        }
      }
    }
  });

  const newItem = {
    id: Date.now(),
    message_fr,
    message_en,
    priority: priority || 'CRITICAL',
    status: 'ACTIVE',
    start_time: now,
    broadcasted_at: now,
    stopped_at: null,
    broadcast_history: [
      {
        broadcasted_at: now,
        stopped_at: null
      }
    ],
    end_time: new Date(Date.now() + 2 * 3600000).toISOString() // 2 hours default
  };

  store.urgentMessages.unshift(newItem);
  saveStore();

  const io = req.app.get('io');
  if (io) {
    io.emit('URGENT_MESSAGE_STARTED', { urgentMessage: newItem });
  }

  recordActivityLog({
    action: 'BROADCAST',
    entity_type: 'URGENT_MESSAGE',
    description: `Diffusion d'alerte urgente : "${newItem.message_fr.substring(0, 40)}..."`,
    req
  });

  return sendSuccess(res, '🚨 Message urgent diffusé immédiatement sur l\'écran', newItem, 201);
};

export const dismissUrgentMessage = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = store.urgentMessages.find(m => m.id === id);
  const now = new Date().toISOString();

  if (item) {
    item.status = 'INACTIVE';
    item.stopped_at = now;

    if (!Array.isArray(item.broadcast_history)) {
      item.broadcast_history = [
        {
          broadcasted_at: item.broadcasted_at || item.start_time || now,
          stopped_at: now,
          duration_seconds: Math.max(0, Math.round((new Date(now) - new Date(item.broadcasted_at || item.start_time || now)) / 1000))
        }
      ];
    } else {
      const openSession = [...item.broadcast_history].reverse().find(s => !s.stopped_at);
      if (openSession) {
        openSession.stopped_at = now;
        openSession.duration_seconds = Math.max(0, Math.round((new Date(now) - new Date(openSession.broadcasted_at)) / 1000));
      } else {
        item.broadcast_history.push({
          broadcasted_at: item.broadcasted_at || item.start_time || now,
          stopped_at: now,
          duration_seconds: Math.max(0, Math.round((new Date(now) - new Date(item.broadcasted_at || item.start_time || now)) / 1000))
        });
      }
    }
    saveStore();
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('URGENT_MESSAGE_ENDED', { id });
  }

  recordActivityLog({
    action: 'DISMISS',
    entity_type: 'URGENT_MESSAGE',
    description: `Interruption de diffusion de l'alerte #${id}`,
    req
  });

  return sendSuccess(res, 'Message urgent désactivé. Retour à la rotation normale.');
};

export const rebroadcastUrgentMessage = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = store.urgentMessages.find(m => m.id === id);
  if (!item) {
    return sendError(res, 'Message introuvable', 404);
  }

  const now = new Date().toISOString();

  // Stop any other active messages
  store.urgentMessages.forEach(m => {
    if (m.status === 'ACTIVE' && m.id !== id) {
      m.status = 'INACTIVE';
      m.stopped_at = now;
      if (Array.isArray(m.broadcast_history)) {
        const lastSession = [...m.broadcast_history].reverse().find(s => !s.stopped_at);
        if (lastSession) {
          lastSession.stopped_at = now;
          lastSession.duration_seconds = Math.max(0, Math.round((new Date(now) - new Date(lastSession.broadcasted_at)) / 1000));
        }
      }
    }
  });

  item.status = 'ACTIVE';
  item.broadcasted_at = now;
  item.start_time = now;
  item.stopped_at = null;
  if (!Array.isArray(item.broadcast_history)) {
    item.broadcast_history = [];
  }
  item.broadcast_history.push({
    broadcasted_at: now,
    stopped_at: null
  });

  saveStore();

  const io = req.app.get('io');
  if (io) {
    io.emit('URGENT_MESSAGE_STARTED', { urgentMessage: item });
  }

  recordActivityLog({
    action: 'BROADCAST',
    entity_type: 'URGENT_MESSAGE',
    description: `Re-diffusion de l'alerte #${id} : "${item.message_fr.substring(0, 40)}..."`,
    req
  });

  return sendSuccess(res, '🚨 Message urgent re-diffusé immédiatement sur l\'écran', item);
};

export const deleteUrgentMessage = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.urgentMessages.findIndex(m => m.id === id);
  if (idx === -1) {
    return sendError(res, 'Message introuvable', 404);
  }

  const item = store.urgentMessages[idx];

  // If the message was still active, signal the display to stop showing it
  if (item.status === 'ACTIVE') {
    const io = req.app.get('io');
    if (io) io.emit('URGENT_MESSAGE_ENDED', { id });
  }

  store.urgentMessages.splice(idx, 1);
  saveStore();

  recordActivityLog({
    action: 'DELETE',
    entity_type: 'URGENT_MESSAGE',
    description: `Suppression définitive de l'alerte #${id}`,
    req
  });

  return sendSuccess(res, 'Message urgent supprimé de l\'historique.');
};

