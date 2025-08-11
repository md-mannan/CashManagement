# cPanel Deployment - Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Access cPanel
- Login to cPanel → **Terminal** or **File Manager**

### 2. Clone Repository
```bash
cd public_html
git clone -b client <your-repo-url> cash-management
cd cash-management
```

### 3. Setup Environment
```bash
cp env.production.template .env
# Edit .env with your database credentials
```

### 4. Install & Build
```bash
composer install --optimize-autoloader --no-dev
npm install --production && npm run build
```

### 5. Run Installer
- Visit: `https://yourdomain.com/cash-management/install`
- Follow the wizard

## 📋 Essential Commands

### Database Setup
```bash
# Create database in cPanel MySQL Databases
# Update .env with credentials
php artisan migrate --force
php artisan db:seed --force
```

### Optimization
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Permissions
```bash
chmod -R 755 storage bootstrap/cache
chmod 644 .env
```

## 🌐 Access Points

| URL | Purpose |
|-----|---------|
| `https://yourdomain.com/cash-management` | Main Application |
| `https://yourdomain.com/cash-management/install` | Installation Wizard |
| `https://yourdomain.com/phpmyadmin` | Database Management |

## ⚙️ cPanel Settings

### PHP Configuration
- **PHP Version**: 8.2+
- **Extensions**: pdo_mysql, mbstring, openssl, json, tokenizer, xml, ctype, bcmath
- **Memory Limit**: 256M
- **Max Execution Time**: 300s

### Required Modules
- mod_rewrite
- mod_headers
- mod_deflate
- mod_expires

## 🔧 .env Configuration

```env
APP_NAME="Cash Management"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com/cash-management

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=yourusername_cashmanagement
DB_USERNAME=yourusername_dbuser
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
```

## 🛡️ Security Checklist

- [ ] SSL certificate installed
- [ ] .env file permissions set to 644
- [ ] storage directory permissions set to 755
- [ ] Security headers configured in .htaccess
- [ ] Database user has limited privileges
- [ ] Strong admin password set

## 📊 Performance Checklist

- [ ] OPcache enabled
- [ ] Asset compression enabled
- [ ] Browser caching configured
- [ ] Database queries optimized
- [ ] Application caches enabled

## 🆘 Common Issues

### 500 Error
```bash
# Check .htaccess exists
# Verify mod_rewrite enabled
# Check file permissions
# Review error logs
```

### Database Connection
```bash
# Verify credentials in .env
# Check database exists
# Test in phpMyAdmin
```

### Route Not Found
```bash
php artisan route:clear
php artisan route:cache
# Check .htaccess configuration
```

## 🔄 Updates

### Pull Latest Changes
```bash
git pull origin client
composer install --optimize-autoloader --no-dev
npm install --production && npm run build
php artisan migrate --force
php artisan config:cache
```

### Backup Database
```bash
mysqldump -u username -p database > backup.sql
```

## 📞 Support

- **Documentation**: `CPANEL_DEPLOYMENT_GUIDE.md`
- **Scripts**: `deploy-cpanel.sh` / `deploy-cpanel.bat`
- **Troubleshooting**: Check logs in `storage/logs/`

---

**Environment**: cPanel Shared Hosting  
**Branch**: client  
**Method**: Git Clone + Manual Setup
