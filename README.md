# 🐕 萨摩耶之家 - Samoyed Home

> 专为狗狗和主人打造的记录空间 · 以萨摩耶为伴 · 记录成长点滴

**技术栈**: Node.js + Express + Socket.io + React + 阿里云 OSS

---

## 🌟 功能特性

- 💬 **实时聊天** - WebSocket 双工通信，消息即时送达
- 🖼️ **图片分享** - 阿里云 OSS 存储，高清无损
- 🎥 **视频分享** - 支持 MP4 格式视频上传
- 🎤 **语音消息** - 浏览器原生录音，类似微信体验 ✨ NEW
- 🐕 **萨摩耶主题** - 可爱治愈系 UI 设计
- 🔐 **家人绑定** - 邀请码机制，私密空间
- 📱 **移动优先** - 完美适配手机屏幕
- 🎨 **微信风格** - 熟悉的聊天体验

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
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   └── models/        # 数据模型
│   └── .env               # 环境配置
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   └── pages/         # 页面
│   └── package.json
└── README.md
```

---

## 🔧 配置说明

### 环境变量 (.env)

```bash
# 服务器配置
PORT=3000

# JWT 配置
JWT_SECRET=your-secret-key

# 阿里云 OSS 配置
OSS_BUCKET=annsight-images
OSS_ENDPOINT=oss-cn-shenzhen.aliyuncs.com
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_CDN_URL=https://annsight-images.oss-cn-shenzhen.aliyuncs.com
```

---

## 📖 使用流程

1. **注册账号** - 创建你的账号
2. **生成邀请码** - 分享给家人
3. **绑定关系** - 家人输入邀请码
4. **开始聊天** - 发送文字、图片、视频、语音 🎤

---

## 🎨 界面特色

- 微信风格输入框
- 个人信息侧边栏
- 实时消息同步
- 输入状态提示
- 在线状态显示

---

## 📝 开发日志

- 2026-03-07: 项目初始化，完成基础架构

---

**陪伴是最长情的告白** 🐾

*记录你和毛孩子的每一个温馨瞬间*
