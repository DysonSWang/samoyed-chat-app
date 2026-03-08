#!/bin/bash

# 多 Agent 协作系统启动脚本

echo "╔══════════════════════════════════════════════════════╗"
echo "║     🤖 多 Agent 协作开发系统 - 启动中...            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

WORKSPACE="/root/.openclaw/workspace/samoyed-chat"
AGENTS_DIR="$WORKSPACE/.agents"

# 检查配置
echo "📋 检查配置文件..."
for config in pm-config.json architect-config.json developer-config.json qa-config.json; do
    if [ -f "$AGENTS_DIR/$config" ]; then
        echo "  ✅ $config"
    else
        echo "  ❌ $config 不存在"
        exit 1
    fi
done

# 初始化状态
echo ""
echo "📊 初始化 Agent 状态..."
cat > "$AGENTS_DIR/status.json" << 'EOF'
{
  "sprint": {
    "current": "sprint-001",
    "start": "2026-03-09",
    "end": "2026-03-11",
    "status": "IN_PROGRESS"
  },
  "agents": {
    "pm": { "status": "ACTIVE", "currentTask": "TASK-PM-001" },
    "architect": { "status": "READY", "currentTask": null },
    "developer": { "status": "IDLE", "currentTask": null, "blockedBy": "TASK-ARCH-001" },
    "qa": { "status": "IDLE", "currentTask": null, "blockedBy": "TASK-DEV-002" }
  },
  "tasks": { "total": 10, "todo": 8, "inProgress": 1, "blocked": 2, "done": 0 },
  "lastUpdate": "$(date -Iseconds)"
}
EOF
echo "  ✅ 状态初始化完成"

# 显示团队状态
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              👥 团队状态                             ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  📦 产品经理 (PM)     : 🟢 已启动                     ║"
echo "║  🏗️  架构师 (ARCH)    : 🟡 准备中                     ║"
echo "║  💻 全栈工程师 (DEV)  : ⏸️ 等待任务                   ║"
echo "║  🧪 测试工程师 (QA)   : ⏸️ 等待任务                   ║"
echo "╚══════════════════════════════════════════════════════╝"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              📋 Sprint 001 任务                      ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  🏗️  TASK-ARCH-001: 管理后台架构设计  [进行中]      ║"
echo "║  💻  TASK-DEV-001:  项目初始化        [等待中]      ║"
echo "║  💻  TASK-DEV-002:  用户管理功能      [等待中]      ║"
echo "║  🧪  TASK-QA-001:   测试计划制定      [等待中]      ║"
echo "║  🧪  TASK-QA-002:   用户管理测试      [等待中]      ║"
echo "╚══════════════════════════════════════════════════════╝"

echo ""
echo "✅ Agent 团队启动完成！"
echo ""
echo "📁 工作目录：$WORKSPACE"
echo "📂 任务目录：$WORKSPACE/tasks"
echo "📄 文档目录：$WORKSPACE/docs"
echo "📊 报告目录：$WORKSPACE/reports"
echo ""
echo "🚀 开始第一个迭代！"
