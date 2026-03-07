const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 导入路由
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');

// 导入数据库初始化
const { initDatabase } = require('./models/database');

const app = express();
const server = http.createServer(app);

// Socket.IO 配置
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '萨摩耶聊天服务运行中 🐕' });
});

// Socket.IO 连接处理
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('🐕 用户连接:', socket.id);

  // 用户加入聊天室
  socket.on('join', (data) => {
    const { userId, coupleId } = data;
    onlineUsers.set(userId, socket.id);
    socket.join(`couple_${coupleId}`);
    console.log(`用户 ${userId} 加入聊天室 couple_${coupleId}`);
    
    // 通知对方
    socket.to(`couple_${coupleId}`).emit('user_online', { userId });
  });

  // 实时消息
  socket.on('send_message', (data) => {
    const { coupleId, message } = data;
    io.to(`couple_${coupleId}`).emit('new_message', message);
    console.log(`新消息发送到 couple_${coupleId}`);
  });

  // 输入状态
  socket.on('typing', (data) => {
    const { coupleId, userId } = data;
    socket.to(`couple_${coupleId}`).emit('user_typing', { userId });
  });

  // 停止输入
  socket.on('stop_typing', (data) => {
    const { coupleId, userId } = data;
    socket.to(`couple_${coupleId}`).emit('user_stop_typing', { userId });
  });

  // 断开连接
  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log('🐕 用户断开:', socket.id, disconnectedUserId);
    
    if (disconnectedUserId) {
      // 通知对方
      io.emit('user_offline', { userId: disconnectedUserId });
    }
  });
});

// 初始化数据库并启动服务
const PORT = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🐕 萨摩耶之恋 - 后端服务已启动       ║
║   端口：${PORT}                          ║
║   环境：${process.env.NODE_ENV}                    ║
╚════════════════════════════════════════╝
      `);
    });
  })
  .catch((err) => {
    console.error('数据库初始化失败:', err);
    process.exit(1);
  });

module.exports = { app, io };
