# 管理后台数据库设计文档

**版本**: v1.0  
**创建时间**: 2026-03-09  
**状态**: ✅ 完成

---

## 1. 概述

管理后台与现有聊天应用**共享数据库**，新增两个表：
- `admins` - 管理员表
- `operation_logs` - 操作日志表

---

## 2. 新增表结构

### 2.1 admins (管理员表)

```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT,
  role TEXT NOT NULL DEFAULT 'admin',  -- 'super' | 'admin'
  status INTEGER NOT NULL DEFAULT 1,   -- 1:启用，0:禁用
  last_login_at DATETIME,
  last_login_ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_status ON admins(status);
```

#### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 主键，自增 |
| username | TEXT | 是 | 用户名，唯一 |
| password_hash | TEXT | 是 | bcrypt 加密后的密码 |
| nickname | TEXT | 否 | 昵称 |
| role | TEXT | 是 | 角色：super(超级管理员) / admin(普通管理员) |
| status | INTEGER | 是 | 状态：1 启用 / 0 禁用 |
| last_login_at | DATETIME | 否 | 最后登录时间 |
| last_login_ip | TEXT | 否 | 最后登录 IP |
| created_at | DATETIME | 是 | 创建时间 |
| updated_at | DATETIME | 是 | 更新时间 |

#### 角色权限

| 角色 | 权限 |
|------|------|
| super | 所有权限，包括管理员管理 |
| admin | 用户管理、内容审核、数据统计 |

---

### 2.2 operation_logs (操作日志表)

```sql
CREATE TABLE operation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  target_description TEXT,
  result TEXT NOT NULL,  -- 'success' | 'failure'
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- 索引
CREATE INDEX idx_logs_admin_id ON operation_logs(admin_id);
CREATE INDEX idx_logs_action ON operation_logs(action);
CREATE INDEX idx_logs_created_at ON operation_logs(created_at);
```

#### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 主键，自增 |
| admin_id | INTEGER | 是 | 管理员 ID，外键 |
| action | TEXT | 是 | 操作类型 (LOGIN, USER_DISABLE, MESSAGE_DELETE 等) |
| target_type | TEXT | 否 | 操作对象类型 (USER, MESSAGE, COUPLE 等) |
| target_id | INTEGER | 否 | 操作对象 ID |
| target_description | TEXT | 否 | 操作对象描述 |
| result | TEXT | 是 | 操作结果：success / failure |
| error_message | TEXT | 否 | 错误信息 |
| ip_address | TEXT | 否 | 操作 IP |
| user_agent | TEXT | 否 | 浏览器信息 |
| created_at | DATETIME | 是 | 操作时间 |

#### 操作类型 (action)

| 操作类型 | 说明 |
|----------|------|
| LOGIN | 管理员登录 |
| LOGOUT | 管理员登出 |
| USER_VIEW | 查看用户 |
| USER_DISABLE | 禁用用户 |
| USER_ENABLE | 启用用户 |
| MESSAGE_VIEW | 查看消息 |
| MESSAGE_DELETE | 删除消息 |
| COUPLE_VIEW | 查看情侣关系 |
| STATS_VIEW | 查看统计 |

---

## 3. 现有表复用

管理后台直接复用现有聊天应用的表：

| 表名 | 用途 | 权限 |
|------|------|------|
| users | 用户管理 | 读 + 更新 status |
| couples | 情侣关系管理 | 读 |
| messages | 内容审核 | 读 + 删除 |
| (其他表) | 数据统计 | 只读 |

---

## 4. ER 关系图

```
┌─────────────────┐
│     admins      │
│─────────────────│
│ PK id           │
│    username     │
│    password_hash│
│    role         │
│    status       │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐
│ operation_logs  │
│─────────────────│
│ PK id           │
│ FK admin_id     │
│    action       │
│    target_type  │
│    result       │
│    created_at   │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│      users      │     │     couples     │
│─────────────────│     │─────────────────│
│ PK id           │     │ PK id           │
│    username     │     │    user1_id     │
│    password_hash│     │    user2_id     │
│    status       │     │    status       │
│    created_at   │     │    created_at   │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         └───────────┬───────────┘
                     │
                     │ (管理后台只读查看)
                     ▼
            ┌─────────────────┐
            │    messages     │
            │─────────────────│
            │ PK id           │
            │ FK couple_id    │
            │ FK sender_id    │
            │    content      │
            │    type         │
            │    created_at   │
            └─────────────────┘
```

---

## 5. 数据库初始化脚本

```sql
-- 1. 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  status INTEGER NOT NULL DEFAULT 1,
  last_login_at DATETIME,
  last_login_ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  target_description TEXT,
  result TEXT NOT NULL,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_logs_admin_id ON operation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON operation_logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON operation_logs(created_at);

-- 4. 插入默认超级管理员 (密码：admin123)
-- 注意：实际密码需要使用 bcrypt 加密
INSERT OR IGNORE INTO admins (username, password_hash, nickname, role, status)
VALUES ('admin', '$2a$10$...', '超级管理员', 'super', 1);
```

---

## 6. 数据迁移计划

### 6.1 开发环境
```bash
cd admin-backend
node scripts/init-db.js
```

### 6.2 生产环境
```bash
# 备份数据库
cp server/data/chat.db chat.db.backup.$(date +%Y%m%d)

# 执行迁移
node scripts/migrate.js
```

---

## 7. 安全注意事项

1. **密码加密**: 使用 bcrypt，cost=10
2. **敏感操作**: 删除、禁用等操作必须记录日志
3. **数据备份**: 定期备份数据库
4. **权限控制**: 超级管理员才能管理其他管理员

---

**最后更新**: 2026-03-09  
**下一步**: 根据此设计创建数据库迁移脚本
