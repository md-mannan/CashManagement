# 🚀 cPanel Deployment Guide for Cash Management System

## ✅ Build Optimization Complete

The application has been optimized for cPanel/shared hosting deployment with:
- ✅ **Chunk splitting** - Large bundles split into smaller, manageable chunks
- ✅ **Bundle optimization** - Reduced bundle sizes for faster loading
- ✅ **Tree shaking** - Unused code removed
- ✅ **Console log removal** - Debug logs removed for production
- ✅ **Legacy browser support** - Support for older browsers

## 📋 Pre-Deployment Checklist

### 1. ✅ Production Build (Already Done)
```bash
npm run build
```
- ✅ Assets optimized and chunked
- ✅ No chunk size warnings
- ✅ Manifest file generated

### 2. Environment Configuration
Create `.env` file for production:
```bash
# Copy the cPanel environment template
cp env-cpanel.example .env
```

Update the `.env` file with your actual values:
```env
APP_NAME="Cash Management System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database Configuration (cPanel MySQL)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_cpanel_database_name
DB_USERNAME=your_cpanel_database_user
DB_PASSWORD=your_database_password

# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=1440

# Cache Configuration
CACHE_STORE=file
CACHE_PREFIX=cashmanagement_cpanel

# Mail Configuration (cPanel Email)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

## 📁 File Structure for cPanel

### Upload to `public_html/` (Web Root):
```
public_html/
├── .htaccess
├── index.php
├── build/
│   ├── assets/
│   │   ├── app.js
│   │   ├── app.css
│   │   ├── react-vendor.js
│   │   ├── ui-vendor.js
│   │   ├── charts-vendor.js
│   │   ├── export-vendor.js
│   │   └── [other optimized chunks]
│   └── .vite/
│       └── manifest.json
├── favicon.ico
├── favicon.svg
├── apple-touch-icon.png
├── logo.svg
└── robots.txt
```

### Upload to directory outside `public_html/` (e.g., `/laravel/`):
```
laravel/
├── app/
├── bootstrap/
├── config/
├── database/
├── resources/
├── routes/
├── storage/
├── vendor/
├── .env
├── artisan
├── composer.json
└── composer.lock
```

## ⚙️ Configuration Steps

### Step 1: Update `public_html/index.php`
Edit `public_html/index.php` to point to the correct Laravel directory:

```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
*/

if (file_exists($maintenance = __DIR__.'/../laravel/storage/framework/maintenance.php')) {
    require $maintenance;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
*/

require __DIR__.'/../laravel/vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
*/

$app = require_once __DIR__.'/../laravel/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
```

### Step 2: Set File Permissions
```bash
# Set proper permissions for Laravel files
chmod 644 laravel/.env
chmod -R 755 laravel/storage/
chmod -R 755 laravel/bootstrap/cache/
chmod -R 755 public_html/build/
```

### Step 3: Run Laravel Setup Commands
```bash
cd laravel

# Generate application key
php artisan key:generate

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Run database migrations
php artisan migrate --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🔧 cPanel-Specific Optimizations

### 1. Enhanced `.htaccess` for cPanel
Create/update `public_html/.htaccess`:

```apache
# Enable rewrite engine
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

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# PHP Settings (if supported)
<IfModule mod_php.c>
    php_value memory_limit 256M
    php_value max_execution_time 300
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
</IfModule>
```

### 2. Database Configuration
Ensure your cPanel MySQL database is properly configured:
- Create a MySQL database in cPanel
- Create a database user with full privileges
- Update the `.env` file with correct credentials

### 3. Email Configuration
Configure cPanel email for notifications:
- Use cPanel's SMTP settings
- Test email functionality after deployment

## 🧪 Testing After Deployment

### 1. Basic Functionality Tests
- ✅ Homepage loads correctly
- ✅ Login/Register pages work
- ✅ Dashboard displays properly
- ✅ Assets load without 404 errors

### 2. Performance Tests
- ✅ Page load times are acceptable
- ✅ JavaScript chunks load efficiently
- ✅ CSS is properly cached
- ✅ Images load correctly

### 3. Feature Tests
- ✅ User registration works
- ✅ User login works
- ✅ Transaction management works
- ✅ Financial summaries display correctly
- ✅ Notifications work properly

## 🔍 Troubleshooting Common Issues

### Issue 1: Assets Not Loading (404 Errors)
**Solution:**
- Verify `.htaccess` file is in `public_html/`
- Check file permissions on `build/` directory
- Ensure `manifest.json` exists and is readable

### Issue 2: Database Connection Failed
**Solution:**
- Verify database credentials in `.env`
- Check if database exists in cPanel
- Ensure database user has proper permissions

### Issue 3: White Screen or 500 Error
**Solution:**
- Check Laravel logs in `laravel/storage/logs/`
- Verify file permissions on `storage/` and `bootstrap/cache/`
- Check PHP version compatibility

### Issue 4: Slow Loading Times
**Solution:**
- Enable cPanel compression
- Check if CDN is configured properly
- Verify chunk splitting is working

## 📊 Performance Monitoring

### Monitor These Metrics:
- **Page Load Time**: Should be under 3 seconds
- **Asset Loading**: No 404 errors for CSS/JS files
- **Database Queries**: Monitor for slow queries
- **Memory Usage**: Stay within hosting limits

### Tools for Monitoring:
- Browser Developer Tools
- cPanel Resource Usage
- Laravel Telescope (if enabled)
- External monitoring services

## 🔒 Security Considerations

### 1. File Permissions
- Keep Laravel files outside `public_html/`
- Set proper permissions (755 for directories, 644 for files)
- Protect `.env` file

### 2. SSL/HTTPS
- Enable SSL certificate in cPanel
- Force HTTPS in Laravel configuration
- Update `APP_URL` to use `https://`

### 3. Database Security
- Use strong database passwords
- Limit database user privileges
- Regular database backups

## 📞 Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Review Laravel logs in `laravel/storage/logs/`
3. Verify file permissions and paths
4. Test with a fresh build if needed

---

## 🎯 Deployment Summary

✅ **Build optimized** with chunk splitting  
✅ **Bundle sizes reduced** for better performance  
✅ **Legacy browser support** included  
✅ **Security optimizations** applied  
✅ **cPanel-specific configurations** ready  

Your Cash Management System is now ready for cPanel deployment! 🚀
