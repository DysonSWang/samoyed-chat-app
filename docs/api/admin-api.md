# 管理后台 API 接口文档

**版本**: v1.0  
**创建时间**: 2026-03-09  
**状态**: ✅ 完成  
**基础路径**: `/api/admin`

---

## 1. 认证规范

### 1.1 认证方式
- JWT Token 认证
- Token 放在 Header: `Authorization: Bearer <token>`
- Token 有效期：24 小时

### 1.2 响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**失败响应**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### 1.3 通用错误码

| 错误码 | 说明 | HTTP 状态 |
|--------|------|----------|
| UNAUTHORIZED | 未认证 | 401 |
| FORBIDDEN | 无权限 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| VALIDATION_ERROR | 参数验证失败 | 400 |
| INTERNAL_ERROR | 服务器错误 | 500 |

---

## 2. 认证接口

### 2.1 管理员登录

**请求**:
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "nickname": "超级管理员",
      "role": "super",
      "last_login_at": "2026-03-09T12:00:00.000Z"
    }
  },
  "message": "登录成功"
}
```

**失败响应** (401):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "用户名或密码错误"
  }
}
```

---

### 2.2 管理员登出

**请求**:
```http
POST /api/admin/logout
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "message": "登出成功"
}
```

---

### 2.3 获取当前管理员信息

**请求**:
```http
GET /api/admin/profile
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "超级管理员",
    "role": "super",
    "status": 1,
    "last_login_at": "2026-03-09T12:00:00.000Z",
    "created_at": "2026-03-09T00:00:00.000Z"
  }
}
```

---

## 3. 用户管理接口

### 3.1 获取用户列表

**请求**:
```http
GET /api/admin/users?page=1&pageSize=20&keyword=xxx&status=1
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| keyword | string | 否 | 搜索关键词 (用户名/昵称) |
| status | number | 否 | 用户状态 (0/1) |

**响应** (200):
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "username": "user1",
        "nickname": "用户 1",
        "avatar": "https://...",
        "status": 1,
        "couple_id": 1,
        "created_at": "2026-03-07T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  }
}
```

---

### 3.2 获取用户详情

**请求**:
```http
GET /api/admin/users/:id
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user1",
    "nickname": "用户 1",
    "avatar": "https://...",
    "status": 1,
    "couple_id": 1,
    "couple": {
      "id": 1,
      "partner": {
        "id": 2,
        "username": "user2",
        "nickname": "用户 2"
      },
      "status": "active",
      "created_at": "2026-03-07T00:00:00.000Z"
    },
    "stats": {
      "message_count": 150,
      "total_login_days": 5
    },
    "created_at": "2026-03-07T00:00:00.000Z"
  }
}
```

---

### 3.3 禁用/启用用户

**请求**:
```http
PUT /api/admin/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 0  // 0:禁用，1:启用
}
```

**响应** (200):
```json
{
  "success": true,
  "message": "用户已禁用",
  "data": {
    "id": 1,
    "status": 0
  }
}
```

---

## 4. 内容审核接口

### 4.1 获取消息列表

**请求**:
```http
GET /api/admin/messages?page=1&pageSize=20&couple_id=1&type=text
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| couple_id | number | 否 | 情侣 ID 过滤 |
| type | string | 否 | 消息类型 (text/image/video/voice) |

**响应** (200):
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "couple_id": 1,
        "sender": {
          "id": 1,
          "username": "user1",
          "nickname": "用户 1"
        },
        "content": "你好",
        "type": "text",
        "media_url": null,
        "is_deleted": 0,
        "created_at": "2026-03-09T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 500,
      "page": 1,
      "pageSize": 20,
      "totalPages": 25
    }
  }
}
```

---

### 4.2 删除消息

**请求**:
```http
DELETE /api/admin/messages/:id
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "message": "消息已删除"
}
```

---

### 4.3 批量删除消息

**请求**:
```http
POST /api/admin/messages/batch-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

**响应** (200):
```json
{
  "success": true,
  "message": "已删除 3 条消息"
}
```

---

## 5. 数据统计接口

### 5.1 概览统计

**请求**:
```http
GET /api/admin/stats/overview
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active_today": 45,
      "active_week": 120
    },
    "couples": {
      "total": 75,
      "active": 68
    },
    "messages": {
      "total": 15000,
      "today": 350
    },
    "storage": {
      "images": "2.5 GB",
      "videos": "8.3 GB"
    }
  }
}
```

---

### 5.2 用户增长统计

**请求**:
```http
GET /api/admin/stats/users?days=30
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "labels": ["03-01", "03-02", ..., "03-09"],
    "new_users": [5, 8, 12, 7, 15, 10, 20, 18, 25],
    "active_users": [30, 35, 40, 38, 45, 42, 50, 48, 55]
  }
}
```

---

### 5.3 消息量统计

**请求**:
```http
GET /api/admin/stats/messages?days=7
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "labels": ["03-03", "03-04", ..., "03-09"],
    "messages": [200, 250, 300, 280, 350, 320, 400],
    "by_type": {
      "text": [150, 180, 220, 200, 260, 240, 300],
      "image": [40, 50, 60, 55, 70, 60, 80],
      "video": [5, 10, 10, 15, 10, 10, 12],
      "voice": [5, 10, 10, 10, 10, 10, 8]
    }
  }
}
```

---

### 5.4 配对成功率统计

**请求**:
```http
GET /api/admin/stats/couples
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "total_invites": 200,
    "accepted": 150,
    "success_rate": 75,
    "avg_accept_time_hours": 2.5
  }
}
```

---

## 6. 管理员管理接口 (仅超级管理员)

### 6.1 获取管理员列表

**请求**:
```http
GET /api/admin/managers
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "nickname": "超级管理员",
        "role": "super",
        "status": 1,
        "last_login_at": "2026-03-09T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 6.2 创建管理员

**请求**:
```http
POST /api/admin/managers
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newadmin",
  "password": "password123",
  "nickname": "新管理员",
  "role": "admin"
}
```

**响应** (201):
```json
{
  "success": true,
  "message": "管理员创建成功",
  "data": {
    "id": 2,
    "username": "newadmin",
    "nickname": "新管理员",
    "role": "admin"
  }
}
```

---

### 6.3 删除管理员

**请求**:
```http
DELETE /api/admin/managers/:id
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "message": "管理员已删除"
}
```

---

## 7. 操作日志接口

### 7.1 获取操作日志

**请求**:
```http
GET /api/admin/logs?page=1&pageSize=50&admin_id=1&action=LOGIN
Authorization: Bearer <token>
```

**响应** (200):
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "admin": {
          "id": 1,
          "username": "admin",
          "nickname": "超级管理员"
        },
        "action": "LOGIN",
        "result": "success",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-03-09T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 50,
      "totalPages": 2
    }
  }
}
```

---

## 8. WebSocket 接口 (可选)

### 8.1 实时通知

**连接**:
```
wss://your-domain.com/ws/admin?token=<jwt_token>
```

**推送事件**:
```json
{
  "type": "NEW_USER_REGISTERED",
  "data": {
    "user_id": 123,
    "username": "newuser"
  },
  "timestamp": "2026-03-09T12:00:00.000Z"
}
```

---

**最后更新**: 2026-03-09  
**下一步**: 根据此文档实现 API 接口
