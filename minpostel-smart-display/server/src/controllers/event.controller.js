import EventModel from '../models/event.model.js';
import { supabase } from '../config/supabase.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';
import { store, saveStore } from '../utils/store.util.js';

export const getEvents = async (req, res) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (!error && data && data.length > 0) {
          return sendSuccess(res, 'Événements récupérés (Supabase Cloud)', data);
        }
      } catch (sbErr) {
        logger.warn('Supabase events query error:', sbErr.message);
      }
    }

    try {
      const items = await EventModel.findAll();
      if (items && items.length > 0) {
        return sendSuccess(res, 'Événements récupérés', items);
      }
    } catch (e) {
      // Fallback
    }

    return sendSuccess(res, 'Événements récupérés', store.events);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title_fr, title_en, date, start_time, end_time, building_id, floor_id, room_id } = req.body;

    if (!title_fr || !title_en || !date || !start_time || !end_time) {
      return sendValidationError(res, 'Titre FR/EN, Date, Heure Début et Heure Fin obligatoires');
    }

    if (end_time <= start_time) {
      return sendValidationError(res, 'L\'heure de fin doit être strictement supérieure à l\'heure de début');
    }

    const payload = {
      title_fr,
      title_en,
      description_fr: req.body.description_fr || '',
      description_en: req.body.description_en || '',
      date,
      start_time,
      end_time,
      room_id: room_id || 4,
      organizer: req.body.organizer || 'MINPOSTEL',
      target_audience: req.body.target_audience || 'Public',
      priority: req.body.priority || 'NORMAL',
      media_url: req.body.media_url || '',
      card_color: req.body.card_color || '#134074',
      created_by: req.user?.id || 1
    };

    let createdItem = { id: Date.now(), ...payload, building_fr: 'Bâtiment Principal', floor_fr: 'RDC', room_fr: 'Auditorium' };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('events').insert([payload]).select();
        if (!error && data && data.length > 0) {
          createdItem = { ...createdItem, ...data[0] };
        }
      } catch (sbErr) {
        logger.warn('Supabase event insert fallback:', sbErr.message);
      }
    }

    store.events.unshift(createdItem);
    saveStore();

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_CREATED', { entityType: 'EVENT', item: createdItem });
    }

    logger.info(`Event created: ${title_fr}`);
    return sendSuccess(res, 'Événement créé avec succès', createdItem, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (supabase) {
      try {
        await supabase.from('events').delete().eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase event delete fallback:', sbErr.message);
      }
    }

    store.events = store.events.filter(e => e.id !== id);
    saveStore();

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_DELETED', { entityType: 'EVENT', id });
    }

    return sendSuccess(res, 'Événement supprimé');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateEvent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;

    if (supabase) {
      try {
        await supabase.from('events').update(data).eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase event update fallback:', sbErr.message);
      }
    }

    const index = store.events.findIndex(m => m.id === id);
    if (index !== -1) {
      store.events[index] = { ...store.events[index], ...data };
      saveStore();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_UPDATED', { entityType: 'EVENT', item: { id, ...data } });
    }

    logger.info(`Event updated: ID ${id}`);
    return sendSuccess(res, 'Événement mis à jour avec succès', { id, ...data });
  } catch (err) {
    return sendError(res, err.message);
  }
};
