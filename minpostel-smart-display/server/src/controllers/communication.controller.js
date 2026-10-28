import CommunicationModel from '../models/communication.model.js';
import { supabase } from '../config/supabase.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';
import { store, saveStore, recordActivityLog } from '../utils/store.util.js';


export const getCommunications = async (req, res) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('communications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return sendSuccess(res, 'Communications récupérées (Supabase Cloud)', data);
        }
      } catch (sbErr) {
        logger.warn('Supabase comms query error:', sbErr.message);
      }
    }

    try {
      const items = await CommunicationModel.findAll();
      if (items && items.length > 0) {
        return sendSuccess(res, 'Communications récupérées', items);
      }
    } catch (e) {
      // Fallback
    }

    return sendSuccess(res, 'Communications récupérées', store.communications);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getCommunicationById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = store.communications.find(c => c.id === id);
    if (!item) return sendError(res, 'Communication non trouvée', 404);
    return sendSuccess(res, 'Communication récupérée', item);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createCommunication = async (req, res) => {
  try {
    const { title_fr, title_en, content_fr, content_en, priority, visibility, start_date, end_date } = req.body;

    if (!title_fr || !title_en || !content_fr || !content_en) {
      return sendValidationError(res, 'Titres et Contenus FR/EN obligatoires');
    }

    const payload = {
      title_fr,
      title_en,
      content_fr,
      content_en,
      priority: priority || 'NORMAL',
      visibility: visibility || 'PUBLIC',
      status: req.body.status || 'PUBLISHED',
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      media_url: req.body.media_url || '',
      card_color: req.body.card_color || '#134074',
      created_by: req.user?.id || 1
    };

    let createdItem = { id: Date.now(), ...payload };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('communications').insert([payload]).select();
        if (!error && data && data.length > 0) {
          createdItem = data[0];
        }
      } catch (sbErr) {
        logger.warn('Supabase comms insert fallback:', sbErr.message);
      }
    }

    store.communications.unshift(createdItem);
    saveStore();

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_CREATED', { entityType: 'COMMUNICATION', item: createdItem });
    }

    recordActivityLog({
      action: 'CREATE',
      entity_type: 'COMMUNICATION',
      entity_id: createdItem.id,
      description: `Création de l'actualité: "${title_fr}"`,
      req
    });

    logger.info(`Communication created: ${title_fr}`);
    return sendSuccess(res, 'Communication créée avec succès', createdItem, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateCommunication = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;

    if (supabase) {
      try {
        await supabase.from('communications').update(data).eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase comms update fallback:', sbErr.message);
      }
    }

    const idx = store.communications.findIndex(item => item.id === id);
    if (idx !== -1) {
      store.communications[idx] = { ...store.communications[idx], ...data };
      saveStore();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_UPDATED', { entityType: 'COMMUNICATION', id, item: data });
    }

    recordActivityLog({
      action: 'UPDATE',
      entity_type: 'COMMUNICATION',
      entity_id: id,
      description: `Mise à jour de l'actualité #${id} (${data.title_fr || store.communications[idx]?.title_fr || ''})`,
      req
    });

    return sendSuccess(res, 'Communication mise à jour');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteCommunication = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldItem = store.communications.find(item => item.id === id);

    if (supabase) {
      try {
        await supabase.from('communications').delete().eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase comms delete fallback:', sbErr.message);
      }
    }

    store.communications = store.communications.filter(item => item.id !== id);
    saveStore();

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_DELETED', { entityType: 'COMMUNICATION', id });
    }

    recordActivityLog({
      action: 'DELETE',
      entity_type: 'COMMUNICATION',
      entity_id: id,
      description: `Suppression de l'actualité: "${oldItem?.title_fr || `#${id}`}"`,
      req
    });

    return sendSuccess(res, 'Communication supprimée');

  } catch (err) {
    return sendError(res, err.message);
  }
};

export const togglePublishCommunication = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (supabase) {
      try {
        await supabase.from('communications').update({ status }).eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase comms publish fallback:', sbErr.message);
      }
    }

    const item = store.communications.find(i => i.id === id);
    if (item) {
      item.status = status;
      saveStore();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_PUBLISHED', { entityType: 'COMMUNICATION', id, status });
    }

    return sendSuccess(res, `Communication passée en statut ${status}`);
  } catch (err) {
    return sendError(res, err.message);
  }
};
