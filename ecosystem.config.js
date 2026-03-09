/**
 * PM2 Ecosystem Configuration
 * 萨摩耶情侣聊天应用 - 生产环境进程配置
 * 
 * 用法:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --only chat-backend
 *   pm2 restart ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'samoyed-chat-backend',
      script: './server/src/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/chat-backend-error.log',
      out_file: './logs/chat-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
    {
      name: 'samoyed-admin-backend',
      script: './admin-backend/src/index.js',
      cwd: './admin-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_PATH: '/root/.openclaw/workspace/samoyed-chat/server/data/chat.db',
      },
      error_file: '../logs/admin-backend-error.log',
      out_file: '../logs/admin-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
};
