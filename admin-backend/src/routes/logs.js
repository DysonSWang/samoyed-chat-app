const express = require('express');
const router = express.Router();
const LogModel = require('../models/log');
const { authMiddleware } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取操作日志列表
router.get('/', (req, res) => {
  try {
    const { page = 1, pageSize = 50, admin_id, action } = req.query;
    
    const result = LogModel.findAll({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      admin_id: admin_id ? parseInt(admin_id, 10) : null,
      action
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取操作日志失败:', error);
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
