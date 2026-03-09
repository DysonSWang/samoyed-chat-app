# 萨摩耶情侣聊天应用 - 生产部署指南

## 📋 部署清单

### 前置条件
- [x] Node.js 18+ 已安装
- [ ] 域名已解析到服务器
- [ ] Nginx 已安装
- [ ] SSL 证书 (Let's Encrypt)

---

## 🚀 部署步骤

### 1. 构建生产版本

```bash
cd /root/.openclaw/workspace/samoyed-chat

# 构建聊天应用前端
cd client && npm run build && cd ..

# 构建管理后台前端
cd admin-frontend && npm run build && cd ..
```

### 2. 安装 PM2 (进程管理)

```bash
npm install -g pm2
```

### 3. 启动服务 (PM2)

```bash
cd /root/.openclaw/workspace/samoyed-chat

# 启动聊天后端
pm2 start server/src/index.js --name samoyed-chat-backend --interpreter node

# 启动管理后台后端
pm2 start admin-backend/src/index.js --name samoyed-admin-backend --interpreter node --cwd admin-backend

# 保存 PM2 配置 (开机自启)
pm2 save
pm2 startup
```

### 4. 配置 Nginx

```bash
# 复制配置文件
sudo cp nginx-prod.conf /etc/nginx/sites-available/samoyed

# 创建软链接
sudo ln -s /etc/nginx/sites-available/samoyed /etc/nginx/sites-enabled/

# 修改域名 (编辑 nginx-prod.conf，替换 your-domain.com)
sudo nano /etc/nginx/sites-available/samoyed

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 5. 配置 SSL 证书 (Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 6. 防火墙配置

```bash
# 开放 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 重启防火墙
sudo ufw reload
```

---

## 📁 目录结构

```
/root/.openclaw/workspace/samoyed-chat/
├── client/dist/              # 聊天前端生产构建
├── admin-frontend/dist/      # 管理后台前端生产构建
├── server/                   # 聊天后端
├── admin-backend/            # 管理后台后端
├── nginx-prod.conf           # Nginx 配置
└── DEPLOY.md                 # 本文件
```

---

## 🔧 PM2 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs samoyed-chat-backend
pm2 logs samoyed-admin-backend

# 重启服务
pm2 restart samoyed-chat-backend
pm2 restart samoyed-admin-backend

# 停止服务
pm2 stop samoyed-chat-backend
pm2 stop samoyed-admin-backend

# 删除服务
pm2 delete samoyed-chat-backend
pm2 delete samoyed-admin-backend

# 监控
pm2 monit
```

---

## 🌐 访问地址

| 服务 | 地址 |
|------|------|
| 聊天应用 | https://your-domain.com |
| 管理后台 | https://your-domain.com/admin/ |
| 健康检查 | https://your-domain.com/health |

---

## 🔐 默认管理员账号

```
用户名：admin
密码：admin123
```

⚠️ **首次登录后请立即修改密码！**

---

## 📊 监控与日志

### 应用日志
```bash
# 聊天后端
tail -f /root/.openclaw/workspace/samoyed-chat/backend.log

# 管理后台后端
tail -f /root/.openclaw/workspace/samoyed-chat/admin-backend/backend.log
```

### Nginx 日志
```bash
# 访问日志
tail -f /var/log/nginx/samoyed-access.log

# 错误日志
tail -f /var/log/nginx/samoyed-error.log
```

---

## 🔄 更新部署

```bash
# 1. 拉取最新代码
cd /root/.openclaw/workspace/samoyed-chat
git pull

# 2. 重新构建前端
cd client && npm run build && cd ..
cd admin-frontend && npm run build && cd ..

# 3. 重启后端服务
pm2 restart samoyed-chat-backend
pm2 restart samoyed-admin-backend

# 4. 重载 Nginx (如修改了配置)
sudo systemctl reload nginx
```

---

## ⚠️ 注意事项

1. **数据库备份**: 定期备份 `server/data/chat.db`
2. **日志轮转**: 配置 logrotate 防止日志过大
3. **监控告警**: 建议配置服务器监控 (如 Prometheus + Grafana)
4. **安全更新**: 定期更新系统和依赖包

---

**最后更新**: 2026-03-09  
**版本**: v1.0.0
