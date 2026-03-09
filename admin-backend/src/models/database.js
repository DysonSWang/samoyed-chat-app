const Database = require('better-sqlite3');
const path = require('path');

// 使用与聊天应用共享的数据库
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../../server/data/chat.db');

let db = null;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// 初始化管理员表和日志表
function initAdminTables() {
  const database = getDatabase();
  
  // 创建管理员表
  database.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      status INTEGER NOT NULL DEFAULT 1,
      last_login_at DATETIME,
      last_login_ip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 创建操作日志表
  database.exec(`
    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      target_description TEXT,
      result TEXT NOT NULL,
      error_message TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id)
    )
  `);
  
  // 创建索引
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
    CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
    CREATE INDEX IF NOT EXISTS idx_logs_admin_id ON operation_logs(admin_id);
    CREATE INDEX IF NOT EXISTS idx_logs_action ON operation_logs(action);
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON operation_logs(created_at);
  `);
  
  console.log('✅ 管理员表和日志表初始化完成');
}

module.exports = {
  getDatabase,
  closeDatabase,
  initAdminTables
};
