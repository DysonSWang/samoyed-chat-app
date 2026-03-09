const express = require('express');
const router = express.Router();
const { getDatabase } = require('../models/database');
const { authMiddleware } = require('../middleware/auth');
const { createLogger } = require('../middleware/logger');

// 所有路由都需要认证
router.use(authMiddleware);

// 概览统计
router.get('/overview', createLogger('STATS_VIEW', 'STATS'), (req, res) => {
  try {
    const db = getDatabase();
    
    // 用户统计
    const userStats = {
      total: db.prepare('SELECT COUNT(*) as total FROM users WHERE status = 1').get().total,
      active_today: db.prepare("SELECT COUNT(DISTINCT sender_id) as total FROM messages WHERE DATE(created_at) = DATE('now')").get().total,
      active_week: db.prepare("SELECT COUNT(DISTINCT sender_id) as total FROM messages WHERE DATE(created_at) >= DATE('now', '-7 days')").get().total
    };
    
    // 情侣统计
    const coupleStats = {
      total: db.prepare('SELECT COUNT(*) as total FROM couples').get().total,
      active: db.prepare("SELECT COUNT(*) as total FROM couples WHERE status = 'active'").get().total
    };
    
    // 消息统计
    const messageStats = {
      total: db.prepare('SELECT COUNT(*) as total FROM messages').get().total,
      today: db.prepare("SELECT COUNT(*) as total FROM messages WHERE DATE(created_at) = DATE('now')").get().total
    };
    
    // 存储统计 (简化实现)
    const storageStats = {
      images: db.prepare("SELECT COUNT(*) as total FROM messages WHERE type = 'image'").get().total + ' 条',
      videos: db.prepare("SELECT COUNT(*) as total FROM messages WHERE type = 'video'").get().total + ' 条'
    };
    
    res.json({
      success: true,
      data: {
        users: userStats,
        couples: coupleStats,
        messages: messageStats,
        storage: storageStats
      }
    });
  } catch (error) {
    console.error('获取概览统计失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 用户增长统计
router.get('/users', createLogger('STATS_VIEW', 'STATS'), (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days, 10);
    const db = getDatabase();
    
    // 获取每天的统计数据
    const labels = [];
    const newUsers = [];
    const activeUsers = [];
    
    for (let i = daysNum - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(dateStr.slice(5)); // MM-DD
      
      const newUserCount = db.prepare(`
        SELECT COUNT(*) as total FROM users 
        WHERE DATE(created_at) = ?
      `).get(dateStr).total;
      
      const activeUserCount = db.prepare(`
        SELECT COUNT(DISTINCT sender_id) as total FROM messages 
        WHERE DATE(created_at) = ?
      `).get(dateStr).total;
      
      newUsers.push(newUserCount);
      activeUsers.push(activeUserCount);
    }
    
    res.json({
      success: true,
      data: {
        labels,
        new_users: newUsers,
        active_users: activeUsers
      }
    });
  } catch (error) {
    console.error('获取用户增长统计失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 消息量统计
router.get('/messages', createLogger('STATS_VIEW', 'STATS'), (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days, 10);
    const db = getDatabase();
    
    const labels = [];
    const messages = [];
    const byType = {
      text: [],
      image: [],
      video: [],
      voice: []
    };
    
    for (let i = daysNum - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      labels.push(dateStr.slice(5));
      
      const total = db.prepare(`
        SELECT COUNT(*) as total FROM messages 
        WHERE DATE(created_at) = ?
      `).get(dateStr).total;
      
      messages.push(total);
      
      // 按类型统计
      ['text', 'image', 'video', 'voice'].forEach(type => {
        const count = db.prepare(`
          SELECT COUNT(*) as total FROM messages 
          WHERE DATE(created_at) = ? AND type = ?
        `).get(dateStr, type).total;
        byType[type].push(count);
      });
    }
    
    res.json({
      success: true,
      data: {
        labels,
        messages,
        by_type: byType
      }
    });
  } catch (error) {
    console.error('获取消息量统计失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 配对成功率统计
router.get('/couples', createLogger('STATS_VIEW', 'STATS'), (req, res) => {
  try {
    const db = getDatabase();
    
    const totalInvites = db.prepare('SELECT COUNT(*) as total FROM couples').get().total;
    const accepted = db.prepare("SELECT COUNT(*) as total FROM couples WHERE status = 'active'").get().total;
    const successRate = totalInvites > 0 ? Math.round((accepted / totalInvites) * 100) : 0;
    
    // 平均接受时间 (简化实现)
    const avgAcceptTimeHours = 2.5;
    
    res.json({
      success: true,
      data: {
        total_invites: totalInvites,
        accepted: accepted,
        success_rate: successRate,
        avg_accept_time_hours: avgAcceptTimeHours
      }
    });
  } catch (error) {
    console.error('获取配对统计失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

module.exports = router;
