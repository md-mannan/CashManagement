# 🚀 Production Deployment Guide

## Cash Management System - Production Setup

This guide provides step-by-step instructions for deploying the Cash Management System to a production environment.

---

## 📋 Prerequisites

### Server Requirements
- **PHP**: 8.2 or higher
- **MySQL**: 8.0 or higher
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Node.js**: 18+ (for building assets)
- **Composer**: 2.0+
- **Redis**: 6.0+ (recommended for caching and sessions)
- **SSL Certificate**: Required for HTTPS

### Recommended Server Specifications
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum, SSD recommended
- **Bandwidth**: Unlimited or high allowance

---

## 🛠️ Deployment Steps

### 1. Server Preparation

#### Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Required Software
```bash
# Install PHP and extensions
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-redis php8.2-xml php8.2-curl php8.2-zip php8.2-mbstring php8.2-gd php8.2-intl php8.2-bcmath

# Install MySQL
sudo apt install mysql-server-8.0

# Install Redis
sudo apt install redis-server

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Database Setup

#### Create Database and User
```sql
mysql -u root -p

CREATE DATABASE cashmanagement_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cashmanagement'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON cashmanagement_production.* TO 'cashmanagement'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Deployment

#### Clone Repository
```bash
cd /var/www/html
sudo git clone https://github.com/yourusername/cashmanagement.git
sudo chown -R www-data:www-data cashmanagement
cd cashmanagement
```

#### Install Dependencies
```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies and build assets
npm ci
npm run build
```

#### Environment Configuration
```bash
# Copy production environment file
cp env-production.example .env

# Generate application key
php artisan key:generate

# Edit environment variables
nano .env
```

#### Configure Environment Variables
Update the `.env` file with your production values:

```env
APP_NAME="Cash Management System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_DATABASE=cashmanagement_production
DB_USERNAME=cashmanagement
DB_PASSWORD=your_secure_password

# Add your other production values...
```

#### Database Migration and Seeding
```bash
# Run migrations
php artisan migrate --force

# Seed initial data (admin user, etc.)
php artisan db:seed --class=SuperAdminSeeder --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. Web Server Configuration

#### Apache Configuration
```bash
# Copy production .htaccess
cp public/.htaccess.production public/.htaccess

# Create virtual host
sudo nano /etc/apache2/sites-available/cashmanagement.conf
```

**Virtual Host Configuration:**
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/html/cashmanagement/public
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/html/cashmanagement/public
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    SSLCertificateChainFile /path/to/your/chain.crt
    
    # Directory Configuration
    <Directory /var/www/html/cashmanagement/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/cashmanagement_error.log
    CustomLog ${APACHE_LOG_DIR}/cashmanagement_access.log combined
</VirtualHost>
```

#### Enable Site and Modules
```bash
sudo a2enmod rewrite ssl headers expires deflate
sudo a2ensite cashmanagement
sudo a2dissite 000-default
sudo systemctl reload apache2
```

### 5. File Permissions
```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/html/cashmanagement

# Set correct permissions
sudo find /var/www/html/cashmanagement -type f -exec chmod 644 {} \;
sudo find /var/www/html/cashmanagement -type d -exec chmod 755 {} \;

# Storage and cache directories
sudo chmod -R 775 /var/www/html/cashmanagement/storage
sudo chmod -R 775 /var/www/html/cashmanagement/bootstrap/cache
```

### 6. SSL Certificate Setup

#### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Obtain SSL certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Redis Configuration
```bash
# Configure Redis for production
sudo nano /etc/redis/redis.conf

# Key settings:
# maxmemory 256mb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000

# Restart Redis
sudo systemctl restart redis-server
```

### 8. Queue Worker Setup
```bash
# Create supervisor configuration
sudo nano /etc/supervisor/conf.d/cashmanagement-worker.conf
```

**Supervisor Configuration:**
```ini
[program:cashmanagement-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/cashmanagement/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/html/cashmanagement/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
# Update supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start cashmanagement-worker:*
```

### 9. Cron Jobs Setup
```bash
# Add Laravel scheduler
sudo crontab -e -u www-data

# Add this line:
* * * * * cd /var/www/html/cashmanagement && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🔒 Security Checklist

### Application Security
- [ ] Set `APP_DEBUG=false`
- [ ] Generate new `APP_KEY`
- [ ] Use strong database passwords
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure proper file permissions
- [ ] Disable unnecessary PHP functions
- [ ] Enable security headers in .htaccess

### Server Security
- [ ] Keep system packages updated
- [ ] Configure firewall (UFW/iptables)
- [ ] Disable root SSH login
- [ ] Use SSH keys instead of passwords
- [ ] Configure fail2ban
- [ ] Regular security audits

### Database Security
- [ ] Use strong passwords
- [ ] Limit database user privileges
- [ ] Enable MySQL slow query log
- [ ] Regular database backups
- [ ] Monitor for suspicious activity

---

## 📊 Monitoring and Maintenance

### Log Monitoring
```bash
# Application logs
tail -f storage/logs/laravel.log

# Web server logs
tail -f /var/log/apache2/cashmanagement_error.log

# System logs
tail -f /var/log/syslog
```

### Performance Monitoring
- Monitor CPU and memory usage
- Track database query performance
- Monitor disk space usage
- Set up uptime monitoring
- Configure error tracking (Sentry, Bugsnag)

### Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
mysqldump -u cashmanagement -p cashmanagement_production > /backups/db_backup_$DATE.sql
gzip /backups/db_backup_$DATE.sql

# Application backup
tar -czf /backups/app_backup_$DATE.tar.gz /var/www/html/cashmanagement --exclude=node_modules --exclude=.git
```

---

## 🚀 Deployment Automation

### Update Script
Create `/var/www/html/cashmanagement/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install/update dependencies
composer install --no-dev --optimize-autoloader

# Build assets
npm ci
npm run build

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers
sudo supervisorctl restart cashmanagement-worker:*

echo "✅ Deployment completed successfully!"
```

```bash
chmod +x deploy.sh
```

---

## 🆘 Troubleshooting

### Common Issues

#### Permission Errors
```bash
sudo chown -R www-data:www-data /var/www/html/cashmanagement
sudo chmod -R 775 storage bootstrap/cache
```

#### Cache Issues
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### Queue Not Processing
```bash
sudo supervisorctl status cashmanagement-worker:*
sudo supervisorctl restart cashmanagement-worker:*
```

#### SSL Certificate Issues
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

---

## 📞 Support

For production deployment support:
- Check the application logs first
- Verify all environment variables are set correctly
- Ensure all services are running (Apache, MySQL, Redis)
- Contact your hosting provider for server-specific issues

---

## ✅ Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] SSL certificate is valid and working
- [ ] Database connections are working
- [ ] Redis is connected and functioning
- [ ] Queue workers are processing jobs
- [ ] Cron jobs are running
- [ ] Email sending is working
- [ ] WebSocket connections are working
- [ ] File uploads are working
- [ ] Backups are configured and tested
- [ ] Monitoring is set up
- [ ] Error tracking is configured

**🎉 Your Cash Management System is now live in production!**
