# 萨摩耶管理后台 - 前端

基于 React 18 + TypeScript + Ant Design 5.x 的管理后台前端应用。

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **UI 组件库**: Ant Design 5.x
- **状态管理**: Zustand
- **路由**: React Router 6
- **HTTP 客户端**: Axios
- **图表库**: @ant-design/plots
- **构建工具**: Vite 5.x

## 功能模块

- ✅ 管理员登录/登出
- ✅ 仪表盘（数据统计概览）
- ✅ 用户管理（列表、详情、禁用/启用）
- ✅ 内容审核（消息列表、删除）
- ✅ 数据统计（用户增长、消息量、配对率）
- ✅ 管理员管理（仅超级管理员）

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

修改 `.env` 中的 API 地址：

```env
VITE_API_BASE_URL=http://localhost:3001/api/admin
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 默认账号

- 用户名：`admin`
- 密码：`admin123`

⚠️ **首次登录后请立即修改密码！**

## 目录结构

```
admin-frontend/
├── src/
│   ├── api/           # API 接口
│   ├── components/    # 通用组件
│   ├── pages/         # 页面组件
│   ├── store/         # 状态管理
│   ├── types/         # TypeScript 类型
│   ├── utils/         # 工具函数
│   ├── App.tsx        # 应用入口
│   └── main.tsx       # 入口文件
├── .env               # 环境变量
├── .env.example       # 环境变量示例
└── package.json
```

## API 接口

详见：[../docs/api/admin-api.md](../docs/api/admin-api.md)

## 开发规范

- 使用 TypeScript 严格模式
- 组件使用函数式写法
- 状态管理使用 Zustand
- API 请求统一封装在 `src/utils/request.ts`
- 错误处理统一在请求拦截器中处理

---

**最后更新**: 2026-03-09  
**版本**: v1.0.0
