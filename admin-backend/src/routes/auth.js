const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const AdminModel = require('../models/admin');
const LogModel = require('../models/log');
const { generateToken } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/auth');
const { createLogger } = require('../middleware/logger');

// 管理员登录
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '用户名和密码不能为空'
        }
      });
    }
    
    // 查找管理员
    const admin = AdminModel.findByUsername(username);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      });
    }
    
    // 验证密码
    const isValid = bcrypt.compareSync(password, admin.password_hash);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      });
    }
    
    // 检查状态
    if (admin.status !== 1) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '账号已被禁用，请联系超级管理员'
        }
      });
    }
    
    // 更新最后登录信息
    AdminModel.updateLastLogin(admin.id, req.ip || req.connection?.remoteAddress);
    
    // 生成 Token
    const token = generateToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role
    });
    
    // 记录登录日志
    LogModel.create({
      admin_id: admin.id,
      action: 'LOGIN',
      result: 'success',
      ip_address: req.ip || req.connection?.remoteAddress,
      user_agent: req.get('user-agent')
    });
    
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          role: admin.role,
          last_login_at: new Date().toISOString()
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器错误'
      }
    });
  }
});

// 管理员登出
router.post('/logout', authMiddleware, createLogger('LOGOUT', null), (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

// 获取当前管理员信息
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: req.admin
  });
});

module.exports = router;
