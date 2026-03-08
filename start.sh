#!/bin/bash

# 萨摩耶之恋 - 启动脚本

echo "╔════════════════════════════════════════╗"
echo "║   🐕 萨摩耶之恋 - 情侣聊天应用        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 安装后端依赖
echo "📦 安装后端依赖..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   后端依赖已安装，跳过"
fi
cd ..

# 安装前端依赖
echo "📦 安装前端依赖..."
cd client
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   前端依赖已安装，跳过"
fi
cd ..

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   启动服务                             ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "后端服务：http://localhost:3000"
echo "前端服务：http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 启动后端
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

# 等待进程结束
wait $BACKEND_PID $FRONTEND_PID
