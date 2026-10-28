import AnnouncementModel from '../models/announcement.model.js';
import { supabase } from '../config/supabase.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';
import { store, saveStore, recordActivityLog } from '../utils/store.util.js';

export const getAnnouncements = async (req, res) => {
  try {
    // 1. Try Supabase REST API only if reachable
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return sendSuccess(res, 'Annonces récupérées (Supabase Cloud)', data);
        }
      } catch (sbErr) {
        logger.warn('Supabase query error:', sbErr.message);
      }
    }

    // 2. Try Database Model
    try {
      const items = await AnnouncementModel.findAll();
      if (items && items.length > 0) {
        return sendSuccess(res, 'Annonces récupérées', items);
      }
    } catch (e) {
      // Fallback
    }

    // 3. Instant local persistent store (< 1ms)
    return sendSuccess(res, 'Annonces récupérées', store.announcements);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title_fr, title_en, description_fr, description_en, priority, start_date, end_date, media_id } = req.body;

    if (!title_fr || !title_en || !description_fr || !description_en || !start_date || !end_date) {
      return sendValidationError(res, 'Champs FR/EN et dates obligatoires');
    }

    const payload = {
      title_fr,
      title_en,
      description_fr,
      description_en,
      priority: priority || 'NORMAL',
      status: req.body.status || 'PUBLISHED',
      start_date,
      end_date,
      media_url: req.body.media_url || '',
      card_color: req.body.card_color || '#134074',
      created_by: req.user?.id || 1
    };

    let createdItem = { id: Date.now(), ...payload };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('announcements').insert([payload]).select();
        if (!error && data && data.length > 0) {
          createdItem = data[0];
        }
      } catch (sbErr) {
        logger.warn('Supabase insert fallback:', sbErr.message);
      }
    }

    store.announcements.unshift(createdItem);
    saveStore();

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_CREATED', { entityType: 'ANNOUNCEMENT', item: createdItem });
    }

    logger.info(`Announcement created: ${title_fr}`);
    recordActivityLog({
      action: 'CREATE',
      entity_type: 'ANNOUNCEMENT',
      description: `Création de l'annonce : "${createdItem.title_fr}"`,
      req
    });
    return sendSuccess(res, 'Annonce créée avec succès', createdItem, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;

    if (supabase) {
      try {
        await supabase.from('announcements').update(data).eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase update fallback:', sbErr.message);
      }
    }

    const idx = store.announcements.findIndex(item => item.id === id);
    if (idx !== -1) {
      store.announcements[idx] = { ...store.announcements[idx], ...data };
      saveStore();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_UPDATED', { entityType: 'ANNOUNCEMENT', id, item: data });
    }

    recordActivityLog({
      action: 'UPDATE',
      entity_type: 'ANNOUNCEMENT',
      description: `Mise à jour de l'annonce #${id} (${data.title_fr || 'Données modifiées'})`,
      req
    });

    return sendSuccess(res, 'Annonce mise à jour');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const targetItem = store.announcements.find(item => item.id === id);

    if (supabase) {
      try {
        await supabase.from('announcements').delete().eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase delete fallback:', sbErr.message);
      }
    }

    store.announcements = store.announcements.filter(item => item.id !== id);
    saveStore();

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_DELETED', { entityType: 'ANNOUNCEMENT', id });
    }

    recordActivityLog({
      action: 'DELETE',
      entity_type: 'ANNOUNCEMENT',
      description: `Suppression de l'annonce #${id} (${targetItem?.title_fr || 'Titre inconnu'})`,
      req
    });

    return sendSuccess(res, 'Annonce supprimée');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const togglePublishAnnouncement = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (supabase) {
      try {
        await supabase.from('announcements').update({ status }).eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase publish fallback:', sbErr.message);
      }
    }

    const item = store.announcements.find(i => i.id === id);
    if (item) {
      item.status = status;
      saveStore();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_PUBLISHED', { entityType: 'ANNOUNCEMENT', id, status });
    }

    return sendSuccess(res, `Annonce passée en statut ${status}`);
  } catch (err) {
    return sendError(res, err.message);
  }
};
