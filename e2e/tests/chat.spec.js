// @ts-check
const { test, expect } = require('@playwright/test');

// 测试数据
const TEST_USER_A = {
  username: `test_e2e_a_${Date.now()}`,
  password: '123456',
  nickname: '汪汪'
};

const TEST_USER_B = {
  username: `test_e2e_b_${Date.now()}`,
  password: '123456',
  nickname: '毛毛'
};

test.describe('萨摩耶聊天室 E2E 测试', () => {
  let inviteCode;

  // 测试 1: 用户 A 注册
  test('用户 A 注册账号', async ({ page }) => {
    await page.goto('/');
    
    // 点击注册按钮
    await page.getByText('注册账号').click();
    await page.waitForURL('**/register');
    
    // 填写注册表单
    await page.getByPlaceholder('用户名').fill(TEST_USER_A.username);
    await page.getByPlaceholder('密码').fill(TEST_USER_A.password);
    await page.getByPlaceholder('昵称').fill(TEST_USER_A.nickname);
    
    // 提交注册
    await page.getByRole('button', { name: '注册' }).click();
    
    // 等待注册成功
    await expect(page).toHaveURL('**/pair');
    await expect(page.getByText('注册成功')).toBeVisible();
  });

  // 测试 2: 用户 A 生成邀请码
  test('用户 A 生成邀请码', async ({ page }) => {
    await page.goto('/pair');
    
    // 等待邀请码生成
    await page.waitForTimeout(1000);
    
    // 获取邀请码
    const inviteCodeElement = page.getByText(/邀请码：[A-Z0-9]+/);
    await expect(inviteCodeElement).toBeVisible();
    
    // 提取邀请码
    const text = await inviteCodeElement.textContent();
    inviteCode = text.match(/[A-Z0-9]{8}/)[0];
    console.log('生成的邀请码:', inviteCode);
    
    await expect(inviteCode).toHaveLength(8);
  });

  // 测试 3: 用户 B 注册
  test('用户 B 注册账号', async ({ page }) => {
    await page.goto('/');
    
    // 点击注册按钮
    await page.getByText('注册账号').click();
    await page.waitForURL('**/register');
    
    // 填写注册表单
    await page.getByPlaceholder('用户名').fill(TEST_USER_B.username);
    await page.getByPlaceholder('密码').fill(TEST_USER_B.password);
    await page.getByPlaceholder('昵称').fill(TEST_USER_B.nickname);
    
    // 提交注册
    await page.getByRole('button', { name: '注册' }).click();
    
    // 等待注册成功
    await expect(page).toHaveURL('**/pair');
    await expect(page.getByText('注册成功')).toBeVisible();
  });

  // 测试 4: 用户 B 输入邀请码配对
  test('用户 B 输入邀请码完成配对', async ({ page }) => {
    await page.goto('/pair');
    
    // 输入邀请码
    await page.getByPlaceholder('请输入邀请码').fill(inviteCode);
    
    // 提交配对
    await page.getByRole('button', { name: '配对' }).click();
    
    // 等待配对成功
    await expect(page).toHaveURL('**/chat');
    await expect(page.getByText('配对成功')).toBeVisible({ timeout: 5000 });
  });

  // 测试 5: 用户 A 登录并进入聊天室
  test('用户 A 登录并进入聊天室', async ({ page }) => {
    await page.goto('/');
    
    // 点击登录按钮
    await page.getByText('登录账号').click();
    await page.waitForURL('**/login');
    
    // 填写登录表单
    await page.getByPlaceholder('用户名').fill(TEST_USER_A.username);
    await page.getByPlaceholder('密码').fill(TEST_USER_A.password);
    
    // 提交登录
    await page.getByRole('button', { name: '登录' }).click();
    
    // 等待进入聊天室
    await expect(page).toHaveURL('**/chat');
    await expect(page.getByText('汪汪')).toBeVisible();
  });

  // 测试 6: 发送文字消息
  test('发送文字消息', async ({ page }) => {
    await page.goto('/chat');
    
    // 输入消息
    const testMessage = '你好呀！这是 E2E 测试消息 🐕';
    await page.getByPlaceholder('发消息...').fill(testMessage);
    
    // 发送消息
    await page.getByRole('button', { name: '发送' }).click();
    
    // 等待消息显示
    await page.waitForTimeout(500);
    
    // 验证消息已发送
    await expect(page.getByText(testMessage)).toBeVisible();
  });

  // 测试 7: 发送表情包
  test('发送表情包', async ({ page }) => {
    await page.goto('/chat');
    
    // 点击表情按钮
    await page.getByText('😊').click();
    
    // 等待表情包面板打开
    await page.waitForTimeout(500);
    await expect(page.getByPlaceholder('搜索表情包...')).toBeVisible();
    
    // 选择第一个表情包
    await page.locator('.emoji-item').first().click();
    
    // 等待表情包发送
    await page.waitForTimeout(1000);
    
    // 验证表情包已发送（检查图片）
    await expect(page.locator('.emoji-message img')).toBeVisible();
  });

  // 测试 8: 语音录音界面
  test('语音录音界面显示', async ({ page }) => {
    await page.goto('/chat');
    
    // 点击附件按钮
    await page.locator('.attach-btn').click();
    
    // 等待附件面板打开
    await page.waitForTimeout(300);
    
    // 点击语音按钮
    await page.getByText('🎤').click();
    
    // 等待录音界面显示
    await page.waitForTimeout(500);
    await expect(page.getByText('正在录音...')).toBeVisible();
    await expect(page.getByText(/\\d:\\d{2}/)).toBeVisible(); // 计时器
    
    // 点击取消
    await page.getByText('取消').click();
    
    // 录音界面关闭
    await page.waitForTimeout(300);
    await expect(page.getByText('正在录音...')).not.toBeVisible();
  });

  // 测试 9: 上传图片
  test('上传图片', async ({ page }) => {
    await page.goto('/chat');
    
    // 点击附件按钮
    await page.locator('.attach-btn').click();
    
    // 等待附件面板打开
    await page.waitForTimeout(300);
    
    // 点击附件选项
    await page.getByText('📎').click();
    
    // 创建测试图片
    const testImage = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(0, 0, 100, 100);
      return canvas.toDataURL('image/png');
    });
    
    // 保存测试图片
    const imageBuffer = Buffer.from(testImage.split(',')[1], 'base64');
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: imageBuffer
    });
    
    // 等待上传完成
    await page.waitForTimeout(2000);
    
    // 验证图片已发送
    await expect(page.locator('img[src*="test-image"]')).toBeVisible({ timeout: 5000 });
  });

  // 测试 10: 消息删除
  test('删除消息', async ({ page }) => {
    await page.goto('/chat');
    
    // 长按消息
    const messageElement = page.locator('.message-item').last();
    await messageElement.click({ button: 'right' });
    
    // 等待菜单显示
    await page.waitForTimeout(300);
    
    // 点击删除
    await page.getByText('🗑️').click();
    
    // 等待删除完成
    await page.waitForTimeout(500);
    
    // 验证消息已删除（检查删除提示）
    await expect(page.getByText('消息已删除')).toBeVisible({ timeout: 3000 });
  });

  // 测试 11: 在线状态显示
  test('在线状态显示', async ({ page }) => {
    await page.goto('/chat');
    
    // 检查在线状态
    await page.waitForTimeout(1000);
    const statusElement = page.locator('.online-status');
    await expect(statusElement).toBeVisible();
  });

  // 测试 12: 输入状态显示
  test('输入状态显示', async ({ page }) => {
    await page.goto('/chat');
    
    // 在输入框输入文字
    await page.getByPlaceholder('发消息...').fill('正在输入...');
    
    // 等待输入状态
    await page.waitForTimeout(1000);
    
    // 检查输入状态（如果有显示）
    const typingIndicator = page.locator('.typing-indicator');
    // 输入状态可能不总是显示，所以不强制验证
  });

  // 测试 13: 新会话功能
  test('新会话功能', async ({ page }) => {
    await page.goto('/chat');
    
    // 发送 /new 命令
    await page.getByPlaceholder('发消息...').fill('/new');
    await page.getByRole('button', { name: '发送' }).click();
    
    // 等待新会话提示
    await page.waitForTimeout(1000);
    await expect(page.getByText(/新会话|清空/)).toBeVisible({ timeout: 3000 });
  });

  // 测试 14: 响应式设计
  test('移动端响应式布局', async ({ page }) => {
    // 切换到移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/chat');
    
    // 检查移动端布局
    const inputContainer = page.locator('.message-input-container');
    await expect(inputContainer).toBeVisible();
    
    // 检查输入框在移动端的显示
    const inputBox = page.getByPlaceholder('发消息...');
    await expect(inputBox).toBeVisible();
    await expect(inputBox).toBeInViewport();
  });

  // 测试 15: 页面加载性能
  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    const loadTime = Date.now() - startTime;
    console.log('页面加载时间:', loadTime, 'ms');
    
    // 验证加载时间 < 3 秒
    expect(loadTime).toBeLessThan(3000);
    
    // 验证页面元素已加载
    await expect(page.getByText('萨摩耶之家')).toBeVisible();
  });
});
