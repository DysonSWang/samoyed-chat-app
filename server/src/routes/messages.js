const express = require('express');
const { getDatabase } = require('../models/database');

const router = express.Router();

// JWT 中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }
};

// 获取聊天记录
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT couple_id FROM users WHERE id = ?').get(req.userId);

    if (!user.couple_id) {
      return res.json({ success: true, messages: [] });
    }

    const { limit = 50, before } = req.query;
    
    let query = `
      SELECT m.*, u.username as sender_username, u.nickname as sender_nickname, u.avatar as sender_avatar
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.couple_id = ? AND m.is_deleted = 0
    `;
    
    const params = [user.couple_id];

    if (before) {
      query += ' AND m.created_at < ?';
      params.push(before);
    }

    query += ' ORDER BY m.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const messages = db.prepare(query).all(...params);

    // 反转消息顺序（最新的在最后）
    messages.reverse();

    res.json({ success: true, messages });
  } catch (err) {
    console.error('获取消息失败:', err);
    res.status(500).json({ error: '获取消息失败' });
  }
});

// 发送消息
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT couple_id FROM users WHERE id = ?').get(req.userId);

    if (!user.couple_id) {
      return res.status(400).json({ error: '您还未配对，无法发送消息' });
    }

    const { content, type = 'text', mediaUrl, mediaType, duration } = req.body;

    if (!content && !mediaUrl) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 服务器时区已是北京时间 (Asia/Shanghai)，直接使用
    const result = db.prepare(`
      INSERT INTO messages (couple_id, sender_id, content, type, media_url, media_type, duration, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `).run(user.couple_id, req.userId, content || '', type, mediaUrl || null, mediaType || null, duration || null);

    const message = db.prepare(`
      SELECT m.*, u.username as sender_username, u.nickname as sender_nickname, u.avatar as sender_avatar
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    res.json({ success: true, message });
  } catch (err) {
    console.error('发送消息失败:', err);
    res.status(500).json({ error: '发送消息失败' });
  }
});

// 删除消息
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDatabase();
    const messageId = req.params.id;

    // 验证消息所有权
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
    
    if (!message) {
      return res.status(404).json({ error: '消息不存在' });
    }

    if (message.sender_id !== req.userId) {
      return res.status(403).json({ error: '只能删除自己的消息' });
    }

    // 软删除
    db.prepare('UPDATE messages SET is_deleted = 1 WHERE id = ?').run(messageId);

    res.json({ success: true, message: '消息已删除' });
  } catch (err) {
    console.error('删除消息失败:', err);
    res.status(500).json({ error: '删除消息失败' });
  }
});

// 撤回消息（无时间限制）
router.post('/:id/recall', authMiddleware, (req, res) => {
  try {
    const db = getDatabase();
    const messageId = req.params.id;

    // 验证消息所有权
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
    
    if (!message) {
      return res.status(404).json({ error: '消息不存在' });
    }

    if (message.sender_id !== req.userId) {
      return res.status(403).json({ error: '只能撤回自己的消息' });
    }

    if (message.is_recalled) {
      return res.status(400).json({ error: '消息已撤回' });
    }

    // 标记为已撤回（保留记录但清空内容）
    db.prepare(`
      UPDATE messages 
      SET is_recalled = 1, content = '', media_url = NULL, type = 'text'
      WHERE id = ?
    `).run(messageId);

    res.json({ success: true, message: '消息已撤回' });
  } catch (err) {
    console.error('撤回消息失败:', err);
    res.status(500).json({ error: '撤回消息失败' });
  }
});

module.exports = router;
