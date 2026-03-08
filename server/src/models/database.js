const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/chat.db';

let db = null;

// 初始化数据库
function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      // 确保数据目录存在
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      db = new Database(DB_PATH);
      db.pragma('journal_mode = WAL');
      
      // 设置时区为东八区（SQLite 存储 UTC，应用层转换）

      // 创建用户表
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          nickname TEXT,
          avatar TEXT,
          couple_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建情侣关系表
      db.exec(`
        CREATE TABLE IF NOT EXISTS couples (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user1_id INTEGER NOT NULL,
          user2_id INTEGER,
          invite_code TEXT UNIQUE,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user1_id) REFERENCES users(id),
          FOREIGN KEY (user2_id) REFERENCES users(id)
        )
      `);

      // 创建消息表
      db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          couple_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          content TEXT,
          type TEXT DEFAULT 'text',
          media_url TEXT,
          media_type TEXT,
          duration INTEGER,
          is_deleted INTEGER DEFAULT 0,
          is_recalled INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (couple_id) REFERENCES couples(id),
          FOREIGN KEY (sender_id) REFERENCES users(id)
        )
      `);

      // 创建索引
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_messages_couple_id ON messages(couple_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
        CREATE INDEX IF NOT EXISTS idx_users_couple_id ON users(couple_id);
      `);

      console.log('✅ 数据库初始化完成');
      resolve(db);
    } catch (err) {
      reject(err);
    }
  });
}

// 获取数据库实例
function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

module.exports = { initDatabase, getDatabase };
