# Cash Management - Complete Deployment Guide

## 🎯 **Overview**

This guide provides complete instructions for deploying your Cash Management application with **Dynamic Environment Configuration** and **Laravel Reverb WebSockets** for both local development and production environments.

## 🏗️ **System Architecture**

### **🧠 Dynamic Environment Detection**
- **Automatically detects**: Local, Shared Hosting, VPS, Cloud environments
- **Smart configuration**: Optimizes database, cache, sessions, and WebSockets
- **Laravel Reverb priority**: Uses Reverb for all environments with optimized settings

### **🔧 Key Features**
- **MySQL for consistency**: Both local and production use MySQL
- **Reverb WebSockets**: Real-time features across all environments
- **Environment-specific optimizations**: Automatic performance tuning
- **Production-ready**: Secure configurations with proper caching

---

## 🖥️ **Local Development Setup**

### **Prerequisites**
- PHP 8.2+
- MySQL 8.0+
- Node.js 18+
- Composer

### **Step 1: MySQL Database Setup**

**Install MySQL** (if not already installed):
```bash
# Ubuntu/Debian
sudo apt install mysql-server

# macOS (Homebrew)
brew install mysql

# Windows: Download from mysql.com
```

**Start MySQL and create database**:
```bash
# Start MySQL service
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# Access MySQL
mysql -u root -p

# Create databases
CREATE DATABASE cashmanagement_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE cashmanagement_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;  -- For testing
SHOW DATABASES;
EXIT;
```

### **Step 2: Application Setup**

**Clone and configure**:
```bash
# Navigate to project
cd /path/to/CashManagement

# Detect environment (should show 'local')
php artisan env:detect

# Generate optimized local configuration
php artisan env:config --generate --force

# Generate application key
php artisan key:generate

# Install dependencies
composer install
npm install
```

### **Step 3: Database Migration**

```bash
# Run migrations
php artisan migrate

# Seed with sample data
php artisan db:seed
```

### **Step 4: Start Development Servers**

**You need 4 terminals running simultaneously:**

**Terminal 1 - Laravel Server:**
```bash
php artisan serve
# App available at: http://localhost:8000
```

**Terminal 2 - Reverb WebSocket Server:**
```bash
php artisan reverb:start
# WebSocket server at: http://localhost:8080
```

**Terminal 3 - Frontend Build (Vite):**
```bash
npm run dev
# Hot reloading for CSS/JS changes
```

**Terminal 4 - Queue Worker (Optional):**
```bash
php artisan queue:work
# Processes background jobs
```

### **Step 5: Verify Local Setup**

**Check your local configuration:**
```env
# Automatically generated for local development
DB_CONNECTION=mysql
DB_DATABASE=cashmanagement_local
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_CONNECTION=reverb
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

APP_DEBUG=true
APP_ENV=local
```

**Access your application:**
- **Main App**: http://localhost:8000
- **WebSocket**: http://localhost:8080 (automatic)

---

## 🌐 **Production Deployment**

### **Step 1: Prepare Local Environment**

```bash
# Build production assets
npm run build

# Install production dependencies
composer install --no-dev --optimize-autoloader

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### **Step 2: Create Production Package**

**Create deployment archive:**
```bash
# The system will automatically exclude unnecessary files
zip -r cashmanagement-production.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "storage/logs/*" \
  -x ".env" \
  -x "tests/*" \
  -x "*.md" \
  -x "deploy*.sh"
```

### **Step 3: cPanel/Shared Hosting Deployment**

**Upload and extract:**
1. Login to cPanel
2. Go to **File Manager**
3. Upload `cashmanagement-production.zip`
4. Extract the archive

**Organize file structure:**
1. **Move Laravel's `public` folder contents** to your domain's public folder (`public_html`)
2. **Move all other Laravel files** to a folder **outside** the public directory (e.g., `laravel_app`)

**Update file paths in `public_html/index.php`:**
```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Update these paths to point to your Laravel app directory
require __DIR__.'/../laravel_app/vendor/autoload.php';
$app = require_once __DIR__.'/../laravel_app/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
```

### **Step 4: Production Database Setup**

**In cPanel:**
1. Go to **MySQL Databases**
2. Create database: `yourusername_cashmanagement`
3. Create database user with strong password
4. Assign user to database with **All Privileges**

### **Step 5: Production Environment Configuration**

**Create `.env` file in `laravel_app` directory:**

The system will automatically detect your hosting environment and optimize settings. Create `.env`:

```env
APP_NAME="Cash Management"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database Configuration (Update with your actual values)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=yourusername_cashmanagement
DB_USERNAME=yourusername_dbuser
DB_PASSWORD=your_strong_password

# Laravel Reverb Configuration (Primary WebSocket Driver)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=123456
REVERB_APP_KEY=your_generated_reverb_key
REVERB_APP_SECRET=your_generated_reverb_secret
REVERB_HOST="yourdomain.com"
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

# Production Optimizations (Auto-configured by system)
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
LOG_LEVEL=error

# Social Authentication (Configure if needed)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# External APIs
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key

# Frontend Configuration
VITE_APP_NAME="${APP_NAME}"
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### **Step 6: Final Production Setup**

**Set file permissions:**
- `storage/` and subfolders: **755**
- `bootstrap/cache/`: **755**
- All files: **644**

**Run Laravel commands** (via cPanel Terminal or SSH):
```bash
cd /path/to/your/laravel_app

# Generate application key
php artisan key:generate --force

# Run migrations
php artisan migrate --force

# Seed database (optional)
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Enable SSL Certificate:**
1. In cPanel, go to **SSL/TLS**
2. Enable **Let's Encrypt** (free)
3. Force HTTPS redirect

---

## 🔧 **Environment Configurations**

### **Local Development**
```env
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_DATABASE=cashmanagement_local
BROADCAST_CONNECTION=reverb
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
MAIL_MAILER=log
```

### **Shared Hosting Production**
```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
BROADCAST_CONNECTION=reverb
REVERB_HOST="yourdomain.com"
REVERB_PORT=443
REVERB_SCHEME=https
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
MAIL_MAILER=smtp
```

### **VPS/Dedicated Production**
```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
BROADCAST_CONNECTION=reverb
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
MAIL_MAILER=smtp
```

---

## 🚀 **Laravel Reverb WebSocket Setup**

### **For All Environments**

**Reverb is automatically configured** with environment-specific optimizations:

### **Local Development**
- **Host**: localhost
- **Port**: 8080
- **Scheme**: http
- **Server**: `php artisan reverb:start`

### **Shared Hosting**
- **Host**: yourdomain.com
- **Port**: 443
- **Scheme**: https
- **Optimizations**: Smaller message sizes, frequent pings for stability
- **No separate server needed** - works through web server

### **VPS/Dedicated**
- **Host**: yourdomain.com
- **Port**: 443
- **Scheme**: https
- **Server**: `php artisan reverb:start --host=0.0.0.0 --port=8080`
- **Supervisor recommended** for process management

---

## 🧪 **Testing**

### **Local Testing**
```bash
# Run tests (uses SQLite in memory for speed)
php artisan test

# Test specific feature
php artisan test --filter AuthenticationTest

# Test with coverage
php artisan test --coverage
```

### **Production Testing**
1. **Verify environment detection**: `php artisan env:detect`
2. **Test database connection**: `php artisan migrate:status`
3. **Test WebSocket**: Check browser console for Reverb connection
4. **Test features**: Registration, login, transactions, real-time updates

---

## 🛠️ **Development Workflow**

### **Daily Development**
```bash
# 1. Start MySQL service
sudo systemctl start mysql

# 2. Start development servers (4 terminals)
php artisan serve          # Terminal 1
php artisan reverb:start    # Terminal 2
npm run dev                 # Terminal 3
php artisan queue:work      # Terminal 4 (optional)

# 3. Make changes and test
# 4. Commit changes
git add .
git commit -m "Your changes"
git push
```

### **Database Management**
```bash
# Fresh migration with seeding
php artisan migrate:fresh --seed

# Create new migration
php artisan make:migration add_new_feature

# Database backup
mysqldump -u root -p cashmanagement_local > backup.sql

# Access database
mysql -u root -p cashmanagement_local
```

---

## 🔍 **Troubleshooting**

### **Local Development Issues**

**MySQL Connection Error:**
```bash
# Check MySQL status
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Reset root password if needed
sudo mysql_secure_installation
```

**Reverb Connection Issues:**
```bash
# Check if port is available
netstat -tlnp | grep :8080

# Start Reverb with debug
php artisan reverb:start --debug
```

**Migration Errors:**
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE cashmanagement_local; CREATE DATABASE cashmanagement_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Fresh migration
php artisan migrate:fresh --seed
```

### **Production Issues**

**500 Internal Server Error:**
- Check file permissions (755 for folders, 644 for files)
- Verify `.env` configuration
- Check cPanel error logs

**Database Connection Error:**
- Verify database credentials in `.env`
- Ensure database user has proper privileges
- Check database host (usually `localhost`)

**WebSocket Issues:**
- Verify domain in `REVERB_HOST`
- Check SSL certificate
- Ensure firewall allows HTTPS traffic

---

## 📊 **Performance Optimization**

### **Local Development**
- **MySQL**: Better consistency with production
- **File Cache**: Fast for development
- **Sync Queue**: Immediate job processing
- **Debug Mode**: Detailed error reporting

### **Production**
- **Database Cache**: Reliable on shared hosting
- **Database Sessions**: Better than file sessions
- **Database Queue**: Works with hosting limitations
- **Reverb Optimizations**: Tuned for stability

---

## 🎯 **Key Benefits**

### **🔄 Dynamic Configuration**
- **Zero manual setup** - detects and configures automatically
- **Environment-specific optimizations** for best performance
- **Consistent experience** across all hosting types

### **⚡ Laravel Reverb**
- **Real-time WebSockets** for all environments
- **No external dependencies** - free WebSocket solution
- **Optimized for shared hosting** with stability enhancements

### **🛡️ Production Ready**
- **Security optimizations** applied automatically
- **Performance caching** enabled in production
- **Error handling** appropriate for each environment

---

## 🚀 **Quick Start Commands**

### **Local Development**
```bash
# One-time setup
php artisan env:detect
php artisan env:config --generate
php artisan migrate --seed

# Daily development (4 terminals)
php artisan serve
php artisan reverb:start
npm run dev
php artisan queue:work
```

### **Production Deployment**
```bash
# Local preparation
npm run build
composer install --no-dev --optimize-autoloader

# Server setup (after upload)
php artisan key:generate --force
php artisan migrate --force
php artisan storage:link
php artisan config:cache
```

---

Your Cash Management application is now ready for both **local development** and **production deployment** with intelligent environment detection and Laravel Reverb WebSockets! 🎉

The system automatically adapts to any hosting environment while providing optimal performance and reliability.
