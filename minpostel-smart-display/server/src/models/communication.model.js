import { query } from '../config/db.config.js';

class CommunicationModel {
  static async findAll() {
    const sql = `
      SELECT * FROM communications 
      ORDER BY created_at DESC
    `;
    return query(sql);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM communications WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const sql = `
      INSERT INTO communications (
        title_fr, title_en, content_fr, content_en, priority, visibility, status, media_url, card_color, start_date, end_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.title_fr,
      data.title_en,
      data.content_fr,
      data.content_en,
      data.priority || 'NORMAL',
      data.visibility || 'PUBLIC',
      data.status || 'PUBLISHED',
      data.media_url || '',
      data.card_color || '#134074',
      data.start_date || new Date().toISOString().split('T')[0],
      data.end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      data.created_by || 1
    ];
    const res = await query(sql, params);
    return res.insertId || res[0]?.id || Date.now();
  }

  static async update(id, data) {
    const sql = `
      UPDATE communications SET 
        title_fr = ?, title_en = ?, content_fr = ?, content_en = ?, priority = ?, visibility = ?, status = ?, media_url = ?, card_color = ?
      WHERE id = ?
    `;
    const params = [
      data.title_fr,
      data.title_en,
      data.content_fr,
      data.content_en,
      data.priority || 'NORMAL',
      data.visibility || 'PUBLIC',
      data.status || 'PUBLISHED',
      data.media_url || '',
      data.card_color || '#134074',
      id
    ];
    return query(sql, params);
  }

  static async delete(id) {
    const sql = 'DELETE FROM communications WHERE id = ?';
    return query(sql, [id]);
  }
}

export default CommunicationModel;
