import MeetingModel from '../models/meeting.model.js';
import { supabase } from '../config/supabase.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';
import { store, saveStore, recordActivityLog } from '../utils/store.util.js';

export const getMeetings = async (req, res) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .order('date', { ascending: true });

        if (!error && data && data.length > 0) {
          return sendSuccess(res, 'Réunions récupérées (Supabase Cloud)', data);
        }
      } catch (sbErr) {
        logger.warn('Supabase meetings query error:', sbErr.message);
      }
    }

    try {
      const items = await MeetingModel.findAll();
      if (items && items.length > 0) {
        return sendSuccess(res, 'Réunions récupérées', items);
      }
    } catch (e) {
      // Fallback
    }

    return sendSuccess(res, 'Réunions récupérées', store.meetings);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createMeeting = async (req, res) => {
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
      room_id: room_id || 2,
      participants_info: req.body.participants_info || '',
      priority: req.body.priority || 'NORMAL',
      status: 'UPCOMING',
      media_url: req.body.media_url || '',
      card_color: req.body.card_color || '#134074',
      created_by: req.user?.id || 1
    };

    let createdItem = { id: Date.now(), ...payload, building_fr: 'Bâtiment Principal', floor_fr: '2e Étage', room_fr: 'Salle de Conférence B' };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('meetings').insert([payload]).select();
        if (!error && data && data.length > 0) {
          createdItem = { ...createdItem, ...data[0] };
        }
      } catch (sbErr) {
        logger.warn('Supabase meeting insert fallback:', sbErr.message);
      }
    }

    store.meetings.unshift(createdItem);
    saveStore();

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_CREATED', { entityType: 'MEETING', item: createdItem });
    }

    logger.info(`Meeting scheduled: ${title_fr}`);
    recordActivityLog({
      action: 'CREATE',
      entity_type: 'MEETING',
      description: `Planification de la réunion : "${createdItem.title_fr}" (${createdItem.start_time} - ${createdItem.end_time})`,
      req
    });
    return sendSuccess(res, 'Réunion programmée avec succès', createdItem, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateMeetingStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (supabase) {
      try {
        await supabase.from('meetings').update({ status }).eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase meeting status update fallback:', sbErr.message);
      }
    }

    const item = store.meetings.find(m => m.id === id);
    if (item) {
      item.status = status;
      saveStore();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('MEETING_STATUS_CHANGED', { id, status });
    }

    recordActivityLog({
      action: 'UPDATE',
      entity_type: 'MEETING',
      description: `Changement de statut de la réunion #${id} ➔ ${status}`,
      req
    });

    return sendSuccess(res, `Statut de la réunion mis à jour : ${status}`);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const targetItem = store.meetings.find(m => m.id === id);

    if (supabase) {
      try {
        await supabase.from('meetings').delete().eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase meeting delete fallback:', sbErr.message);
      }
    }

    store.meetings = store.meetings.filter(m => m.id !== id);
    saveStore();

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_DELETED', { entityType: 'MEETING', id });
    }

    recordActivityLog({
      action: 'DELETE',
      entity_type: 'MEETING',
      description: `Suppression de la réunion #${id} (${targetItem?.title_fr || 'Titre inconnu'})`,
      req
    });

    return sendSuccess(res, 'Réunion supprimée');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;

    if (supabase) {
      try {
        await supabase.from('meetings').update(data).eq('id', id);
      } catch (sbErr) {
        logger.warn('Supabase meeting update fallback:', sbErr.message);
      }
    }

    const index = store.meetings.findIndex(m => m.id === id);
    if (index !== -1) {
      store.meetings[index] = { ...store.meetings[index], ...data };
      saveStore();
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('CONTENT_UPDATED', { entityType: 'MEETING', item: { id, ...data } });
    }

    return sendSuccess(res, 'Réunion modifiée avec succès', { id, ...data });
  } catch (err) {
    return sendError(res, err.message);
  }
};
