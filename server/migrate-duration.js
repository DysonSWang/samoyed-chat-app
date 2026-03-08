// 数据库迁移脚本：添加 duration 字段到 messages 表
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/chat.db');

console.log('📦 开始数据库迁移...');
console.log(`数据库路径：${DB_PATH}`);

try {
  const db = new Database(DB_PATH);
  
  // 检查 messages 表结构
  const tableInfo = db.pragma("table_info('messages')");
  const columns = tableInfo.map(col => col.name);
  
  console.log('当前 messages 表字段:', columns);
  
  if (!columns.includes('duration')) {
    console.log('⚠️  发现缺少 duration 字段，开始添加...');
    db.exec(`ALTER TABLE messages ADD COLUMN duration INTEGER`);
    console.log('✅ 成功添加 duration 字段');
  } else {
    console.log('✅ duration 字段已存在，无需迁移');
  }
  
  if (!columns.includes('is_deleted')) {
    console.log('⚠️  发现缺少 is_deleted 字段，开始添加...');
    db.exec(`ALTER TABLE messages ADD COLUMN is_deleted INTEGER DEFAULT 0`);
    console.log('✅ 成功添加 is_deleted 字段');
  } else {
    console.log('✅ is_deleted 字段已存在，无需迁移');
  }
  
  if (!columns.includes('is_recalled')) {
    console.log('⚠️  发现缺少 is_recalled 字段，开始添加...');
    db.exec(`ALTER TABLE messages ADD COLUMN is_recalled INTEGER DEFAULT 0`);
    console.log('✅ 成功添加 is_recalled 字段');
  } else {
    console.log('✅ is_recalled 字段已存在，无需迁移');
  }
  
  if (!columns.includes('media_type')) {
    console.log('⚠️  发现缺少 media_type 字段，开始添加...');
    db.exec(`ALTER TABLE messages ADD COLUMN media_type TEXT`);
    console.log('✅ 成功添加 media_type 字段');
  } else {
    console.log('✅ media_type 字段已存在，无需迁移');
  }
  
  // 创建索引（如果不存在）
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_couple_id ON messages(couple_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`);
    console.log('✅ 索引已创建/存在');
  } catch (err) {
    console.log('⚠️  索引创建跳过:', err.message);
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
