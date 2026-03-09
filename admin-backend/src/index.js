const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { getDatabase, initAdminTables } = require('./models/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admins');
const logRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(morgan('combined')); // 日志
app.use(express.json()); // JSON 解析
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '萨摩耶管理后台服务运行中 🐕',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/admin', authRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/messages', messageRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/admin/admins', adminRoutes);
app.use('/api/admin/logs', logRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '接口不存在'
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }
  });
});

// 启动服务
function startServer() {
  try {
    // 初始化数据库表
    initAdminTables();
    
    // 创建默认管理员
    const db = getDatabase();
    const bcrypt = require('bcryptjs');
    const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
    
    if (!existingAdmin) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      db.prepare(`
        INSERT INTO admins (username, password_hash, nickname, role, status)
        VALUES (?, ?, ?, ?, ?)
      `).run('admin', passwordHash, '超级管理员', 'super', 1);
      console.log('✅ 默认管理员创建成功 (username: admin, password: admin123)');
    }
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║           🐕 萨摩耶管理后台服务已启动                  ║
╠════════════════════════════════════════════════════════╣
║  地址：http://localhost:${PORT}                          ║
║  健康检查：http://localhost:${PORT}/health                ║
║  API 文档：/root/.openclaw/workspace/samoyed-chat/docs/api/admin-api.md ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('启动服务失败:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
