#!/bin/bash
# 本地模拟 GitHub Actions 构建流程

set -e

cd /home/admin/openclaw/workspace/samoyed-chat-app/client

echo "=== 1. 清理旧构建 ==="
rm -rf dist/
rm -rf android/app/src/main/assets/public/*

echo "=== 2. 安装依赖 ==="
npm ci

echo "=== 3. 构建前端 ==="
npm run build

echo "=== 4. 检查 dist 目录 ==="
ls -la dist/

echo "=== 5. Sync Capacitor ==="
npx cap sync android

echo "=== 6. 检查 android 目录 ==="
ls -la android/app/src/main/assets/public/

echo "=== 7. 尝试构建 APK ==="
cd android
./gradlew clean assembleDebug --no-daemon --stacktrace 2>&1 | tee /tmp/gradle-build.log

echo "=== 8. 检查 APK 输出 ==="
ls -la app/build/outputs/apk/debug/ 2>/dev/null || echo "APK 未生成"

echo "=== 完成 ==="
