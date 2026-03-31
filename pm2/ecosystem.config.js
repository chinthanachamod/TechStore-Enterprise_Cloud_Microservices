// TechStore — PM2 Process Manager Configuration
// ══════════════════════════════════════════════
// How to run in GCP VM? :
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup 

module.exports = {
  apps: [

    // ── PLATFORM LAYER VM ──────────────────────────────────────────
    {
      name: 'config-server',
      script: 'java',
      args: '-Xms256m -Xmx512m -jar /opt/techstore/config-server-1.0.0.jar',
      interpreter: 'none',
      cwd: '/opt/techstore',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      error_file: '/var/log/pm2/config-server-error.log',
      out_file:   '/var/log/pm2/config-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
        JAVA_HOME: '/usr/lib/jvm/java-25-openjdk-amd64'
      }
    },

    {
      name: 'eureka-server',
      script: 'java',
      args: '-Xms256m -Xmx512m -jar /opt/techstore/eureka-server-1.0.0.jar',
      interpreter: 'none',
      cwd: '/opt/techstore',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      error_file: '/var/log/pm2/eureka-server-error.log',
      out_file:   '/var/log/pm2/eureka-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },

    {
      name: 'api-gateway',
      script: 'java',
      args: '-Xms256m -Xmx512m -jar /opt/techstore/api-gateway-1.0.0.jar',
      interpreter: 'none',
      cwd: '/opt/techstore',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      error_file: '/var/log/pm2/api-gateway-error.log',
      out_file:   '/var/log/pm2/api-gateway-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },

    // ── MICROSERVICE VMs (each in own instance group) ──────────────
    {
      name: 'user-service',
      script: 'java',
      args: '-Xms256m -Xmx512m -jar /opt/techstore/user-service-1.0.0.jar',
      interpreter: 'none',
      cwd: '/opt/techstore',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      error_file: '/var/log/pm2/user-service-error.log',
      out_file:   '/var/log/pm2/user-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },

    {
      name: 'product-service',
      script: 'java',
      args: '-Xms256m -Xmx512m -jar /opt/techstore/product-service-1.0.0.jar',
      interpreter: 'none',
      cwd: '/opt/techstore',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      error_file: '/var/log/pm2/product-service-error.log',
      out_file:   '/var/log/pm2/product-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },

    {
      name: 'media-service',
      script: 'java',
      args: '-Xms256m -Xmx512m -jar /opt/techstore/media-service-1.0.0.jar',
      interpreter: 'none',
      cwd: '/opt/techstore',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      error_file: '/var/log/pm2/media-service-error.log',
      out_file:   '/var/log/pm2/media-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
