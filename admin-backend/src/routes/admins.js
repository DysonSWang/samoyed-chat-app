const express = require('express');
const router = express.Router();
const AdminModel = require('../models/admin');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth');
const { createLogger } = require('../middleware/logger');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取管理员列表 (仅超级管理员)
router.get('/', requireSuperAdmin, createLogger('ADMIN_VIEW', 'ADMIN'), (req, res) => {
  try {
    const list = AdminModel.findAll();
    
    res.json({
      success: true,
      data: {
        list
      }
    });
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 创建管理员 (仅超级管理员)
router.post('/', requireSuperAdmin, createLogger('ADMIN_CREATE', 'ADMIN'), (req, res) => {
  try {
    const { username, password, nickname, role = 'admin' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '用户名和密码不能为空'
        }
      });
    }
    
    // 检查用户名是否已存在
    const existing = AdminModel.findByUsername(username);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: '用户名已存在'
        }
      });
    }
    
    // 创建管理员
    const admin = AdminModel.create({ username, password, nickname, role });
    
    res.status(201).json({
      success: true,
      message: '管理员创建成功',
      data: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('创建管理员失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 禁用/启用管理员 (仅超级管理员)
router.put('/:id/status', requireSuperAdmin, createLogger('ADMIN_STATUS', 'ADMIN'), (req, res) => {
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
    
    // 不能禁用自己
    if (parseInt(id, 10) === req.admin.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '不能禁用自己的账号'
        }
      });
    }
    
    const admin = AdminModel.toggleStatus(id, status);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '管理员不存在'
        }
      });
    }
    
    res.json({
      success: true,
      message: status === 0 ? '管理员已禁用' : '管理员已启用',
      data: admin
    });
  } catch (error) {
    console.error('更新管理员状态失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 删除管理员 (仅超级管理员)
router.delete('/:id', requireSuperAdmin, createLogger('ADMIN_DELETE', 'ADMIN'), (req, res) => {
  try {
    const { id } = req.params;
    
    // 不能删除自己
    if (parseInt(id, 10) === req.admin.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '不能删除自己的账号'
        }
      });
    }
    
    const result = AdminModel.delete(id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '管理员不存在'
        }
      });
    }
    
    res.json({
      success: true,
      message: '管理员已删除'
    });
  } catch (error) {
    console.error('删除管理员失败:', error);
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
