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
    origin: '*',  // 允许所有来源
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
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
const userSockets = new Map(); // socketId -> { userId, coupleId }

io.on('connection', (socket) => {
  console.log('🐕 用户连接:', socket.id);

  // 心跳检测
  socket.on('ping', () => {
    socket.emit('pong')
  })

  // 用户加入聊天室
  socket.on('join', (data) => {
    const { userId, coupleId } = data;
    onlineUsers.set(userId, socket.id);
    userSockets.set(socket.id, { userId, coupleId });
    socket.join(`couple_${coupleId}`);
    console.log(`用户 ${userId} 加入聊天室 couple_${coupleId}`);
    
    // 通知对方
    socket.to(`couple_${coupleId}`).emit('user_online', { userId });
  });

  // 实时消息 - 带确认
  socket.on('send_message', (data, callback) => {
    const { coupleId, message } = data;
    socket.to(`couple_${coupleId}`).emit('new_message', message);
    console.log(`📤 新消息广播到 couple_${coupleId}`);
    
    // 发送确认
    if (callback) callback({ success: true, messageId: message.id })
  });

  // 悄悄话（阅后即焚）
  socket.on('secret_message', (data, callback) => {
    const { coupleId, message } = data;
    // 发送给对方
    socket.to(`couple_${coupleId}`).emit('new_message', message);
    console.log(`🔥 悄悄话发送到 couple_${coupleId}`);
    
    // 5 秒后通知删除
    setTimeout(() => {
      io.to(`couple_${coupleId}`).emit('message_deleted', { 
        messageId: message.id,
        reason: 'secret'
      });
      console.log(`🗑️ 悄悄话已删除：${message.id}`);
    }, 5000);
    
    if (callback) callback({ success: true })
  });

  // 戳一戳
  socket.on('poke', (data) => {
    const { coupleId, userId } = data;
    socket.to(`couple_${coupleId}`).emit('poke', { 
      userId, 
      timestamp: Date.now() 
    });
    console.log(`👆 ${userId} 戳了戳对方`);
  });

  // 引用回复
  socket.on('reply_message', (data, callback) => {
    const { coupleId, message, replyToId } = data;
    socket.to(`couple_${coupleId}`).emit('new_message', { 
      ...message, 
      replyToId 
    });
    
    if (callback) callback({ success: true })
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

  // 离线消息同步请求
  socket.on('offline_sync', async (data) => {
    const { userId, coupleId } = data;
    console.log(`📥 用户 ${userId} 请求同步离线消息`);
    
    try {
      const db = require('./models/database').getDatabase();
      const messages = db.prepare(`
        SELECT m.*, u.username as sender_username, u.nickname as sender_nickname, u.avatar as sender_avatar
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.couple_id = ? AND m.is_deleted = 0 AND m.is_recalled = 0
        ORDER BY m.created_at DESC
        LIMIT 50
      `).all(coupleId).reverse();
      
      socket.emit('offline_messages', { messages });
      console.log(`✅ 同步了 ${messages.length} 条离线消息`);
    } catch (err) {
      console.error('同步离线消息失败:', err);
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    const userInfo = userSockets.get(socket.id);
    
    if (userInfo) {
      disconnectedUserId = userInfo.userId;
      onlineUsers.delete(disconnectedUserId);
      userSockets.delete(socket.id);
      
      // 通知对方
      if (userInfo.coupleId) {
        socket.to(`couple_${userInfo.coupleId}`).emit('user_offline', { 
          userId: disconnectedUserId 
        });
      }
    }
    
    console.log('🐕 用户断开:', socket.id, disconnectedUserId);
  });
});

// 初始化数据库并启动服务
const PORT = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🐕 萨摩耶之家 - 后端服务已启动       ║
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
