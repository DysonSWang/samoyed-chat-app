# 🐕 萨摩耶之恋 - 快速部署指南

## 一键启动

```bash
cd /root/.openclaw/workspace/samoyed-chat
./start.sh
```

启动后访问：**http://localhost:5173**

---

## 手动启动

### 1. 启动后端

```bash
cd server
npm install
npm run dev
```

后端运行在：**http://localhost:3000**

### 2. 启动前端（新终端）

```bash
cd client
npm install
npm run dev
```

前端运行在：**http://localhost:5173**

---

## 使用流程

### 第一步：注册账号

1. 访问 http://localhost:5173
2. 点击「立即注册」
3. 填写用户名、密码、昵称

### 第二步：生成邀请码

1. 登录后自动进入配对页面
2. 点击「生成邀请码」
3. 复制 8 位邀请码

### 第三步：邀请 TA

1. 将邀请码发送给另一半
2. TA 注册账号后，在配对页面输入邀请码
3. 点击「确认配对」

### 第四步：开始聊天

1. 配对成功后自动进入聊天室
2. 可以发送文字、图片、视频
3. 所有消息实时同步

---

## 功能说明

### 💬 文字聊天
- 支持实时消息推送
- 显示对方输入状态
- 显示在线/离线状态

### 🖼️ 图片分享
- 点击📎按钮选择图片
- 自动上传到阿里云 OSS
- 支持 JPG、PNG、GIF、WebP 格式
- 最大 20MB

### 🎥 视频分享
- 点击📎按钮选择视频
- 自动上传到阿里云 OSS
- 支持 MP4、WebM 格式
- 最大 20MB

---

## 配置说明

### 后端配置 (server/.env)

```bash
# 服务器端口
PORT=3000

# JWT 密钥（生产环境请修改）
JWT_SECRET=your-secret-key

# 阿里云 OSS 配置
OSS_BUCKET=annsight-images
OSS_ENDPOINT=oss-cn-shenzhen.aliyuncs.com
OSS_ACCESS_KEY_ID=你的 AccessKey ID
OSS_ACCESS_KEY_SECRET=你的 AccessKey Secret
OSS_CDN_URL=https://annsight-images.oss-cn-shenzhen.aliyuncs.com
```

### 前端配置

前端通过 Vite 代理自动连接后端，无需额外配置。

如需修改后端地址，编辑 `client/vite.config.js`：

```javascript
proxy: {
  '/api': {
    target: 'http://your-server:3000',
    changeOrigin: true
  }
}
```

---

## 生产部署

### 1. 构建前端

```bash
cd client
npm run build
```

构建产物在 `client/dist` 目录。

### 2. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/samoyed-chat/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 支持
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. 启动后端（生产模式）

```bash
cd server
NODE_ENV=production npm start
```

### 4. 使用 PM2 管理（推荐）

```bash
npm install -g pm2

cd /path/to/samoyed-chat/server
pm2 start src/index.js --name samoyed-chat
pm2 save
pm2 startup
```

---

## 数据库

使用 SQLite，数据文件位于 `server/data/chat.db`。

### 备份数据库

```bash
cp server/data/chat.db chat.db.backup
```

### 重置数据库

```bash
rm server/data/chat.db
# 重启服务会自动创建新数据库
```

---

## 常见问题

### Q: 图片/视频上传失败？
A: 检查 OSS 配置是否正确，确保 AccessKey 有效且有写入权限。

### Q: WebSocket 连接失败？
A: 检查防火墙是否开放 3000 端口，Nginx 是否正确配置 WebSocket 代理。

### Q: 配对后看不到对方消息？
A: 刷新页面重新连接 WebSocket，确保双方都已登录。

### Q: 如何修改主题色？
A: 编辑 `client/src/index.css`，修改 `:root` 中的颜色变量。

---

## 技术支持

如有问题，请查看：
- 后端日志：终端输出
- 前端控制台：浏览器 F12

---

**祝你们使用愉快！🐕💕**
