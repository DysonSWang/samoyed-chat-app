# 🐕 萨摩耶之恋 - Samoyed Love

> 专为情侣打造的私密聊天空间 · 以萨摩耶为伴 · 以爱为名

**技术栈**: Node.js + Express + Socket.io + React + 阿里云 OSS

---

## 🌟 功能特性

- 💬 **实时聊天** - WebSocket 双工通信，消息即时送达
- 🖼️ **图片分享** - 阿里云 OSS 存储，高清无损
- 🎥 **视频分享** - 支持 MP4 格式视频上传
- 🐕 **萨摩耶主题** - 可爱治愈系 UI 设计
- 🔐 **情侣配对** - 邀请码机制，私密二人空间
- 🌙 **夜间模式** - 护眼深色主题
- 📱 **移动优先** - 完美适配手机屏幕

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- 阿里云 OSS 账号

### 安装步骤

```bash
# 1. 进入项目目录
cd samoyed-chat

# 2. 安装后端依赖
cd server
npm install

# 3. 安装前端依赖
cd ../client
npm install

# 4. 配置环境变量
# 复制 .env.example 到 .env 并填写配置
cp .env.example .env
```

### 启动服务

```bash
# 终端 1 - 启动后端
cd server
npm run dev

# 终端 2 - 启动前端
cd client
npm run dev
```

访问：http://localhost:5173

---

## 📁 项目结构

```
samoyed-chat/
├── server/                 # 后端服务
│   ├── routes/            # API 路由
│   ├── models/            # 数据模型
│   ├── middleware/        # 中间件
│   ├── utils/             # 工具函数
│   └── uploads/           # 临时上传目录
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── utils/         # 工具函数
│   │   └── assets/        # 静态资源
│   └── public/
└── README.md
```

---

## 🔧 配置说明

### 环境变量 (.env)

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_PATH=./data/chat.db

# JWT 配置
JWT_SECRET=your-secret-key-here

# 阿里云 OSS 配置
OSS_BUCKET=annsight-images
OSS_ENDPOINT=oss-cn-shenzhen.aliyuncs.com
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_CDN_URL=https://annsight-images.oss-cn-shenzhen.aliyuncs.com
```

---

## 📖 API 文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/pair | 情侣配对 |

### 消息接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/messages | 获取聊天记录 |
| POST | /api/messages | 发送消息 |
| DELETE | /api/messages/:id | 删除消息 |

### 上传接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/upload/image | 上传图片 |
| POST | /api/upload/video | 上传视频 |

---

## 🎨 主题色

| 颜色 | 色值 | 用途 |
|------|------|------|
| 萨摩耶白 | `#FFFFFF` | 主背景 |
| 暖粉色 | `#FFB6C1` | 强调色 |
| 深空灰 | `#2D3748` | 文字 |
| 奶油色 | `#FFF5F7` | 次要背景 |

---

## 🔒 安全说明

- 所有通信使用 HTTPS 加密
- 密码使用 bcrypt 加密存储
- JWT Token 24 小时过期
- 文件上传限制大小和类型
- 情侣配对需双方确认

---

## 📝 开发日志

- 2026-03-07: 项目初始化，完成基础架构

---

**以毛茸茸的萨摩耶见证你们的爱情** 🐕💕
