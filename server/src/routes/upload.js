const express = require('express');
const multer = require('multer');
const OSS = require('ali-oss');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const router = express.Router();

// OSS 配置
const client = new OSS({
  region: 'oss-cn-shenzhen',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  secure: true
});

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm',
    'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/m4a'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024 // 20MB
  },
  fileFilter
});

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

// 上传图片
router.post('/image', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    // 生成 OSS 路径
    const fileExt = path.extname(req.file.originalname);
    const objectKey = `samoyed-chat/images/${uuidv4()}${fileExt}`;

    // 上传到 OSS
    const result = await client.put(objectKey, req.file.path);

    // 删除本地临时文件
    fs.unlinkSync(req.file.path);

    const imageUrl = result.url || `${process.env.OSS_CDN_URL}/${objectKey}`;

    res.json({
      success: true,
      url: imageUrl,
      type: 'image',
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error('上传图片失败:', err);
    
    // 清理本地文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: '上传图片失败：' + err.message });
  }
});

// 上传视频
router.post('/video', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的视频' });
    }

    // 生成 OSS 路径
    const fileExt = path.extname(req.file.originalname);
    const objectKey = `samoyed-chat/videos/${uuidv4()}${fileExt}`;

    // 上传到 OSS
    const result = await client.put(objectKey, req.file.path);

    // 删除本地临时文件
    fs.unlinkSync(req.file.path);

    const videoUrl = result.url || `${process.env.OSS_CDN_URL}/${objectKey}`;

    res.json({
      success: true,
      url: videoUrl,
      type: 'video',
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error('上传视频失败:', err);
    
    // 清理本地文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: '上传视频失败：' + err.message });
  }
});

// 上传音频
router.post('/audio', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的音频' });
    }

    // 生成 OSS 路径
    const fileExt = path.extname(req.file.originalname);
    const objectKey = `samoyed-chat/audios/${uuidv4()}${fileExt}`;

    // 上传到 OSS
    const result = await client.put(objectKey, req.file.path);

    // 删除本地临时文件
    fs.unlinkSync(req.file.path);

    const audioUrl = result.url || `${process.env.OSS_CDN_URL}/${objectKey}`;

    res.json({
      success: true,
      url: audioUrl,
      type: 'audio',
      mimeType: req.file.mimetype,
      size: req.file.size,
      duration: req.body.duration || 0
    });
  } catch (err) {
    console.error('上传音频失败:', err);
    
    // 清理本地文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: '上传音频失败：' + err.message });
  }
});

// 通用上传接口（自动判断类型）
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const objectKey = `samoyed-chat/${isVideo ? 'videos' : 'images'}/${uuidv4()}${path.extname(req.file.originalname)}`;

    // 上传到 OSS
    const result = await client.put(objectKey, req.file.path);

    // 删除本地临时文件
    fs.unlinkSync(req.file.path);

    const fileUrl = result.url || `${process.env.OSS_CDN_URL}/${objectKey}`;

    res.json({
      success: true,
      url: fileUrl,
      type: isVideo ? 'video' : 'image',
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error('上传文件失败:', err);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: '上传文件失败：' + err.message });
  }
});

// 错误处理中间件
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制（最大 20MB）' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
