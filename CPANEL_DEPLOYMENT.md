# cPanel Deployment Guide for Cash Management System

## 🚀 Pre-Deployment Checklist

### 1. Build Production Assets
```bash
# Clean previous builds
rm -rf public/build

# Build for production
npm run build

# Verify manifest.json exists
ls -la public/build/.vite/manifest.json
```

### 2. Environment Configuration
```bash
# Copy environment file
cp .env.example .env.production

# Update production settings
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database configuration
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 3. File Permissions Check
```bash
# Ensure proper permissions
chmod -R 755 public/
chmod -R 755 public/build/
chmod 644 public/build/.vite/manifest.json
```

## 📁 cPanel Upload Structure

### Files to Upload:
```
public_html/
├── .htaccess (from public/.htaccess)
├── index.php (from public/index.php)
├── build/ (entire build directory)
├── favicon.ico
├── favicon.svg
├── apple-touch-icon.png
├── logo.svg
└── robots.txt

app/ (outside public_html)
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

## ⚙️ cPanel-Specific Configuration

### 1. Update .htaccess for cPanel
Ensure your `.htaccess` includes:
```apache
# Production asset handling
RewriteCond %{REQUEST_URI} ^/build/
RewriteRule ^ - [L]

# MIME types for modern assets
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType application/javascript .mjs
    AddType text/css .css
    AddType application/json .json
    AddType image/svg+xml .svg
</IfModule>
```

### 2. PHP Configuration
Add to `.htaccess` if needed:
```apache
# PHP settings
php_value memory_limit 512M
php_value max_execution_time 300
php_value upload_max_filesize 50M
php_value post_max_size 50M
```

### 3. Laravel Path Configuration
Update `public/index.php`:
```php
// Adjust paths for cPanel structure
require __DIR__.'/../app/vendor/autoload.php';
$app = require_once __DIR__.'/../app/bootstrap/app.php';
```

## 🔧 Common Issues & Solutions

### Issue 1: Assets Not Loading
**Problem**: CSS/JS files return 404 errors
**Solution**:
```bash
# Verify build directory structure
ls -la public/build/
ls -la public/build/assets/
ls -la public/build/.vite/

# Check .htaccess rules
grep -n "build" public/.htaccess
```

### Issue 2: Manifest.json Missing
**Problem**: Laravel can't find the Vite manifest
**Solution**:
```bash
# Rebuild assets
npm run build

# Verify manifest exists and is readable
cat public/build/.vite/manifest.json | head -20
```

### Issue 3: Notification Display Issues
**Problem**: Notifications appear broken or misaligned
**Solution**: Already fixed in latest build with:
- Responsive positioning (`right-2 sm:right-4`)
- Proper z-index layering (`z-[9997]` to `z-[9999]`)
- Mobile-friendly widths (`w-[calc(100vw-1rem)]`)
- Pointer events handling

### Issue 4: Database Connection
**Problem**: Can't connect to MySQL database
**Solution**:
```php
// In .env
DB_HOST=localhost  // or your cPanel MySQL host
DB_PORT=3306
DB_DATABASE=cpanel_dbname
DB_USERNAME=cpanel_username
DB_PASSWORD=your_password
```

## 📋 Deployment Steps

### Step 1: Prepare Files Locally
```bash
# 1. Build production assets
npm run build

# 2. Create deployment zip
zip -r deployment.zip \
  app/ \
  bootstrap/ \
  config/ \
  database/ \
  resources/ \
  routes/ \
  storage/ \
  vendor/ \
  public/build/ \
  public/.htaccess \
  public/index.php \
  public/favicon.ico \
  public/favicon.svg \
  public/apple-touch-icon.png \
  public/logo.svg \
  public/robots.txt \
  .env.production \
  artisan \
  composer.json \
  composer.lock
```

### Step 2: Upload to cPanel
1. **Upload app files** to a directory outside `public_html` (e.g., `/app/`)
2. **Upload public files** to `public_html/`:
   - `public/.htaccess` → `public_html/.htaccess`
   - `public/index.php` → `public_html/index.php`
   - `public/build/` → `public_html/build/`
   - Other public assets

### Step 3: Configure Environment
```bash
# Rename environment file
mv .env.production .env

# Set proper permissions
chmod 644 .env
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

### Step 4: Run Laravel Commands
```bash
# Generate app key
php artisan key:generate

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Run migrations
php artisan migrate --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🔍 Testing Production Build

### Local Testing
```bash
# Serve production build locally
php artisan serve --env=production

# Test in browser
curl -I http://localhost:8000/build/assets/app.css
curl -I http://localhost:8000/build/assets/app.js
```

### Production Testing
1. **Check asset loading**: Open browser dev tools and verify no 404s
2. **Test notifications**: Trigger a notification to verify display
3. **Test responsive design**: Check on mobile devices
4. **Verify database**: Test login and data operations

## 📱 Mobile Optimization

The latest build includes mobile-specific fixes:
- Responsive notification positioning
- Proper viewport handling
- Touch-friendly UI elements
- Optimized asset loading

## 🎯 Performance Optimization

### Recommendations:
1. **Enable cPanel compression** for static assets
2. **Set proper cache headers** in `.htaccess`
3. **Use CDN** for static assets if needed
4. **Monitor performance** with browser dev tools

---

## 📞 Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify `.htaccess` configuration
3. Check file permissions
4. Review Laravel logs in `storage/logs/`
5. Test with a fresh build: `rm -rf public/build && npm run build`