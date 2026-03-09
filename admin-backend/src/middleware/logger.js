const LogModel = require('../models/log');

// 操作日志中间件
function createLogger(action, targetType) {
  return (req, res, next) => {
    // 记录响应完成后的日志
    const originalSend = res.send;
    const originalJson = res.json;
    
    const logAfterResponse = (statusCode) => {
      const adminId = req.admin?.id;
      
      if (!adminId) {
        // 未认证的请求不记录操作日志
        return;
      }
      
      // 从请求中提取目标 ID
      let targetId = req.params.id || req.body?.id || null;
      if (targetId && typeof targetId === 'string' && !isNaN(targetId)) {
        targetId = parseInt(targetId, 10);
      }
      
      // 目标描述
      let targetDescription = null;
      if (req.body?.username) targetDescription = `username:${req.body.username}`;
      if (req.body?.nickname) targetDescription = `nickname:${req.body.nickname}`;
      
      // 操作结果
      const result = statusCode >= 200 && statusCode < 400 ? 'success' : 'failure';
      
      // 记录日志
      try {
        LogModel.create({
          admin_id: adminId,
          action,
          target_type: targetType,
          target_id: targetId,
          target_description: targetDescription,
          result,
          error_message: statusCode >= 400 ? `HTTP ${statusCode}` : null,
          ip_address: req.ip || req.connection?.remoteAddress || null,
          user_agent: req.get('user-agent') || null
        });
      } catch (error) {
        console.error('记录操作日志失败:', error);
      }
    };
    
    res.send = function(data) {
      logAfterResponse(res.statusCode);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      logAfterResponse(res.statusCode);
      return originalJson.call(this, data);
    };
    
    next();
  };
}

module.exports = {
  createLogger
};
