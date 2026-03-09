const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../server/data/chat.db');
const db = new Database(dbPath);

// Get all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('=== 数据库表 ===');
tables.forEach(t => console.log(`- ${t.name}`));

// Get users table schema
console.log('\n=== users 表结构 ===');
const userColumns = db.prepare("PRAGMA table_info(users)").all();
userColumns.forEach(col => console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`));

// Get couples table schema
console.log('\n=== couples 表结构 ===');
const coupleColumns = db.prepare("PRAGMA table_info(couples)").all();
coupleColumns.forEach(col => console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`));

// Get messages table schema
console.log('\n=== messages 表结构 ===');
const messageColumns = db.prepare("PRAGMA table_info(messages)").all();
messageColumns.forEach(col => console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`));

// Sample data
console.log('\n=== users 表示例数据 ===');
const users = db.prepare("SELECT * FROM users LIMIT 3").all();
console.log(JSON.stringify(users, null, 2));

db.close();
