# 管理后台架构设计文档

**状态**: 📝 DRAFT  
**作者**: @architect  
**创建时间**: 2026-03-09  
**版本**: v0.1  

---

## 1. 概述

### 1.1 项目背景

萨摩耶情侣聊天应用需要一个管理后台，用于：
- 用户管理
- 内容审核
- 数据统计
- 系统配置

### 1.2 设计目标

- 🔒 安全性：权限控制、操作审计
- 📈 扩展性：模块化设计，易于添加新功能
- 🎨 一致性：与现有应用风格统一
- ⚡ 高性能：快速响应，支持并发

---

## 2. 技术选型

### 2.1 前端技术栈

| 技术 | 选型 | 理由 |
|------|------|------|
| 框架 | React 18 | 与现有聊天应用一致，团队熟悉 |
| UI 库 | Ant Design 5.x | 丰富的管理组件，企业级设计 |
| 状态管理 | Zustand | 轻量简单，与现有项目一致 |
| 路由 | React Router 6 | 标准方案，支持嵌套路由 |
| 构建工具 | Vite 5.x | 快速热更新，与现有项目一致 |
| 语言 | TypeScript | 类型安全，减少运行时错误 |

### 2.2 后端技术栈

| 技术 | 选型 | 理由 |
|------|------|------|
| 框架 | Express | 与现有项目一致 |
| 认证 | JWT | 与现有项目一致 |
| 数据库 | SQLite | 与现有项目一致 |

---

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────┐
│                   管理员浏览器                    │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────────┐
│                    Nginx                         │
│              (反向代理 + SSL 终止)                │
└─────────┬─────────────────────┬─────────────────┘
          │                     │
┌─────────▼─────────┐  ┌────────▼────────┐
│   管理后台前端     │  │   管理后台 API   │
│   (port 3000)     │  │   (port 3001)   │
└───────────────────┘  └────────┬────────┘
                                │
                    ┌───────────▼───────────┐
                    │      SQLite 数据库     │
                    │  (与聊天应用共享)      │
                    └───────────────────────┘
```

### 3.2 模块划分

```
admin-backend/
├── frontend/           # 前端项目
│   ├── src/
│   │   ├── pages/     # 页面组件
│   │   ├── components/# 通用组件
│   │   ├── api/       # API 客户端
│   │   └── utils/     # 工具函数
│   └── public/
├── backend/            # 后端项目
│   ├── src/
│   │   ├── routes/    # 路由
│   │   ├── controllers/# 控制器
│   │   ├── models/    # 数据模型
│   │   ├── middleware/# 中间件
│   │   └── utils/     # 工具函数
│   └── data/          # 数据库文件
└── docs/              # 文档
```

---

## 4. 数据库设计

### 4.1 ER 图

```
┌─────────────────┐     ┌─────────────────┐
│    admins       │     │   operation_logs│
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ username        │     │ admin_id (FK)   │
│ password_hash   │     │ action          │
│ role            │     │ target          │
│ status          │     │ result          │
│ created_at      │     │ created_at      │
│ last_login      │     └─────────────────┘
└─────────────────┘
```

### 4.2 表结构

#### admins 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| username | TEXT | 用户名（唯一） |
| password_hash | TEXT | 密码哈希 |
| role | TEXT | 角色（super/admin） |
| status | INTEGER | 状态（1 启用/0 禁用） |
| created_at | DATETIME | 创建时间 |
| last_login | DATETIME | 最后登录 |

#### operation_logs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| admin_id | INTEGER | 管理员 ID |
| action | TEXT | 操作类型 |
| target | TEXT | 操作对象 |
| result | TEXT | 操作结果 |
| created_at | DATETIME | 操作时间 |

---

## 5. API 设计

### 5.1 认证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/admin/login | POST | 管理员登录 |
| /api/admin/logout | POST | 管理员登出 |
| /api/admin/profile | GET | 获取当前管理员信息 |

### 5.2 用户管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/admin/users | GET | 用户列表 |
| /api/admin/users/:id | GET | 用户详情 |
| /api/admin/users/:id/status | PUT | 禁用/启用用户 |

### 5.3 内容审核接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/admin/messages | GET | 消息列表 |
| /api/admin/messages/:id | DELETE | 删除消息 |

### 5.4 统计接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/admin/stats/overview | GET | 概览统计 |
| /api/admin/stats/users | GET | 用户统计 |
| /api/admin/stats/messages | GET | 消息统计 |

---

## 6. 安全设计

### 6.1 认证授权

- JWT Token 认证
- Token 有效期 24 小时
- 支持 Token 刷新
- 管理员权限分级

### 6.2 安全措施

- 密码 bcrypt 加密
- HTTPS 传输加密
- SQL 注入防护
- XSS 防护
- CSRF 防护

### 6.3 操作审计

- 所有操作记录日志
- 敏感操作二次确认
- 异常登录告警

---

## 7. 部署架构

### 7.1 开发环境

```
localhost:3000 → 管理后台前端
localhost:3001 → 管理后台 API
```

### 7.2 生产环境

```
Nginx (443) → 管理后台前端 (3000)
           → 管理后台 API (3001)
```

---

## 8. 开发计划

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 1 | 项目初始化 | 2h |
| 2 | 认证功能 | 4h |
| 3 | 用户管理 | 6h |
| 4 | 内容审核 | 4h |
| 5 | 数据统计 | 4h |
| 6 | 测试优化 | 4h |

**总计**: 24 小时

---

## 9. 待决策事项

- [x] 前端框架选择（React vs Vue）→ **React 18**
- [x] UI 组件库选择 → **Ant Design 5.x**
- [x] 是否使用 TypeScript → **是**

---

## 10. 项目初始化命令

### 后端初始化
```bash
cd samoyed-chat
mkdir -p admin-backend/{src/{routes,controllers,models,middleware,utils},data}
cd admin-backend
npm init -y
npm install express better-sqlite3 jsonwebtoken bcryptjs cors helmet morgan
npm install -D nodemon
```

### 前端初始化
```bash
cd samoyed-chat
npm create vite@latest admin-frontend -- --template react-ts
cd admin-frontend
npm install
npm install antd zustand react-router-dom axios @ant-design/icons
npm install -D @types/node
```

---

## 11. 目录结构详情

```
samoyed-chat/
├── admin-backend/              # 管理后台后端
│   ├── src/
│   │   ├── index.js           # 入口文件
│   │   ├── routes/
│   │   │   ├── auth.js        # 认证路由
│   │   │   ├── users.js       # 用户管理路由
│   │   │   ├── messages.js    # 内容审核路由
│   │   │   └── stats.js       # 统计路由
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── messageController.js
│   │   │   └── statsController.js
│   │   ├── models/
│   │   │   ├── database.js    # 数据库连接
│   │   │   ├── admin.js       # 管理员模型
│   │   │   └── log.js         # 操作日志模型
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT 认证中间件
│   │   │   ├── rbac.js        # 权限控制中间件
│   │   │   └── logger.js      # 操作日志中间件
│   │   └── utils/
│   │       └── jwt.js         # JWT 工具
│   ├── data/
│   │   └── chat.db            # 共享数据库
│   ├── .env
│   └── package.json
│
├── admin-frontend/             # 管理后台前端
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx      # 登录页
│   │   │   ├── Dashboard.tsx  # 仪表盘
│   │   │   ├── Users.tsx      # 用户管理
│   │   │   ├── Messages.tsx   # 内容审核
│   │   │   └── Stats.tsx      # 数据统计
│   │   ├── components/
│   │   │   ├── Layout.tsx     # 布局组件
│   │   │   ├── Sidebar.tsx    # 侧边栏
│   │   │   └── Header.tsx     # 顶部导航
│   │   ├── api/
│   │   │   └── index.ts       # API 客户端
│   │   ├── store/
│   │   │   └── authStore.ts   # 认证状态
│   │   └── utils/
│   │       └── request.ts     # 请求封装
│   └── package.json
│
└── docs/
    └── architecture/
        └── admin-backend.md   # 本文档
```

---

**最后更新**: 2026-03-09 12:00  
**状态**: ✅ 架构设计完成  
**下一步**: 开始项目初始化 (TASK-DEV-001)
