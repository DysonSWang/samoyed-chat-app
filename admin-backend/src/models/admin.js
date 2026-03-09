const { getDatabase } = require('./database');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

class AdminModel {
  // 根据用户名查找管理员
  static findByUsername(username) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM admins WHERE username = ?');
    return stmt.get(username);
  }

  // 根据 ID 查找管理员
  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT id, username, nickname, role, status, last_login_at, created_at FROM admins WHERE id = ?');
    return stmt.get(id);
  }

  // 创建管理员
  static create({ username, password, nickname, role = 'admin' }) {
    const db = getDatabase();
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    
    const stmt = db.prepare(`
      INSERT INTO admins (username, password_hash, nickname, role, status)
      VALUES (?, ?, ?, ?, 1)
    `);
    
    const result = stmt.run(username, passwordHash, nickname, role);
    return this.findById(result.lastInsertRowid);
  }

  // 更新最后登录信息
  static updateLastLogin(id, ip) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE admins 
      SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(ip, id);
  }

  // 禁用/启用管理员
  static toggleStatus(id, status) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE admins 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(status, id);
    return this.findById(id);
  }

  // 获取所有管理员列表
  static findAll() {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, username, nickname, role, status, last_login_at, created_at
      FROM admins
      ORDER BY created_at DESC
    `);
    return stmt.all();
  }

  // 删除管理员
  static delete(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM admins WHERE id = ?');
    return stmt.run(id);
  }
}

module.exports = AdminModel;
