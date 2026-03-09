const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../server/data/chat.db');
const db = new Database(dbPath);

console.log('开始迁移 users 表...');

try {
  // 检查是否已有 status 列
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasStatus = columns.some(col => col.name === 'status');
  
  if (hasStatus) {
    console.log('✅ users.status 列已存在，跳过迁移');
  } else {
    // 添加 status 列 (默认 1=正常)
    db.exec(`
      ALTER TABLE users ADD COLUMN status INTEGER NOT NULL DEFAULT 1;
    `);
    console.log('✅ 添加 users.status 列成功');
  }
  
  // 检查是否已有 updated_at 列
  const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
  if (!hasUpdatedAt) {
    db.exec(`
      ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ 添加 users.updated_at 列成功');
  }
  
  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
  `);
  console.log('✅ 创建索引成功');
  
  // 验证
  const result = db.prepare("SELECT id, username, nickname, status FROM users LIMIT 5").all();
  console.log('\n验证数据:');
  console.table(result);
  
  console.log('\n✅ 迁移完成!');
} catch (error) {
  console.error('❌ 迁移失败:', error.message);
  process.exit(1);
} finally {
  db.close();
}
