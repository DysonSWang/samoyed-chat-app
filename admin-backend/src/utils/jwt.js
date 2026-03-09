const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'samoyed-admin-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

// 生成 Token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// 验证 Token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 从请求头获取 Token
function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

module.exports = {
  generateToken,
  verifyToken,
  getTokenFromHeader,
  JWT_SECRET
};
