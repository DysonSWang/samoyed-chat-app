#!/bin/bash

# 🐕 萨摩耶聊天室 - 启动脚本（含语音功能）
# 用法：./start-with-voice.sh

echo "🐕 萨摩耶聊天室 - 启动中..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"
echo ""

# 检查后端依赖
if [ ! -d "server/node_modules" ]; then
    echo "⚠️  后端依赖未安装，正在安装..."
    cd server
    npm install
    cd ..
    echo "✅ 后端依赖安装完成"
fi

# 检查前端依赖
if [ ! -d "client/node_modules" ]; then
    echo "⚠️  前端依赖未安装，正在安装..."
    cd client
    npm install
    cd ..
    echo "✅ 前端依赖安装完成"
fi

# 检查 .env 文件
if [ ! -f "server/.env" ]; then
    echo "⚠️  后端配置文件不存在，从示例创建..."
    cp server/.env.example server/.env
    echo "⚠️  请编辑 server/.env 配置 OSS 和 JWT 密钥"
    exit 1
fi

echo "📁 项目结构检查完成"
echo ""
echo "🚀 启动服务..."
echo ""
echo "====================================="
echo "🎤 语音功能已启用！"
echo "====================================="
echo ""
echo "📱 访问地址：http://localhost:5173"
echo "🔧 后端 API: http://localhost:3000"
echo ""
echo "🎯 测试语音功能："
echo "  1. 注册两个账号"
echo "  2. 完成配对"
echo "  3. 点击 ⋮ → 🎤 开始录音"
echo ""
echo "====================================="
echo ""

# 启动后端（后台）
echo "🔧 启动后端服务..."
cd server
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 2

# 检查后端是否启动成功
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
else
    echo "❌ 后端服务启动失败，请查看 backend.log"
    exit 1
fi

# 启动前端（后台）
echo "🎨 启动前端服务..."
cd client
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

sleep 2

# 检查前端是否启动成功
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
else
    echo "❌ 前端服务启动失败，请查看 frontend.log"
    exit 1
fi

echo ""
echo "====================================="
echo "✨ 所有服务已启动！"
echo "====================================="
echo ""
echo "📋 快速操作："
echo "  - 停止服务：pkill -f 'npm run dev'"
echo "  - 查看日志：tail -f backend.log 或 frontend.log"
echo "  - 重启服务：先停止，再运行此脚本"
echo ""
echo "🎤 语音功能测试："
echo "  1. 打开浏览器访问 http://localhost:5173"
echo "  2. 允许麦克风权限"
echo "  3. 点击 ⋮ → 🎤 开始录音"
echo ""
echo "====================================="
echo ""

# 保持脚本运行
wait
