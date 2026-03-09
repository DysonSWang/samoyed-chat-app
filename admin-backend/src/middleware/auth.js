const { getTokenFromHeader, verifyToken } = require('../utils/jwt');
const AdminModel = require('../models/admin');

// JWT 认证中间件
function authMiddleware(req, res, next) {
  const token = getTokenFromHeader(req);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '未提供认证令牌'
      }
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '认证令牌无效或已过期'
      }
    });
  }
  
  // 检查管理员是否存在且启用
  const admin = AdminModel.findById(decoded.adminId);
  
  if (!admin) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '管理员不存在'
      }
    });
  }
  
  if (admin.status !== 1) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '管理员账号已被禁用'
      }
    });
  }
  
  // 将管理员信息附加到请求对象
  req.admin = admin;
  next();
}

// 超级管理员权限检查
function requireSuperAdmin(req, res, next) {
  if (req.admin.role !== 'super') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '需要超级管理员权限'
      }
    });
  }
  next();
}

module.exports = {
  authMiddleware,
  requireSuperAdmin
};
