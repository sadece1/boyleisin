/**
 * PM2 Ecosystem Configuration
 * Production deployment için PM2 yapılandırması
 * 
 * Kullanım:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'campscape-backend',
      script: './dist/server.js',
      instances: 2, // CPU core sayısına göre ayarlayın
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};












