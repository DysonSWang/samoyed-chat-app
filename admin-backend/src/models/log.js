const { getDatabase } = require('./database');

class LogModel {
  // 记录操作日志
  static create({ admin_id, action, target_type, target_id, target_description, result, error_message, ip_address, user_agent }) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO operation_logs (admin_id, action, target_type, target_id, target_description, result, error_message, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result_ = stmt.run(admin_id, action, target_type, target_id, target_description, result, error_message || null, ip_address, user_agent);
    return result_.lastInsertRowid;
  }

  // 获取日志列表 (分页)
  static findAll({ page = 1, pageSize = 50, admin_id, action } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * pageSize;
    
    let where = [];
    let params = [];
    
    if (admin_id) {
      where.push('admin_id = ?');
      params.push(admin_id);
    }
    
    if (action) {
      where.push('action = ?');
      params.push(action);
    }
    
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    
    // 获取总数
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM operation_logs ${whereClause}
    `);
    const { total } = countStmt.get(...params);
    
    // 获取数据
    const dataStmt = db.prepare(`
      SELECT l.*, a.username as admin_username, a.nickname as admin_nickname
      FROM operation_logs l
      LEFT JOIN admins a ON l.admin_id = a.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `);
    
    const list = dataStmt.all(...params, pageSize, offset);
    
    return {
      list,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  // 获取日志总数
  static count() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT COUNT(*) as total FROM operation_logs');
    return stmt.get().total;
  }
}

module.exports = LogModel;
