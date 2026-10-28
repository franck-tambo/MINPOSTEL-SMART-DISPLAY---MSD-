import { query } from '../config/db.config.js';

export const UserModel = {
  findByUsername: async (username) => {
    const rows = await query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.username = ? AND u.is_active = 1`,
      [username]
    );
    return rows[0] || null;
  },

  findById: async (id) => {
    const rows = await query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role_id, r.name as role_name, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ? AND u.is_active = 1`,
      [id]
    );
    return rows[0] || null;
  },

  updateLastLogin: async (id) => {
    await query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [id]);
  }
};

export default UserModel;
