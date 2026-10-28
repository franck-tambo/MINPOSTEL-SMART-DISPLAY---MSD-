import { query } from '../config/db.config.js';

export const EventModel = {
  findAll: async () => {
    return await query(
      `SELECT e.*, b.name_fr as building_fr, b.name_en as building_en, 
              f.name_fr as floor_fr, f.name_en as floor_en, 
              r.name_fr as room_fr, r.name_en as room_en 
       FROM events e 
       LEFT JOIN buildings b ON e.building_id = b.id 
       LEFT JOIN floors f ON e.floor_id = f.id 
       LEFT JOIN rooms r ON e.room_id = r.id 
       ORDER BY e.date ASC, e.start_time ASC`
    );
  },

  create: async (data) => {
    const sql = `
      INSERT INTO events 
      (title_fr, title_en, description_fr, description_en, date, start_time, end_time, building_id, floor_id, room_id, organizer, target_audience, priority, status, is_published, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.title_fr,
      data.title_en,
      data.description_fr || null,
      data.description_en || null,
      data.date,
      data.start_time,
      data.end_time,
      data.building_id || 1,
      data.floor_id || 2,
      data.room_id || 4,
      data.organizer || null,
      data.target_audience || null,
      data.priority || 'NORMAL',
      data.status || 'SCHEDULED',
      data.is_published ?? 1,
      data.created_by || 1
    ];
    const result = await query(sql, params);
    return result.insertId;
  },

  delete: async (id) => {
    await query(`DELETE FROM events WHERE id = ?`, [id]);
  }
};

export default EventModel;
