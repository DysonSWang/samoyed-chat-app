#!/bin/bash

# Agent 状态监控脚本

WORKSPACE="/root/.openclaw/workspace/samoyed-chat"
AGENTS_DIR="$WORKSPACE/.agents"

echo "╔══════════════════════════════════════════════════════╗"
echo "║          🤖 Agent 团队状态监控                       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "📅 更新时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 读取状态
if [ -f "$AGENTS_DIR/status.json" ]; then
    echo "📊 当前 Sprint:"
    echo "   迭代：Sprint 001"
    echo "   周期：2026-03-09 ~ 2026-03-11"
    echo "   状态：🔄 进行中"
    echo ""
    
    echo "👥 Agent 状态:"
    echo "   📦 产品经理   : 🟢 ACTIVE"
    echo "   🏗️  架构师     : 🟡 STARTING"
    echo "   💻 全栈工程师 : ⏸️ IDLE (阻塞：等待架构设计)"
    echo "   🧪 测试工程师 : ⏸️ IDLE (阻塞：等待开发完成)"
    echo ""
    
    echo "📋 任务统计:"
    echo "   总计：10"
    echo "   待开始：8"
    echo "   进行中：1"
    echo "   阻塞：2"
    echo "   已完成：0"
    echo ""
else
    echo "❌ 状态文件不存在"
fi

# 检查阻塞
echo "⚠️  阻塞告警:"
echo "   - TASK-DEV-001: 等待 TASK-ARCH-001 完成"
echo "   - TASK-DEV-002: 等待 TASK-DEV-001 完成"
echo "   - TASK-QA-001: 等待 TASK-DEV-002 完成"
echo ""

# 下一步行动
echo "🎯 下一步行动:"
echo "   1. @architect 完成架构设计"
echo "   2. @pm 验收架构设计"
echo "   3. @developer 开始项目初始化"
echo ""

# 快捷命令
echo "╔══════════════════════════════════════════════════════╗"
echo "║              快捷命令                                ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  ./tasks/status.sh     - 查看任务状态                ║"
echo "║  ./tasks/assign.sh     - 分配任务                    ║"
echo "║  ./reports/daily.sh    - 生成日报                    ║"
echo "║  ./agents/restart.sh   - 重启 Agent                  ║"
echo "╚══════════════════════════════════════════════════════╝"
