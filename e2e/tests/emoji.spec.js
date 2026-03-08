// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('表情包功能 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 前置条件：登录并进入聊天室
    await page.goto('/login');
    await page.getByPlaceholder('用户名').fill('test_user');
    await page.getByPlaceholder('密码').fill('123456');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('**/chat');
  });

  test('打开表情包面板', async ({ page }) => {
    // 点击表情按钮
    await page.getByText('😊').click();
    
    // 验证表情包面板显示
    await expect(page.locator('.emoji-picker')).toBeVisible();
  });

  test('表情包分类显示', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 验证分类标签
    const categories = ['全部', '基础', '日常', '情感', '搞笑', '节日', '情侣'];
    
    for (const category of categories) {
      await expect(page.getByText(category)).toBeVisible();
    }
  });

  test('切换表情包分类', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 点击"基础"分类
    await page.getByText('基础').click();
    
    // 验证分类激活状态
    const activeButton = page.locator('.category-btn.active');
    await expect(activeButton).toContainText('基础');
    
    // 点击"情感"分类
    await page.getByText('情感').click();
    
    // 验证分类切换
    await expect(page.locator('.category-btn.active')).toContainText('情感');
  });

  test('搜索表情包', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 输入搜索关键词
    const searchInput = page.getByPlaceholder('搜索表情包...');
    await searchInput.fill('开心');
    
    // 等待搜索结果
    await page.waitForTimeout(500);
    
    // 验证搜索结果
    const emojiItems = page.locator('.emoji-item');
    const count = await emojiItems.count();
    
    // 应该有结果或显示空状态
    if (count === 0) {
      await expect(page.getByText('没有找到相关表情包')).toBeVisible();
    } else {
      // 验证结果包含"开心"
      const firstEmoji = emojiItems.first();
      const emojiName = await firstEmoji.locator('.emoji-name').textContent();
      expect(emojiName).toContain('开心');
    }
  });

  test('发送表情包', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 等待面板完全打开
    await page.waitForTimeout(300);
    
    // 点击第一个表情包
    const firstEmoji = page.locator('.emoji-item').first();
    await firstEmoji.click();
    
    // 等待表情包发送
    await page.waitForTimeout(1000);
    
    // 验证表情包已发送
    const emojiMessage = page.locator('.emoji-message');
    await expect(emojiMessage).toBeVisible();
  });

  test('关闭表情包面板', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 点击关闭按钮
    await page.locator('.close-btn').click();
    
    // 验证面板关闭
    await page.waitForTimeout(300);
    await expect(page.locator('.emoji-picker')).not.toBeVisible();
  });

  test('表情包面板外部点击关闭', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 点击面板外部
    await page.locator('.message-input-container').click({ position: { x: 100, y: 10 } });
    
    // 验证面板关闭
    await page.waitForTimeout(300);
    await expect(page.locator('.emoji-picker')).not.toBeVisible();
  });

  test('表情包加载', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 验证表情包图片加载
    const emojiImages = page.locator('.emoji-item img');
    const count = await emojiImages.count();
    
    expect(count).toBeGreaterThan(0);
    
    // 验证图片有 src 属性
    const firstImage = emojiImages.first();
    await expect(firstImage).toHaveAttribute('src');
  });

  test('表情包悬停效果', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 悬停在第一个表情包上
    const firstEmoji = page.locator('.emoji-item').first();
    await firstEmoji.hover();
    
    // 验证悬停效果（transform）
    const style = await firstEmoji.evaluate(el => 
      window.getComputedStyle(el).getPropertyValue('transform')
    );
    
    // 应该有放大效果
    expect(style).not.toBe('none');
  });

  test('表情包数量统计', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 验证数量统计显示
    const countElement = page.locator('.emoji-count');
    await expect(countElement).toBeVisible();
    
    // 验证数量格式
    const countText = await countElement.textContent();
    expect(countText).toMatch(/共 \\d+ 个表情包/);
  });

  test('表情包网格布局', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 验证网格布局
    const emojiGrid = page.locator('.emoji-grid');
    await expect(emojiGrid).toBeVisible();
    
    // 验证网格项
    const items = page.locator('.emoji-item');
    const count = await items.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('移动端表情包面板', async ({ page }) => {
    // 切换到移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 验证移动端显示
    await expect(page.locator('.emoji-picker')).toBeVisible();
    
    // 验证分类可滚动
    const categories = page.locator('.emoji-categories');
    await expect(categories).toBeVisible();
  });

  test('表情包空搜索', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 输入不存在的关键词
    const searchInput = page.getByPlaceholder('搜索表情包...');
    await searchInput.fill('不存在的表情 xyz123');
    
    // 等待搜索结果
    await page.waitForTimeout(500);
    
    // 验证空状态
    await expect(page.getByText('没有找到相关表情包')).toBeVisible();
  });

  test('表情包分类过滤', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 点击"基础"分类
    await page.getByText('基础').click();
    
    // 等待过滤完成
    await page.waitForTimeout(300);
    
    // 验证显示的表情包数量
    const emojiItems = page.locator('.emoji-item');
    const count = await emojiItems.count();
    
    // 基础表情应该有 6 个
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10);
  });

  test('表情包面板动画', async ({ page }) => {
    // 录制动画
    const video = await page.startScreencast();
    
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 等待动画完成
    await page.waitForTimeout(500);
    
    await video.stop();
    
    // 验证面板可见
    await expect(page.locator('.emoji-picker')).toBeVisible();
  });

  test('表情包发送后自动关闭', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 点击第一个表情包
    await page.locator('.emoji-item').first().click();
    
    // 等待发送完成
    await page.waitForTimeout(1000);
    
    // 验证面板已关闭
    await expect(page.locator('.emoji-picker')).not.toBeVisible();
  });

  test('表情包重复发送', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 发送第一个表情包
    await page.locator('.emoji-item').first().click();
    await page.waitForTimeout(1000);
    
    // 再次打开表情包面板
    await page.getByText('😊').click();
    await page.waitForTimeout(300);
    
    // 再次发送同一个表情包
    await page.locator('.emoji-item').first().click();
    await page.waitForTimeout(1000);
    
    // 验证有两个表情包消息
    const emojiMessages = page.locator('.emoji-message');
    const count = await emojiMessages.count();
    
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('表情包图片懒加载', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 验证图片有 loading 属性
    const images = page.locator('.emoji-item img');
    const firstImage = images.first();
    
    await expect(firstImage).toHaveAttribute('loading', 'lazy');
  });

  test('表情包搜索性能', async ({ page }) => {
    // 打开表情包面板
    await page.getByText('😊').click();
    
    // 记录搜索时间
    const startTime = Date.now();
    
    // 输入搜索
    const searchInput = page.getByPlaceholder('搜索表情包...');
    await searchInput.fill('爱');
    
    // 等待搜索结果
    await page.waitForTimeout(500);
    
    const searchTime = Date.now() - startTime;
    console.log('搜索响应时间:', searchTime, 'ms');
    
    // 验证搜索时间 < 1 秒
    expect(searchTime).toBeLessThan(1000);
  });
});
