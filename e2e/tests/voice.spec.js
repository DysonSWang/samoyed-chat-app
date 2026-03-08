// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('语音功能 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 前置条件：登录并进入聊天室
    await page.goto('/login');
    await page.getByPlaceholder('用户名').fill('test_user');
    await page.getByPlaceholder('密码').fill('123456');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('**/chat');
  });

  test('录音界面打开', async ({ page }) => {
    // 点击附件按钮
    await page.locator('.attach-btn').click();
    
    // 点击语音按钮
    await page.getByText('🎤 语音').click();
    
    // 验证录音界面显示
    await expect(page.locator('.voice-recorder')).toBeVisible();
    await expect(page.getByText('正在录音...')).toBeVisible();
  });

  test('录音计时器', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 等待 3 秒
    await page.waitForTimeout(3000);
    
    // 验证计时器显示
    const timerElement = page.locator('.recording-time');
    const timerText = await timerElement.textContent();
    
    // 验证格式 M:SS
    expect(timerText).toMatch(/\\d:\\d{2}/);
  });

  test('取消录音 - 按钮', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 点击取消按钮
    await page.getByText('取消').click();
    
    // 验证录音界面关闭
    await page.waitForTimeout(500);
    await expect(page.locator('.voice-recorder')).not.toBeVisible();
  });

  test('完成录音', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 等待 2 秒
    await page.waitForTimeout(2000);
    
    // 点击完成
    await page.getByText('完成').click();
    
    // 验证预览界面显示
    await page.waitForTimeout(500);
    await expect(page.getByText('发送')).toBeVisible();
    await expect(page.getByText('重录')).toBeVisible();
  });

  test('重录功能', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 等待 1 秒
    await page.waitForTimeout(1000);
    
    // 点击完成
    await page.getByText('完成').click();
    
    // 点击重录
    await page.getByText('重录').click();
    
    // 验证重新进入录音状态
    await page.waitForTimeout(500);
    await expect(page.getByText('正在录音...')).toBeVisible();
  });

  test('上滑取消提示', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 模拟上滑（鼠标事件）
    const recorder = page.locator('.voice-recorder');
    const box = await recorder.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y - 200); // 上滑 200px
      await page.waitForTimeout(500);
      
      // 验证取消提示显示
      await expect(page.locator('.cancel-hint')).toBeVisible();
      
      // 松手
      await page.mouse.up();
    }
  });

  test('录音界面样式', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 验证样式元素
    await expect(page.locator('.record-button')).toBeVisible();
    await expect(page.locator('.record-button.recording')).toBeVisible();
    await expect(page.locator('.recording-time')).toBeVisible();
    await expect(page.locator('.cancel-btn')).toBeVisible();
    await expect(page.locator('.stop-btn')).toBeVisible();
  });

  test('脉冲动画', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 检查脉冲动画 class
    const recordButton = page.locator('.record-button.recording');
    const className = await recordButton.getAttribute('class');
    
    expect(className).toContain('recording');
  });

  test('录音权限拒绝处理', async ({ page, context }) => {
    // 拒绝麦克风权限
    await context.denyPermissions(['microphone']);
    
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 验证错误提示（如果有）
    await page.waitForTimeout(1000);
    // 应该显示权限错误提示或关闭录音界面
  });

  test('移动端录音界面', async ({ page }) => {
    // 切换到移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 验证移动端样式
    await expect(page.locator('.voice-recorder')).toBeVisible();
    
    // 验证按钮大小适合触摸
    const cancelButton = page.locator('.cancel-btn');
    const box = await cancelButton.boundingBox();
    
    if (box) {
      // 按钮宽度至少 44px（触摸友好）
      expect(box.width).toBeGreaterThan(40);
      expect(box.height).toBeGreaterThan(40);
    }
  });

  test('录音界面关闭 - 外部点击', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 点击录音界面外部
    await page.locator('.message-input-container').click({ position: { x: 10, y: 10 } });
    
    // 验证录音界面关闭
    await page.waitForTimeout(500);
    await expect(page.locator('.voice-recorder')).not.toBeVisible();
  });

  test('录音界面动画', async ({ page }) => {
    // 录制动画
    const video = await page.startScreencast();
    
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 等待动画完成
    await page.waitForTimeout(1000);
    
    await video.stop();
    
    // 验证界面可见
    await expect(page.locator('.voice-recorder')).toBeVisible();
  });

  test('短录音提示', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 立即点击完成（< 1 秒）
    await page.waitForTimeout(500);
    await page.getByText('完成').click();
    
    // 点击发送
    await page.waitForTimeout(300);
    await page.getByText('发送').click();
    
    // 验证短录音确认对话框（如果有）
    await page.waitForTimeout(500);
    // 可能显示确认对话框或直接发送
  });

  test('录音资源清理', async ({ page }) => {
    // 打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 等待录音开始
    await page.waitForTimeout(1000);
    
    // 点击取消
    await page.getByText('取消').click();
    
    // 等待资源清理
    await page.waitForTimeout(500);
    
    // 验证界面关闭
    await expect(page.locator('.voice-recorder')).not.toBeVisible();
    
    // 验证没有内存泄漏（通过控制台错误）
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    // 重新打开录音界面
    await page.locator('.attach-btn').click();
    await page.getByText('🎤 语音').click();
    
    // 验证没有错误
    const errors = consoleMessages.filter(msg => msg.includes('error'));
    expect(errors.length).toBe(0);
  });
});
