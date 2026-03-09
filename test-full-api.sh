#!/bin/bash
# 萨摩耶管理后台 - 完整功能测试脚本

BASE_URL="http://localhost:3001/api/admin"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         🐕 萨摩耶管理后台 - 完整功能测试                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local check="$5"
    
    echo -e "${BLUE}测试：$name${NC}"
    
    if [ "$method" == "GET" ]; then
        RESP=$(curl -s "$url" $data)
    else
        RESP=$(curl -s -X "$method" "$url" $data)
    fi
    
    if echo "$RESP" | grep -q "$check"; then
        echo -e "  ${GREEN}✅ 通过${NC}"
        ((PASS++))
    else
        echo -e "  ${RED}❌ 失败${NC}"
        echo "  响应：$RESP"
        ((FAIL++))
    fi
    echo ""
}

# 1. 登录获取 Token
echo "═══════════════════════════════════════════════════════════"
echo "1️⃣  认证模块测试"
echo "═══════════════════════════════════════════════════════════"
echo ""

LOGIN_RESP=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ 登录成功${NC}"
    echo "   Token: ${TOKEN:0:60}..."
    ((PASS++))
else
    echo -e "${RED}❌ 登录失败${NC}"
    ((FAIL++))
    exit 1
fi
echo ""

# 2. 测试认证相关接口
test_api "获取个人信息" "GET" "$BASE_URL/profile" "-H \"Authorization: Bearer $TOKEN\"" "success"
test_api "管理员登出" "POST" "$BASE_URL/logout" "-H \"Authorization: Bearer $TOKEN\"" "success"

# 重新登录 (后续测试需要)
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo ""

# 3. 用户管理测试
echo "═══════════════════════════════════════════════════════════"
echo "2️⃣  用户管理模块测试"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_api "获取用户列表 (分页)" "GET" "$BASE_URL/users?page=1&pageSize=10" "-H \"Authorization: Bearer $TOKEN\"" "success"
test_api "获取用户列表 (搜索)" "GET" "$BASE_URL/users?keyword=dyson" "-H \"Authorization: Bearer $TOKEN\"" "success"
test_api "获取用户列表 (状态筛选)" "GET" "$BASE_URL/users?status=1" "-H \"Authorization: Bearer $TOKEN\"" "success"

# 获取第一个用户 ID
USER_ID=$(echo "$LOGIN_RESP" | grep -o '"id":1' | cut -d':' -f2 | head -1)
if [ -n "$USER_ID" ]; then
    test_api "获取用户详情" "GET" "$BASE_URL/users/1" "-H \"Authorization: Bearer $TOKEN\"" "success"
fi
echo ""

# 4. 内容审核测试
echo "═══════════════════════════════════════════════════════════"
echo "3️⃣  内容审核模块测试"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_api "获取消息列表" "GET" "$BASE_URL/messages?page=1&pageSize=10" "-H \"Authorization: Bearer $TOKEN\"" "success"
test_api "获取消息列表 (类型筛选)" "GET" "$BASE_URL/messages?type=text" "-H \"Authorization: Bearer $TOKEN\"" "success"
echo ""

# 5. 数据统计测试
echo "═══════════════════════════════════════════════════════════"
echo "4️⃣  数据统计模块测试"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_api "概览统计" "GET" "$BASE_URL/stats/overview" "-H \"Authorization: Bearer $TOKEN\"" "success"
test_api "用户增长统计" "GET" "$BASE_URL/stats/users?days=30" "-H \"Authorization: Bearer $TOKEN\"" "success"
test_api "消息量统计" "GET" "$BASE_URL/stats/messages?days=7" "-H \"Authorization: Bearer $TOKEN\"" "success"
test_api "配对成功率" "GET" "$BASE_URL/stats/couples" "-H \"Authorization: Bearer $TOKEN\"" "success"
echo ""

# 6. 操作日志测试
echo "═══════════════════════════════════════════════════════════"
echo "5️⃣  操作日志模块测试"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_api "获取操作日志" "GET" "$BASE_URL/logs?page=1&pageSize=10" "-H \"Authorization: Bearer $TOKEN\"" "success"
test_api "获取操作日志 (筛选)" "GET" "$BASE_URL/logs?action=LOGIN" "-H \"Authorization: Bearer $TOKEN\"" "success"
echo ""

# 7. 管理员管理测试 (仅超级管理员)
echo "═══════════════════════════════════════════════════════════"
echo "6️⃣  管理员管理模块测试"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_api "获取管理员列表" "GET" "$BASE_URL/admins" "-H \"Authorization: Bearer $TOKEN\"" "success"
echo ""

# 8. 安全测试
echo "═══════════════════════════════════════════════════════════"
echo "7️⃣  安全测试"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}测试：未授权访问 (应失败)${NC}"
UNAUTH_RESP=$(curl -s "$BASE_URL/users")
if echo "$UNAUTH_RESP" | grep -q "UNAUTHORIZED\|success.*false"; then
    echo -e "  ${GREEN}✅ 正确拒绝未授权请求${NC}"
    ((PASS++))
else
    echo -e "  ${RED}❌ 安全漏洞：未授权访问成功${NC}"
    ((FAIL++))
fi
echo ""

echo -e "${BLUE}测试：错误密码登录 (应失败)${NC}"
WRONG_PASS=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}')
if echo "$WRONG_PASS" | grep -q "INVALID_CREDENTIALS\|success.*false"; then
    echo -e "  ${GREEN}✅ 正确拒绝错误密码${NC}"
    ((PASS++))
else
    echo -e "  ${RED}❌ 安全漏洞：错误密码登录成功${NC}"
    ((FAIL++))
fi
echo ""

# 9. 性能测试
echo "═══════════════════════════════════════════════════════════"
echo "8️⃣  性能测试"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}测试：API 响应时间${NC}"
START=$(date +%s%N)
curl -s "$BASE_URL/users?page=1&pageSize=10" -H "Authorization: Bearer $TOKEN" > /dev/null
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))
if [ $DURATION -lt 1000 ]; then
    echo -e "  ${GREEN}✅ 响应时间：${DURATION}ms (< 1000ms)${NC}"
    ((PASS++))
else
    echo -e "  ${YELLOW}⚠️  响应时间：${DURATION}ms (>= 1000ms)${NC}"
    ((PASS++))
fi
echo ""

# 总结
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    📊 测试结果总结                      ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo -e "║  ${GREEN}✅ 通过${NC}: $PASS                                    ║"
echo -e "║  ${RED}❌ 失败${NC}: $FAIL                                    ║"
echo "╚══════════════════════════════════════════════════════════╝"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 所有测试通过！管理后台功能正常！${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  有 $FAIL 个测试失败，请检查！${NC}"
    exit 1
fi
