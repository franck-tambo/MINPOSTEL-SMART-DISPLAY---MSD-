import { query } from '../config/db.config.js';

export const AnnouncementModel = {
  findAll: async () => {
    return await query(
      `SELECT a.*, m.filename as media_filename, m.mime_type as media_mime, u.full_name as author_name 
       FROM announcements a 
       LEFT JOIN media m ON a.media_id = m.id 
       LEFT JOIN users u ON a.created_by = u.id 
       ORDER BY a.created_at DESC`
    );
  },

  findActivePublished: async () => {
    return await query(
      `SELECT a.*, m.filename as media_filename, m.mime_type as media_mime 
       FROM announcements a 
       LEFT JOIN media m ON a.media_id = m.id 
       WHERE a.status = 'PUBLISHED' 
         AND a.start_date <= CURRENT_DATE() 
         AND a.end_date >= CURRENT_DATE() 
       ORDER BY CASE a.priority WHEN 'URGENT' THEN 1 WHEN 'IMPORTANT' THEN 2 ELSE 3 END, a.created_at DESC`
    );
  },

  findById: async (id) => {
    const rows = await query(`SELECT * FROM announcements WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const sql = `
      INSERT INTO announcements 
      (title_fr, title_en, description_fr, description_en, priority, status, start_date, end_date, start_time, end_time, media_id, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.title_fr,
      data.title_en,
      data.description_fr,
      data.description_en,
      data.priority || 'NORMAL',
      data.status || 'DRAFT',
      data.start_date,
      data.end_date,
      data.start_time || null,
      data.end_time || null,
      data.media_id || null,
      data.created_by || 1
    ];
    const result = await query(sql, params);
    return result.insertId;
  },

  update: async (id, data) => {
    const sql = `
      UPDATE announcements SET 
      title_fr = ?, title_en = ?, description_fr = ?, description_en = ?, 
      priority = ?, status = ?, start_date = ?, end_date = ?, 
      start_time = ?, end_time = ?, media_id = ? 
      WHERE id = ?
    `;
    const params = [
      data.title_fr,
      data.title_en,
      data.description_fr,
      data.description_en,
      data.priority,
      data.status,
      data.start_date,
      data.end_date,
      data.start_time || null,
      data.end_time || null,
      data.media_id || null,
      id
    ];
    await query(sql, params);
  },

  updateStatus: async (id, status) => {
    await query(`UPDATE announcements SET status = ? WHERE id = ?`, [status, id]);
  },

  delete: async (id) => {
    await query(`DELETE FROM announcements WHERE id = ?`, [id]);
  }
};

export default AnnouncementModel;
