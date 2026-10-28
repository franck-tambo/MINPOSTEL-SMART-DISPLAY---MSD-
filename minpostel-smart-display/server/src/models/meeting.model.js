import { query } from '../config/db.config.js';

export const MeetingModel = {
  findAll: async () => {
    return await query(
      `SELECT m.*, b.name_fr as building_fr, b.name_en as building_en, 
              f.name_fr as floor_fr, f.name_en as floor_en, 
              r.name_fr as room_fr, r.name_en as room_en, r.room_number 
       FROM meetings m 
       LEFT JOIN buildings b ON m.building_id = b.id 
       LEFT JOIN floors f ON m.floor_id = f.id 
       LEFT JOIN rooms r ON m.room_id = r.id 
       ORDER BY m.date ASC, m.start_time ASC`
    );
  },

  findActiveForDisplay: async () => {
    return await query(
      `SELECT m.*, b.name_fr as building_fr, b.name_en as building_en, 
              f.name_fr as floor_fr, f.name_en as floor_en, 
              r.name_fr as room_fr, r.name_en as room_en, r.room_number 
       FROM meetings m 
       LEFT JOIN buildings b ON m.building_id = b.id 
       LEFT JOIN floors f ON m.floor_id = f.id 
       LEFT JOIN rooms r ON m.room_id = r.id 
       WHERE m.is_published = 1 AND m.date = CURRENT_DATE() AND m.status != 'COMPLETED' AND m.status != 'CANCELLED' 
       ORDER BY m.start_time ASC`
    );
  },

  create: async (data) => {
    const sql = `
      INSERT INTO meetings 
      (title_fr, title_en, description_fr, description_en, date, start_time, end_time, building_id, floor_id, room_id, participants_info, priority, status, is_published, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data.floor_id || 3,
      data.room_id || 2,
      data.participants_info || null,
      data.priority || 'NORMAL',
      data.status || 'SCHEDULED',
      data.is_published ?? 1,
      data.created_by || 1
    ];
    const result = await query(sql, params);
    return result.insertId;
  },

  update: async (id, data) => {
    const sql = `
      UPDATE meetings SET 
      title_fr = ?, title_en = ?, description_fr = ?, description_en = ?, 
      date = ?, start_time = ?, end_time = ?, building_id = ?, floor_id = ?, room_id = ?, 
      participants_info = ?, priority = ?, status = ?, is_published = ? 
      WHERE id = ?
    `;
    const params = [
      data.title_fr,
      data.title_en,
      data.description_fr,
      data.description_en,
      data.date,
      data.start_time,
      data.end_time,
      data.building_id,
      data.floor_id,
      data.room_id,
      data.participants_info,
      data.priority,
      data.status,
      data.is_published ?? 1,
      id
    ];
    await query(sql, params);
  },

  updateStatus: async (id, status) => {
    await query(`UPDATE meetings SET status = ? WHERE id = ?`, [status, id]);
  },

  delete: async (id) => {
    await query(`DELETE FROM meetings WHERE id = ?`, [id]);
  }
};

export default MeetingModel;
