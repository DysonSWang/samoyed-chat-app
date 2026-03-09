const express = require('express');
const router = express.Router();
const { getDatabase } = require('../models/database');
const { authMiddleware } = require('../middleware/auth');
const { createLogger } = require('../middleware/logger');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取消息列表
router.get('/', createLogger('MESSAGE_VIEW', 'MESSAGE'), (req, res) => {
  try {
    const { page = 1, pageSize = 20, couple_id, type } = req.query;
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);
    const offset = (pageNum - 1) * pageSizeNum;
    
    const db = getDatabase();
    
    // 构建查询条件
    let where = [];
    let params = [];
    
    if (couple_id) {
      where.push('couple_id = ?');
      params.push(parseInt(couple_id, 10));
    }
    
    if (type) {
      where.push('type = ?');
      params.push(type);
    }
    
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    
    // 获取总数
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM messages ${whereClause}`);
    const { total } = countStmt.get(...params);
    
    // 获取数据
    const dataStmt = db.prepare(`
      SELECT m.*, 
             u.id as sender_id, u.username as sender_username, u.nickname as sender_nickname,
             c.id as couple_id
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN couples c ON m.couple_id = c.id
      ${whereClause}
      ORDER BY m.created_at DESC
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
    console.error('获取消息列表失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 删除单条消息
router.delete('/:id', createLogger('MESSAGE_DELETE', 'MESSAGE'), (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // 检查消息是否存在
    const message = db.prepare('SELECT id FROM messages WHERE id = ?').get(id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '消息不存在'
        }
      });
    }
    
    // 软删除
    db.prepare('UPDATE messages SET is_deleted = 1 WHERE id = ?').run(id);
    
    res.json({
      success: true,
      message: '消息已删除'
    });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 批量删除消息
router.post('/batch-delete', createLogger('MESSAGE_DELETE', 'MESSAGE'), (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '请提供要删除的消息 ID 列表'
        }
      });
    }
    
    const db = getDatabase();
    
    // 软删除
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`UPDATE messages SET is_deleted = 1 WHERE id IN (${placeholders})`).run(...ids);
    
    res.json({
      success: true,
      message: `已删除 ${ids.length} 条消息`
    });
  } catch (error) {
    console.error('批量删除消息失败:', error);
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
