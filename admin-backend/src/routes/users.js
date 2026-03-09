const express = require('express');
const router = express.Router();
const { getDatabase } = require('../models/database');
const { authMiddleware } = require('../middleware/auth');
const { createLogger } = require('../middleware/logger');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取用户列表 (分页 + 搜索)
router.get('/', createLogger('USER_VIEW', 'USER'), (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, status } = req.query;
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);
    const offset = (pageNum - 1) * pageSizeNum;
    
    const db = getDatabase();
    
    // 构建查询条件
    let where = [];
    let params = [];
    
    if (keyword) {
      where.push('(username LIKE ? OR nickname LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    if (status !== undefined && status !== '') {
      where.push('status = ?');
      params.push(parseInt(status, 10));
    }
    
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    
    // 获取总数
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM users ${whereClause}`);
    const { total } = countStmt.get(...params);
    
    // 获取数据
    const dataStmt = db.prepare(`
      SELECT u.id, u.username, u.nickname, u.avatar, u.status, u.couple_id, u.created_at,
             c.status as couple_status
      FROM users u
      LEFT JOIN couples c ON u.couple_id = c.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `);
    
    const list = dataStmt.all(...params, pageSizeNum, offset);
    
    res.json({
      success: true,
      data: {
        list,
        pagination: {
          total,
          page: pageNum,
          pageSize: pageSizeNum,
          totalPages: Math.ceil(total / pageSizeNum)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 获取用户详情
router.get('/:id', createLogger('USER_VIEW', 'USER'), (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // 获取用户信息
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '用户不存在'
        }
      });
    }
    
    // 获取情侣关系
    let couple = null;
    if (user.couple_id) {
      couple = db.prepare(`
        SELECT c.*, 
               u2.id as partner_id, u2.username as partner_username, u2.nickname as partner_nickname
        FROM couples c
        LEFT JOIN users u2 ON (c.user1_id = u2.id OR c.user2_id = u2.id) AND u2.id != ?
        WHERE c.id = ?
      `).get(id, user.couple_id);
    }
    
    // 获取用户统计
    const stats = {
      message_count: db.prepare('SELECT COUNT(*) as total FROM messages WHERE sender_id = ?').get(id).total,
      total_login_days: 1 // 简化实现
    };
    
    res.json({
      success: true,
      data: {
        ...user,
        password_hash: undefined, // 不返回密码
        couple,
        stats
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 禁用/启用用户
router.put('/:id/status', createLogger('USER_DISABLE', 'USER'), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined || (status !== 0 && status !== 1)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '状态必须为 0 或 1'
        }
      });
    }
    
    const db = getDatabase();
    
    // 检查用户是否存在
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '用户不存在'
        }
      });
    }
    
    // 更新状态
    db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    
    const action = status === 0 ? 'USER_DISABLE' : 'USER_ENABLE';
    const message = status === 0 ? '用户已禁用' : '用户已启用';
    
    res.json({
      success: true,
      message,
      data: {
        id: parseInt(id),
        status
      }
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
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
