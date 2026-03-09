#!/usr/bin/env node

/**
 * 管理后台数据库初始化脚本
 * 创建管理员表和日志表，并创建默认管理员账号
 */

const path = require('path');
const bcrypt = require('bcryptjs');
const { getDatabase, initAdminTables } = require('../src/models/database');
const AdminModel = require('../src/models/admin');

console.log('🐕 开始初始化萨摩耶管理后台数据库...\n');

try {
  // 初始化表结构
  initAdminTables();
  
  // 检查是否已有管理员
  const existingAdmin = AdminModel.findByUsername('admin');
  
  if (existingAdmin) {
    console.log('ℹ️  管理员账号已存在，跳过创建\n');
  } else {
    // 创建默认管理员
    const admin = AdminModel.create({
      username: 'admin',
      password: 'admin123',
      nickname: '超级管理员',
      role: 'super'
    });
    
    console.log('✅ 默认管理员创建成功\n');
    console.log('   用户名：admin');
    console.log('   密码：admin123');
    console.log('   角色：super\n');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ 数据库初始化完成!');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('下一步:');
  console.log('  1. 启动服务：npm run dev');
  console.log('  2. 访问健康检查：http://localhost:3001/health');
  console.log('  3. 使用默认账号登录管理后台\n');
  
} catch (error) {
  console.error('❌ 初始化失败:', error);
  process.exit(1);
}
