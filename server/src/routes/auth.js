const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../models/database');

const router = express.Router();

// JWT 中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }
};

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const db = getDatabase();
    
    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const result = db.prepare(`
      INSERT INTO users (username, password, nickname)
      VALUES (?, ?, ?)
    `).run(username, hashedPassword, nickname || username);

    // 生成 JWT
    const token = jwt.sign(
      { userId: result.lastInsertRowid, username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: result.lastInsertRowid,
        username,
        nickname: nickname || username,
        couple_id: null
      }
    });
  } catch (err) {
    console.error('注册失败:', err);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const db = getDatabase();
    
    // 查找用户
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar,
        couple_id: user.couple_id
      }
    });
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, username, nickname, avatar, couple_id, created_at
      FROM users WHERE id = ?
    `).get(req.userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('获取用户信息失败:', err);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 生成配对邀请码
router.post('/generate-invite', authMiddleware, (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

    if (user.couple_id) {
      return res.status(400).json({ error: '您已经配对成功，无法生成邀请码' });
    }

    // 检查是否已有待处理的邀请
    const existingInvite = db.prepare(
      'SELECT * FROM couples WHERE (user1_id = ? OR user2_id = ?) AND status = ?'
    ).get(req.userId, req.userId, 'pending');

    if (existingInvite) {
      return res.json({
        success: true,
        inviteCode: existingInvite.invite_code,
        coupleId: existingInvite.id
      });
    }

    // 生成邀请码
    const inviteCode = uuidv4().substring(0, 8).toUpperCase();

    // 创建情侣关系记录
    const result = db.prepare(`
      INSERT INTO couples (user1_id, user2_id, invite_code, status)
      VALUES (?, ?, ?, 'pending')
    `).run(req.userId, null, inviteCode);

    res.json({
      success: true,
      inviteCode,
      coupleId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('生成邀请码失败:', err);
    res.status(500).json({ error: '生成邀请码失败' });
  }
});

// 接受配对邀请
router.post('/accept-invite', authMiddleware, (req, res) => {
  try {
    const { inviteCode } = req.body;
    const db = getDatabase();

    if (!inviteCode) {
      return res.status(400).json({ error: '邀请码不能为空' });
    }

    // 查找邀请
    const couple = db.prepare(
      'SELECT * FROM couples WHERE invite_code = ? AND status = ?'
    ).get(inviteCode.toUpperCase(), 'pending');

    if (!couple) {
      return res.status(404).json({ error: '邀请码无效或已过期' });
    }

    if (couple.user1_id === req.userId) {
      return res.status(400).json({ error: '这是您自己的邀请码' });
    }

    // 更新情侣关系
    db.prepare(`
      UPDATE couples SET user2_id = ?, status = 'accepted' WHERE id = ?
    `).run(req.userId, couple.id);

    // 更新用户的 couple_id
    db.prepare(`
      UPDATE users SET couple_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (?, ?)
    `).run(couple.id, couple.user1_id, req.userId);

    res.json({
      success: true,
      message: '配对成功！🐕💕',
      coupleId: couple.id
    });
  } catch (err) {
    console.error('接受邀请失败:', err);
    res.status(500).json({ error: '接受邀请失败' });
  }
});

// 获取配对信息
router.get('/couple', authMiddleware, (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT couple_id FROM users WHERE id = ?').get(req.userId);

    if (!user.couple_id) {
      return res.json({ success: true, couple: null });
    }

    const couple = db.prepare(`
      SELECT c.*, u1.username as user1_username, u1.nickname as user1_nickname, u1.avatar as user1_avatar,
             u2.username as user2_username, u2.nickname as user2_nickname, u2.avatar as user2_avatar
      FROM couples c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      WHERE c.id = ?
    `).get(user.couple_id);

    res.json({ success: true, couple });
  } catch (err) {
    console.error('获取配对信息失败:', err);
    res.status(500).json({ error: '获取配对信息失败' });
  }
});

module.exports = router;
