#!/bin/bash
# 萨摩耶管理后台 API 测试脚本

BASE_URL="http://localhost:3001/api/admin"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "======================================"
echo "🐕 萨摩耶管理后台 API 测试"
echo "======================================"
echo ""

# 1. 健康检查
echo "1️⃣  健康检查..."
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q "萨摩耶管理后台服务运行中"; then
    echo -e "${GREEN}✅ 健康检查通过${NC}"
else
    echo -e "${RED}❌ 健康检查失败${NC}"
fi
echo ""

# 2. 登录
echo "2️⃣  管理员登录..."
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ 登录成功${NC}"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ 登录失败${NC}"
    echo "$LOGIN_RESP"
    exit 1
fi
echo ""

# 3. 获取个人信息
echo "3️⃣  获取个人信息..."
PROFILE=$(curl -s "$BASE_URL/profile" -H "Authorization: Bearer $TOKEN")
if echo "$PROFILE" | grep -q "success"; then
    echo -e "${GREEN}✅ 获取个人信息成功${NC}"
    echo "$PROFILE" | grep -o '"nickname":"[^"]*"' || true
else
    echo -e "${RED}❌ 获取个人信息失败${NC}"
fi
echo ""

# 4. 获取用户列表
echo "4️⃣  获取用户列表..."
USERS=$(curl -s "$BASE_URL/users?page=1&pageSize=10" -H "Authorization: Bearer $TOKEN")
if echo "$USERS" | grep -q "success"; then
    echo -e "${GREEN}✅ 获取用户列表成功${NC}"
    TOTAL=$(echo "$USERS" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "   用户总数：$TOTAL"
else
    echo -e "${RED}❌ 获取用户列表失败${NC}"
fi
echo ""

# 5. 获取统计概览
echo "5️⃣  获取统计概览..."
STATS=$(curl -s "$BASE_URL/stats/overview" -H "Authorization: Bearer $TOKEN")
if echo "$STATS" | grep -q "success"; then
    echo -e "${GREEN}✅ 获取统计概览成功${NC}"
    echo "$STATS" | grep -o '"total":[0-9]*' | head -3 || true
else
    echo -e "${RED}❌ 获取统计概览失败${NC}"
fi
echo ""

# 6. 获取消息列表
echo "6️⃣  获取消息列表..."
MESSAGES=$(curl -s "$BASE_URL/messages?page=1&pageSize=5" -H "Authorization: Bearer $TOKEN")
if echo "$MESSAGES" | grep -q "success"; then
    echo -e "${GREEN}✅ 获取消息列表成功${NC}"
    TOTAL=$(echo "$MESSAGES" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "   消息总数：$TOTAL"
else
    echo -e "${RED}❌ 获取消息列表失败${NC}"
fi
echo ""

# 7. 获取操作日志
echo "7️⃣  获取操作日志..."
LOGS=$(curl -s "$BASE_URL/logs?page=1&pageSize=5" -H "Authorization: Bearer $TOKEN")
if echo "$LOGS" | grep -q "success"; then
    echo -e "${GREEN}✅ 获取操作日志成功${NC}"
else
    echo -e "${RED}❌ 获取操作日志失败${NC}"
fi
echo ""

# 8. 登出
echo "8️⃣  管理员登出..."
LOGOUT=$(curl -s -X POST "$BASE_URL/logout" -H "Authorization: Bearer $TOKEN")
if echo "$LOGOUT" | grep -q "success"; then
    echo -e "${GREEN}✅ 登出成功${NC}"
else
    echo -e "${RED}❌ 登出失败${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}🎉 所有测试完成!${NC}"
echo "======================================"
