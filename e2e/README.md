# 🧪 萨摩耶聊天室 E2E 测试

> 基于 Playwright 的端到端测试套件

---

## 📦 安装

```bash
cd e2e
npm install
npx playwright install
```

---

## 🚀 运行测试

### 基础命令

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npx playwright test tests/chat.spec.js
npx playwright test tests/voice.spec.js
npx playwright test tests/emoji.spec.js

# 运行特定测试用例
npx playwright test --grep "发送文字消息"
```

### 调试模式

```bash
# 有头模式（显示浏览器）
npm run test:headed

# 调试模式（逐步执行）
npm run test:debug

# UI 模式（可视化测试运行器）
npm run test:ui
```

### 查看报告

```bash
# 生成 HTML 报告
npm test

# 打开报告
npm run report
```

---

## 📋 测试用例

### 聊天功能 (chat.spec.js)

| 测试 | 说明 | 状态 |
|------|------|------|
| 用户注册 | 测试用户注册流程 | ✅ |
| 生成邀请码 | 测试邀请码生成 | ✅ |
| 配对 | 测试情侣配对 | ✅ |
| 登录 | 测试用户登录 | ✅ |
| 发送文字消息 | 测试文字消息发送 | ✅ |
| 发送表情包 | 测试表情包发送 | ✅ |
| 语音录音界面 | 测试录音界面显示 | ✅ |
| 上传图片 | 测试图片上传 | ✅ |
| 删除消息 | 测试消息删除 | ✅ |
| 在线状态 | 测试在线状态显示 | ✅ |
| 输入状态 | 测试输入状态显示 | ✅ |
| 新会话 | 测试新会话功能 | ✅ |
| 响应式设计 | 测试移动端布局 | ✅ |
| 页面加载性能 | 测试页面加载速度 | ✅ |

### 语音功能 (voice.spec.js)

| 测试 | 说明 | 状态 |
|------|------|------|
| 录音界面打开 | 测试录音界面显示 | ✅ |
| 录音计时器 | 测试计时器功能 | ✅ |
| 取消录音 - 按钮 | 测试按钮取消 | ✅ |
| 完成录音 | 测试完成录音 | ✅ |
| 重录功能 | 测试重录功能 | ✅ |
| 上滑取消提示 | 测试上滑取消 | ✅ |
| 录音界面样式 | 测试界面元素 | ✅ |
| 脉冲动画 | 测试动画效果 | ✅ |
| 录音权限拒绝 | 测试权限处理 | ✅ |
| 移动端录音 | 测试移动端适配 | ✅ |
| 外部点击关闭 | 测试关闭功能 | ✅ |
| 录音界面动画 | 测试动画效果 | ✅ |
| 短录音提示 | 测试短录音确认 | ✅ |
| 资源清理 | 测试资源释放 | ✅ |

### 表情包 (emoji.spec.js)

| 测试 | 说明 | 状态 |
|------|------|------|
| 打开表情包面板 | 测试面板打开 | ✅ |
| 分类显示 | 测试分类标签 | ✅ |
| 切换分类 | 测试分类切换 | ✅ |
| 搜索表情包 | 测试搜索功能 | ✅ |
| 发送表情包 | 测试发送功能 | ✅ |
| 关闭面板 | 测试关闭功能 | ✅ |
| 外部点击关闭 | 测试外部关闭 | ✅ |
| 表情包加载 | 测试图片加载 | ✅ |
| 悬停效果 | 测试悬停动画 | ✅ |
| 数量统计 | 测试统计显示 | ✅ |
| 网格布局 | 测试布局显示 | ✅ |
| 移动端面板 | 测试移动端适配 | ✅ |
| 空搜索 | 测试空结果 | ✅ |
| 分类过滤 | 测试过滤功能 | ✅ |
| 面板动画 | 测试动画效果 | ✅ |
| 发送后关闭 | 测试自动关闭 | ✅ |
| 重复发送 | 测试重复发送 | ✅ |
| 懒加载 | 测试懒加载 | ✅ |
| 搜索性能 | 测试搜索速度 | ✅ |

---

## 🎯 测试配置

### playwright.config.js

```javascript
{
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  reporter: ['html', 'list', 'json'],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
}
```

---

## 📊 测试报告

### HTML 报告

运行测试后生成：

```bash
npm run report
```

打开浏览器查看：
- 测试结果总览
- 每个测试的详细信息
- 失败截图
- 执行视频
- 性能追踪

### JSON 报告

生成 `test-results.json` 文件，包含：
- 测试结果
- 执行时间
- 错误信息
- 元数据

---

## 🔧 调试技巧

### 1. 使用调试模式

```bash
npx playwright test --debug
```

### 2. 添加日志

```javascript
test('测试用例', async ({ page }) => {
  console.log('步骤 1: 打开页面');
  await page.goto('/');
  
  console.log('步骤 2: 点击按钮');
  await page.click('button');
});
```

### 3. 截图

```javascript
await page.screenshot({ path: 'debug.png' });
```

### 4. 暂停执行

```javascript
await page.pause();
```

---

## 📁 文件结构

```
e2e/
├── package.json           # 依赖配置
├── playwright.config.js   # Playwright 配置
├── README.md             # 本文档
├── tests/
│   ├── chat.spec.js      # 聊天功能测试
│   ├── voice.spec.js     # 语音功能测试
│   └── emoji.spec.js     # 表情包测试
├── playwright-report/    # HTML 报告（生成）
└── test-results.json     # JSON 报告（生成）
```

---

## 🎯 最佳实践

### 1. 测试数据隔离

```javascript
const TEST_USER = {
  username: `test_${Date.now()}`,
  password: '123456'
};
```

### 2. 使用 Page Object 模式

```javascript
class ChatPage {
  constructor(page) {
    this.page = page;
    this.messageInput = page.getByPlaceholder('发消息...');
    this.sendButton = page.getByRole('button', { name: '发送' });
  }
  
  async sendMessage(text) {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }
}
```

### 3. 等待元素

```javascript
// ✅ 好
await expect(element).toBeVisible();

// ❌ 不好
await page.waitForTimeout(5000);
```

### 4. 有意义的测试名称

```javascript
// ✅ 好
test('用户 A 生成邀请码');

// ❌ 不好
test('测试 1');
```

---

## 🚨 常见问题

### Q: 测试失败率不稳定？
**A**: 增加超时时间，使用更稳定的选择器。

### Q: 移动端测试失败？
**A**: 确保视口大小设置正确。

### Q: 测试运行慢？
**A**: 减少不必要的等待，使用并行测试。

### Q: 如何测试登录状态？
**A**: 使用 `beforeEach` 前置条件。

---

## 📈 CI/CD 集成

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install
      - run: npm test
        working-directory: ./e2e
```

---

## 🎁 扩展建议

### 新增测试
- [ ] 视频功能测试
- [ ] 文件上传测试
- [ ] 通知功能测试
- [ ] 性能基准测试
- [ ] 无障碍测试

### 改进
- [ ] Page Object 模式
- [ ] 测试数据管理
- [ ] 视觉回归测试
- [ ] 性能监控
- [ ] 错误追踪

---

**E2E 测试已就绪！🧪**

*保证功能质量，从测试开始*
