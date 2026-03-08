// 数据库迁移脚本：添加新功能字段
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/chat.db');

console.log('📦 开始数据库迁移...');

try {
  const db = new Database(DB_PATH);
  
  const tableInfo = db.pragma("table_info('messages')");
  const columns = tableInfo.map(col => col.name);
  
  console.log('当前 messages 表字段:', columns);
  
  // 添加悄悄话字段
  if (!columns.includes('is_secret')) {
    console.log('⚠️  添加 is_secret 字段...');
    db.exec(`ALTER TABLE messages ADD COLUMN is_secret INTEGER DEFAULT 0`);
    console.log('✅ is_secret 字段已添加');
  }
  
  // 添加引用字段
  if (!columns.includes('reply_to_id')) {
    console.log('⚠️  添加 reply_to_id 字段...');
    db.exec(`ALTER TABLE messages ADD COLUMN reply_to_id INTEGER`);
    console.log('✅ reply_to_id 字段已添加');
  }
  
  // 添加戳一戳计数字段
  if (!columns.includes('poke_count')) {
    console.log('⚠️  添加 poke_count 字段...');
    db.exec(`ALTER TABLE messages ADD COLUMN poke_count INTEGER DEFAULT 0`);
    console.log('✅ poke_count 字段已添加');
  }
  
  // 添加过期时间字段（悄悄话自动删除）
  if (!columns.includes('expires_at')) {
    console.log('⚠️  添加 expires_at 字段...');
    db.exec(`ALTER TABLE messages ADD COLUMN expires_at DATETIME`);
    console.log('✅ expires_at 字段已添加');
  }
  
  db.close();
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   ✅ 数据库迁移完成                    ║');
  console.log('╚════════════════════════════════════════╝');
  
} catch (err) {
  console.error('❌ 迁移失败:', err.message);
  process.exit(1);
}
