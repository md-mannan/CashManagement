# Cash Management - cPanel Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Cash Management application on cPanel shared hosting using Git clone. This method is ideal for production environments where you have cPanel access but limited server control.

## Prerequisites

- **cPanel Access** with Git support enabled
- **SSH Access** (recommended) or cPanel Terminal
- **Git Repository** access to the client branch
- **PHP 8.2+** support on your hosting
- **MySQL/MariaDB** database
- **Composer** support (if available)

## 🚀 Quick Deployment

### 1. Access cPanel

1. Login to your cPanel account
2. Navigate to **Files** → **File Manager** or use **Terminal** (if available)
3. Go to your `public_html` directory (or subdomain directory)

### 2. Clone the Repository

#### Using cPanel Terminal (Recommended)
```bash
# Navigate to your web directory
cd public_html

# Clone the client branch
git clone -b client <your-repository-url> cash-management

# Navigate into the project
cd cash-management
```

#### Using File Manager + Git
1. Open **File Manager** in cPanel
2. Navigate to `public_html`
3. Click **Terminal** or use **Git Version Control**
4. Run the clone command above

### 3. Set Up the Application

```bash
# Install PHP dependencies (if Composer is available)
composer install --optimize-autoloader --no-dev

# Install Node.js dependencies (if available)
npm install --production

# Build frontend assets
npm run build

# Set proper permissions
chmod -R 755 storage bootstrap/cache
chmod -R 644 .env
```

## 📋 Detailed Setup Process

### Step 1: Database Setup

#### Create Database in cPanel
1. Go to **Databases** → **MySQL Databases**
2. Create a new database: `yourusername_cashmanagement`
3. Create a database user with full privileges
4. Note down: database name, username, password, and host

#### Database Configuration
1. Copy the production environment template:
   ```bash
   cp env.production.template .env
   ```

2. Update `.env` with your database credentials:
   ```env
   APP_NAME="Cash Management"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com/cash-management
   
   # Database Configuration
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=yourusername_cashmanagement
   DB_USERNAME=yourusername_dbuser
   DB_PASSWORD=your_secure_password
   
   # Mail Configuration
   MAIL_MAILER=smtp
   MAIL_HOST=yourdomain.com
   MAIL_PORT=587
   MAIL_USERNAME=noreply@yourdomain.com
   MAIL_PASSWORD=your_mail_password
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@yourdomain.com
   MAIL_FROM_NAME="${APP_NAME}"
   ```

### Step 2: Application Configuration

#### Generate Application Key
```bash
# Generate a new application key
php artisan key:generate
```

#### Update Application Settings
```env
# Application Settings
APP_NAME="Your Company Name"
APP_URL=https://yourdomain.com/cash-management
APP_TIMEZONE=UTC
APP_LOCALE=en

# Security Settings
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Performance Settings
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync
```

### Step 3: File Structure Setup

#### Directory Structure
```
public_html/
├── cash-management/          # Your application
│   ├── public/              # Public assets
│   ├── storage/             # Application storage
│   ├── bootstrap/cache/     # Cache files
│   └── .env                 # Environment file
└── index.html               # Main site (if any)
```

#### Public Directory Configuration
1. **Option A: Subdirectory Access**
   - Access via: `https://yourdomain.com/cash-management`
   - No additional configuration needed

2. **Option B: Subdomain Access**
   - Create subdomain: `cash.yourdomain.com`
   - Point to: `public_html/cash-management/public`
   - Update `.env`: `APP_URL=https://cash.yourdomain.com`

3. **Option C: Root Domain Access**
   - Move contents of `public/` to `public_html/`
   - Update `.env`: `APP_URL=https://yourdomain.com`
   - Requires `.htaccess` in root

### Step 4: Install the Application

#### Run Installation Wizard
1. Visit: `https://yourdomain.com/cash-management/install`
2. Follow the installation wizard:
   - System requirements check
   - Database configuration
   - Application settings
   - Admin user creation

#### Manual Installation (Alternative)
```bash
# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Clear and cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🔧 cPanel-Specific Configuration

### 1. PHP Configuration

#### Check PHP Version
1. Go to **Software** → **Select PHP Version**
2. Ensure PHP 8.2+ is selected
3. Enable required extensions:
   - `pdo_mysql`
   - `mbstring`
   - `openssl`
   - `json`
   - `tokenizer`
   - `xml`
   - `ctype`
   - `bcmath`

#### PHP Settings
```ini
; Recommended PHP settings for production
memory_limit = 256M
max_execution_time = 300
upload_max_filesize = 64M
post_max_size = 64M
max_input_vars = 3000
```

### 2. .htaccess Configuration

#### Main .htaccess (in public directory)
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/icon "access plus 1 year"
    ExpiresByType text/plain "access plus 1 month"
    ExpiresByType text/html "access plus 1 month"
</IfModule>
```

### 3. Cron Jobs Setup

#### Set Up Cron Jobs in cPanel
1. Go to **Advanced** → **Cron Jobs**
2. Add the following cron job:

```bash
# Laravel Scheduler (every minute)
* * * * * cd /home/yourusername/public_html/cash-management && php artisan schedule:run >> /dev/null 2>&1

# Queue Worker (if using queues)
* * * * * cd /home/yourusername/public_html/cash-management && php artisan queue:work --timeout=60 --tries=3 >> /dev/null 2>&1
```

## 🌐 Domain Configuration

### Subdomain Setup
1. Go to **Domains** → **Subdomains**
2. Create subdomain: `cash.yourdomain.com`
3. Document root: `public_html/cash-management/public`
4. Update `.env`: `APP_URL=https://cash.yourdomain.com`

### SSL Certificate
1. Go to **Security** → **SSL/TLS**
2. Install SSL certificate for your domain/subdomain
3. Force HTTPS redirect in `.htaccess`:

```apache
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 📊 Performance Optimization

### 1. Caching Strategy
```bash
# Enable all caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 2. Asset Optimization
```bash
# Build production assets
npm run build

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### 3. Database Optimization
```sql
-- Optimize tables
OPTIMIZE TABLE users, transactions, categories, notifications;

-- Check table status
SHOW TABLE STATUS;
```

## 🛡️ Security Configuration

### 1. File Permissions
```bash
# Set proper permissions
chmod -R 755 storage bootstrap/cache
chmod -R 644 .env
chmod 644 public/.htaccess
```

### 2. Security Headers
Add to `.htaccess`:
```apache
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
```

### 3. Environment Protection
```bash
# Make .env read-only
chmod 400 .env

# Protect storage directory
chmod 755 storage
chmod 644 storage/.gitignore
```

## 🔄 Maintenance and Updates

### 1. Application Updates
```bash
# Pull latest changes
git pull origin client

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install --production
npm run build

# Run migrations
php artisan migrate --force

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 2. Database Backup
```bash
# Create backup
mysqldump -u username -p database_name > backup.sql

# Restore backup
mysql -u username -p database_name < backup.sql
```

### 3. Log Management
```bash
# Clear old logs
php artisan log:clear

# Monitor log files
tail -f storage/logs/laravel.log
```

## 🆘 Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error
- Check `.htaccess` file exists
- Verify mod_rewrite is enabled
- Check file permissions
- Review error logs

#### 2. Database Connection Failed
- Verify database credentials in `.env`
- Check database exists and is accessible
- Test connection via phpMyAdmin
- Verify MySQL service is running

#### 3. Permission Denied
```bash
# Fix permissions
chmod -R 755 storage bootstrap/cache
chmod 644 .env
chmod 644 public/.htaccess
```

#### 4. Route Not Found
```bash
# Clear route cache
php artisan route:clear
php artisan route:cache

# Check .htaccess configuration
# Verify mod_rewrite is enabled
```

### Performance Issues

#### 1. Slow Loading
- Enable OPcache in PHP
- Use CDN for assets
- Optimize database queries
- Enable compression

#### 2. Memory Issues
- Increase PHP memory limit
- Optimize database settings
- Use file-based caching
- Monitor resource usage

## 📚 Support Resources

### Documentation
- [Laravel Documentation](https://laravel.com/docs)
- [cPanel Documentation](https://docs.cpanel.net/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### Community Support
- Laravel Forums
- Stack Overflow
- cPanel Community
- GitHub Issues

### Contact Information
- Technical Support: [Your Support Email]
- Documentation: [Your Documentation URL]
- Repository: [Your Repository URL]

## 🎯 Best Practices

### 1. Development Workflow
- Use feature branches for development
- Test on staging environment first
- Use automated deployment scripts
- Maintain backup strategies

### 2. Security Measures
- Regular security updates
- Strong password policies
- SSL certificate management
- Regular security audits

### 3. Performance Monitoring
- Monitor server resources
- Track application performance
- Optimize database queries
- Use caching strategies

---

**Note**: This guide assumes you're using the `client` branch of the Cash Management application. Make sure you have the correct repository access and are working with the production-ready version.

**Environment**: cPanel Shared Hosting  
**Deployment Method**: Git Clone + Manual Configuration  
**Target**: Production Environment
