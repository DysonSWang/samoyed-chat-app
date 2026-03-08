#!/bin/bash

# 萨摩耶之恋 - 后台守护启动脚本
# 使用 nohup 保证服务持续后台运行

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$SCRIPT_DIR/.pids"
LOG_DIR="$SCRIPT_DIR/.logs"

# 创建目录
mkdir -p "$PID_DIR" "$LOG_DIR"

echo "╔════════════════════════════════════════╗"
echo "║   🐕 萨摩耶之恋 - 后台守护启动        ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"
echo ""

cd "$SCRIPT_DIR"

# 检查是否已在运行
check_running() {
    local service=$1
    local pid_file="$PID_DIR/${service}.pid"
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            return 0  # 正在运行
        else
            echo "⚠️  发现无效 PID 文件，清理中..."
            rm -f "$pid_file"
        fi
    fi
    return 1  # 未运行
}

# 停止服务
stop_service() {
    local service=$1
    local pid_file="$PID_DIR/${service}.pid"
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "⏹️  停止 $service (PID: $pid)..."
            kill $pid 2>/dev/null
            sleep 1
            # 如果还在运行，强制停止
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null
            fi
        fi
        rm -f "$pid_file"
    fi
}

# 安装依赖
install_deps() {
    local dir=$1
    local name=$2
    echo "📦 检查 $name 依赖..."
    cd "$dir"
    if [ ! -d "node_modules" ]; then
        echo "   安装中..."
        npm install --silent
        echo "   ✅ 安装完成"
    else
        echo "   ✅ 依赖已存在"
    fi
    cd "$SCRIPT_DIR"
}

# 主逻辑
case "${1:-start}" in
    start)
        echo "🚀 启动服务..."
        echo ""
        
        # 安装依赖
        install_deps "$SCRIPT_DIR/server" "后端"
        install_deps "$SCRIPT_DIR/client" "前端"
        echo ""
        
        # 启动后端
        if check_running "backend"; then
            echo "✅ 后端服务已在运行"
        else
            stop_service "backend"
            echo "📡 启动后端服务..."
            cd "$SCRIPT_DIR/server"
            nohup npm run dev > "$LOG_DIR/backend.log" 2>&1 &
            echo $! > "$PID_DIR/backend.pid"
            cd "$SCRIPT_DIR"
            sleep 3
            echo "   ✅ 后端已启动 (PID: $(cat $PID_DIR/backend.pid))"
        fi
        
        # 启动前端（确保绑定到 0.0.0.0）
        if check_running "frontend"; then
            echo "✅ 前端服务已在运行"
        else
            stop_service "frontend"
            echo "🌐 启动前端服务..."
            cd "$SCRIPT_DIR/client"
            # 明确指定 host 为 0.0.0.0
            nohup npx vite --host 0.0.0.0 --port 5173 > "$LOG_DIR/frontend.log" 2>&1 &
            echo $! > "$PID_DIR/frontend.pid"
            cd "$SCRIPT_DIR"
            sleep 3
            echo "   ✅ 前端已启动 (PID: $(cat $PID_DIR/frontend.pid))"
        fi
        
        echo ""
        echo "╔════════════════════════════════════════╗"
        echo "║   服务运行中                           ║"
        echo "╚════════════════════════════════════════╝"
        echo ""
        echo "🌐 前端：http://localhost:5173"
        echo "📡 后端：http://localhost:3000"
        echo ""
        echo "📁 日志目录：$LOG_DIR"
        echo "   - 后端日志：$LOG_DIR/backend.log"
        echo "   - 前端日志：$LOG_DIR/frontend.log"
        echo ""
        echo "💡 使用 './start-daemon.sh stop' 停止服务"
        echo "💡 使用 './start-daemon.sh status' 查看状态"
        echo "💡 使用 './start-daemon.sh restart' 重启服务"
        echo ""
        ;;
        
    stop)
        echo "⏹️  停止所有服务..."
        stop_service "frontend"
        stop_service "backend"
        echo "✅ 所有服务已停止"
        ;;
        
    restart)
        echo "🔄 重启所有服务..."
        stop_service "frontend"
        stop_service "backend"
        sleep 1
        $0 start
        ;;
        
    status)
        echo "📊 服务状态："
        echo ""
        for service in backend frontend; do
            pid_file="$PID_DIR/${service}.pid"
            if [ -f "$pid_file" ]; then
                pid=$(cat "$pid_file")
                if ps -p $pid > /dev/null 2>&1; then
                    echo "✅ $service: 运行中 (PID: $pid)"
                else
                    echo "❌ $service: 已停止 (PID 文件存在但进程不存在)"
                fi
            else
                echo "❌ $service: 未启动"
            fi
        done
        echo ""
        ;;
        
    logs)
        echo "📋 最新日志 (最后 50 行):"
        echo ""
        echo "=== 后端日志 ==="
        tail -50 "$LOG_DIR/backend.log" 2>/dev/null || echo "无日志"
        echo ""
        echo "=== 前端日志 ==="
        tail -50 "$LOG_DIR/frontend.log" 2>/dev/null || echo "无日志"
        ;;
        
    *)
        echo "用法：$0 {start|stop|restart|status|logs}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动服务 (后台运行)"
        echo "  stop    - 停止所有服务"
        echo "  restart - 重启所有服务"
        echo "  status  - 查看服务状态"
        echo "  logs    - 查看最新日志"
        exit 1
        ;;
esac
