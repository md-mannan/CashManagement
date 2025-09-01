# 💰 Cash Management System

A modern, full-featured financial management application built with Laravel 12 and React 19. Track income, expenses, manage categories, handle multiple currencies, and get real-time notifications with a beautiful, responsive interface.

![Laravel](https://img.shields.io/badge/Laravel-12.x-red?style=flat-square&logo=laravel)
![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![PHP](https://img.shields.io/badge/PHP-8.2+-purple?style=flat-square&logo=php)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ **Key Features**

### 📊 **Financial Management**
- **Transaction Tracking** - Income, expenses, payables, and receivables
- **Category Management** - Organize transactions with custom categories
- **Multi-Currency Support** - Handle multiple currencies with real-time exchange rates
- **Financial Reports** - Comprehensive analytics and reporting
- **Export/Import** - Excel/CSV export and import functionality

### 🎨 **Modern Interface**
- **Responsive Design** - Beautiful UI that works on all devices
- **Dark/Light Mode** - Toggle between themes with system preference detection
- **Theme Customization** - Multiple color themes (Neutral, Violet)
- **Real-time Updates** - Live notifications and data updates via WebSockets

### 🔐 **Security & Administration**
- **Role-based Access Control** - Admin, Super Admin, and User roles
- **User Management** - Complete user administration panel
- **Activity Logging** - Comprehensive audit trail
- **Secure Authentication** - Laravel Sanctum with session management

## 🧑‍💻 Local Development Setup

### Prerequisites
- PHP 8.2+
- MySQL 8.0+ (running locally)
- Composer 2
- Node.js 20+ and npm
- Git

### Steps
```bash
# 1) Clone and enter project
git clone <your-repo-url>
cd CashManagement

# 2) Copy env and configure
cp env-local.example .env

# 3) Generate app key
php artisan key:generate

# 4) Configure MySQL in .env (example)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=cash_management
# DB_USERNAME=root
# DB_PASSWORD=secret

# 5) Install backend deps
composer install

# 6) Install frontend deps
npm install

# 7) Run migrations & seeders
php artisan migrate --seed

# 8) Create storage symlink
php artisan storage:link

# 9) Start servers (in two terminals)
php artisan serve
npm run dev

# 10) (Optional) Run tests
php artisan test
```

Visit: http://127.0.0.1:8000

If profile photos don't show locally, ensure the storage link exists and `APP_URL=http://127.0.0.1:8000` in `.env`.

## 🏭 Production Deployment (Generic Linux Server)

### Prerequisites
- Linux server (Ubuntu/Debian/CentOS), Nginx/Apache, PHP-FPM 8.2+
- MySQL 8.0+
- Git, Composer 2, Node.js 20+

### Steps
```bash
# 1) Clone and enter project (to /var/www/cash-management for example)
git clone <your-repo-url> /var/www/cash-management
cd /var/www/cash-management

# 2) Copy env and configure
cp env-production.example .env
# Edit .env with production DB, APP_URL=https://yourdomain.com, MAIL, etc.

# 3) Generate app key
php artisan key:generate

# 4) Install PHP deps without dev & optimize
composer install --no-dev --optimize-autoloader

# 5) Install and build frontend
npm ci || npm install
npm run build:deploy

# 6) Set correct permissions
chown -R www-data:www-data storage bootstrap/cache public/build
find storage -type d -exec chmod 755 {} \;
find storage -type f -exec chmod 644 {} \;
find bootstrap/cache -type d -exec chmod 755 {} \;
find bootstrap/cache -type f -exec chmod 644 {} \;

# 7) Migrate and (optionally) seed
php artisan migrate --force
# php artisan db:seed --force

# 8) Create storage link
php artisan storage:link

# 9) Cache config/routes/views
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Configure your web server to point the document root to the `public/` directory. Example Nginx server block (snippet):

```
server {
    server_name yourdomain.com;
    root /var/www/cash-management/public;

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    }
}
```

## 🚀 **cPanel Shared Hosting Deployment**

This guide will walk you through deploying the Cash Management System to any cPanel shared hosting provider.

### **📋 Prerequisites**

Before starting, ensure your cPanel hosting has:
- ✅ **PHP 8.2 or higher**
- ✅ **MySQL 8.0 or higher**
- ✅ **Composer support** (usually available via SSH or cPanel)
- ✅ **Node.js support** (for building assets)
- ✅ **Git access** (for cloning the repository)

### **🔧 Step-by-Step Deployment (cPanel)**

#### **Step 1: Prepare Your Local Environment**

```bash
# Clone the repository to your local machine
git clone https://github.com/yourusername/cash-management.git
cd cash-management

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies
npm install

# Build production assets
npm run build:deploy

# Fix build location (if build files are in root instead of public/build)
./fix-build-location.sh
# Or on Windows: fix-build-location.bat

# Create production environment file
cp env-cpanel.example .env
```

#### **Step 2: Configure Environment Variables**

Edit the `.env` file with your cPanel hosting details:

```env
# Application Configuration
APP_NAME="Cash Management System"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database Configuration (from cPanel)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_cpanel_database_name
DB_USERNAME=your_cpanel_database_user
DB_PASSWORD=your_cpanel_database_password

# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=1440
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=.yourdomain.com
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Cache Configuration
CACHE_STORE=database
CACHE_PREFIX=cashmanagement_prod

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Broadcasting Configuration
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=yourdomain.com
REVERB_PORT=443
REVERB_SCHEME=https

# Filesystem Configuration
FILESYSTEM_DISK=public

# Security Configuration
FORCE_HTTPS=true
HSTS_MAX_AGE=31536000
CONTENT_SECURITY_POLICY=true

# Performance Configuration
AUTO_DETECT_ENVIRONMENT=true
AUTO_MIGRATE=false
AUTO_SEED=false

# Production Optimizations
OPTIMIZE_AUTOLOADER=true
VIEW_CACHE_ENABLED=true
ROUTE_CACHE_ENABLED=true
CONFIG_CACHE_ENABLED=true

# cPanel Specific Settings
CPANEL_USERNAME=your_cpanel_username
CPANEL_DOMAIN=yourdomain.com
CPANEL_SUBDOMAIN=

# PHP Configuration (if supported by hosting provider)
PHP_MEMORY_LIMIT=256M
PHP_MAX_EXECUTION_TIME=300
PHP_MAX_INPUT_TIME=300
PHP_UPLOAD_MAX_FILESIZE=10M
PHP_POST_MAX_SIZE=10M
```

#### **Step 3: Upload Files to cPanel**

**Option A: Using cPanel File Manager**
1. Log into your cPanel
2. Open **File Manager**
3. Navigate to `public_html` (or your domain directory)
4. Upload all files from the project folder
5. **Important:** Ensure the `public` folder contents are in the root of your domain

**Option B: Using FTP/SFTP**
1. Use an FTP client (FileZilla, WinSCP, etc.)
2. Connect to your hosting server
3. Upload all project files to your domain directory
4. Ensure `public` folder contents are in the root

**Option C: Using Git (if available)**
```bash
# SSH into your hosting (if SSH access is available)
ssh username@yourdomain.com

# Navigate to your domain directory
cd public_html

# Clone the repository
git clone https://github.com/yourusername/cash-management.git .

# Install dependencies and build
composer install --no-dev --optimize-autoloader
npm install
npm run build
```

#### **Step 4: Set Up Database**

1. **Create Database in cPanel:**
   - Go to **MySQL Databases** in cPanel
   - Create a new database
   - Create a database user
   - Assign the user to the database with **ALL PRIVILEGES**

2. **Run Database Migrations:**
   ```bash
   # Via SSH (if available)
   php artisan migrate --force
   php artisan db:seed --force
   
   # OR via browser (if SSH not available)
   # Visit: https://yourdomain.com/migrate
   ```

#### **Step 5: Configure File Permissions**

Set the following permissions via cPanel File Manager:

**Via cPanel File Manager:**
1. Right-click on each folder/file
2. Select "Change Permissions"
3. Set the permissions as shown below

**Via SSH (if available):**
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chmod -R 755 public/build/
chmod 644 .env
```

**Required Permissions:**
- `storage/` → **755** (or **775**)
- `bootstrap/cache/` → **755** (or **775**)
- `public/build/` → **755**
- `.env` → **644**

#### **Step 6: Generate Application Key**

```bash
# Via SSH
php artisan key:generate

# OR manually add to .env file
APP_KEY=base64:your-32-character-key-here
```

#### **Step 7: Create Storage Link**

```bash
# Via SSH
php artisan storage:link

# OR manually create symlink in public_html (if artisan fails)
ln -s ../storage/app/public public/storage
```

#### **Step 8: Configure .htaccess for cPanel**

Copy the cPanel-specific `.htaccess` file:
```bash
# Copy the cPanel .htaccess to the root
cp public/.htaccess.cpanel public/.htaccess
```

#### **Step 9: Clear and Cache Configuration**

```bash
# Via SSH
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Also ensure APP_URL is correct
sed -n 's/^APP_URL=.*/APP_URL=https:\/\/yourdomain.com/p' .env >/dev/null || true
```

#### **Step 10: Test Your Installation**

1. Visit your domain: `https://yourdomain.com`
2. You should see the welcome page
3. Try registering a new account
4. Test the login functionality

### **🔧 Troubleshooting Common Issues**

#### **Issue: White Screen or 500 Error**
**Solution:**
1. Check `.env` file exists and is readable
2. Verify database credentials
3. Check PHP version (must be 8.2+)
4. Enable error reporting temporarily:
```env
APP_DEBUG=true
```

#### **Issue: Assets Not Loading**
**Solution:**
1. Ensure `public/build/` folder exists
2. Check file permissions on `public/build/`
3. Verify `.htaccess` file is present in root
4. Clear browser cache

#### **Issue: Database Connection Error**
**Solution:**
1. Verify database credentials in `.env`
2. Check if database exists in cPanel
3. Ensure database user has proper privileges
4. Try connecting via phpMyAdmin

#### **Issue: Permission Denied Errors**
**Solution:**
1. Set proper permissions on `storage/` and `bootstrap/cache/`
2. Check if your hosting supports the required PHP functions
3. Contact hosting support if needed

#### **Issue: Mail Not Working**
**Solution:**
1. Configure SMTP settings in `.env`
2. Use your hosting provider's SMTP settings
3. Test with a simple mail function first

#### **Issue: 419 CSRF Token Mismatch Error**
**Solution:**
1. Clear all caches:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```
2. Regenerate application key:
   ```bash
   php artisan key:generate
   ```
3. Check session configuration in `.env`:
   ```env
   SESSION_DOMAIN=yourdomain.com
   SESSION_SECURE_COOKIE=true
   ```
4. Ensure HTTPS is properly configured
5. Clear browser cache and cookies

#### **Issue: Build Error - "Production build not found. Please run: npm run build"**
**Solution:**
1. Check if build files are in the correct location:
   ```bash
   ls -la public/build/
   ```
2. If build files are in root directory instead of `public/build`:
   ```bash
   ./fix-build-location.sh
   # Or on Windows: fix-build-location.bat
   ```
3. If no build files exist, rebuild:
   ```bash
   npm install
   npm run build:deploy
   ```
4. Ensure `public/build/.vite/manifest.json` exists
5. Clear Laravel caches:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

#### **Issue: JavaScript Error - "can't access property 'innerHTML', document.body is null"**
**Solution:**
1. Ensure production build exists:
   ```bash
   npm run build:deploy
   ```
2. Check that `public/build` directory exists and contains:
   - `.vite/manifest.json`
   - `assets/` directory with JS/CSS files
3. If build files are missing, rebuild:
   ```bash
   npm install
   npm run build:deploy
   ```
4. Clear browser cache and reload the page
5. Check browser console for other JavaScript errors

#### **Issue: Content Security Policy (CSP) Errors**
**Solution:**
1. The CSP policy has been updated to allow blob URLs for profile photos
2. If you still see CSP errors, check that the correct `.htaccess` file is being used
3. Ensure the cPanel `.htaccess` file is copied to the root:
   ```bash
   cp public/.htaccess.cpanel public/.htaccess
   ```

#### **Issue: Profile Photos Not Loading (404 Errors)**
**Solution:**
1. Check if storage link exists:
   ```bash
   php artisan storage:link
   ```
2. Verify file permissions on storage directory
3. Check if files exist in `storage/app/public/profile-photos/`
4. Clear browser cache to remove old cached URLs
5. Run the diagnostic command:
   ```bash
   php artisan users:check-profile-photos
   ```

### **🔒 Security Checklist**

After deployment, ensure:
- ✅ `APP_DEBUG=false` in production
- ✅ `APP_ENV=production`
- ✅ Database credentials are secure
- ✅ File permissions are properly set
- ✅ HTTPS is enabled
- ✅ `.env` file is not publicly accessible

### **📱 Post-Deployment**

#### **Create Admin Account**
1. Register a regular account
2. Access your database via phpMyAdmin
3. Find the `users` table
4. Change the user's `role` to `admin` or `super_admin`

#### **Configure Email**
1. Set up SMTP in `.env`
2. Test password reset functionality
3. Configure email notifications

#### **Backup Strategy**
1. Set up regular database backups
2. Backup your `.env` file
3. Consider using cPanel's backup feature

### **🚀 Performance Optimization**

#### **Enable Caching**
```bash
# Via SSH
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### **Optimize Assets**
- Assets are already optimized in the build
- Consider using a CDN for static files
- Enable Gzip compression in cPanel

#### **Database Optimization**
- Regular database maintenance
- Monitor slow queries
- Use proper indexing

### **📋 Quick Deployment Checklist**

- [ ] Local build completed (`npm run build:deploy`)
- [ ] Environment file configured (`.env`)
- [ ] Files uploaded to cPanel
- [ ] Database created and configured
- [ ] File permissions set correctly
- [ ] Application key generated
- [ ] Storage link created
- [ ] `.htaccess` file configured for cPanel
- [ ] Caches cleared and optimized
- [ ] Application tested and working
- [ ] Admin account created
- [ ] Email configured
- [ ] Security settings verified

## 🛠️ **Technology Stack**

- **Backend:** Laravel 12, PHP 8.2+, MySQL 8.0
- **Frontend:** React 19, TypeScript 5.7, Tailwind CSS 4.0
- **Build Tool:** Vite 7
- **Real-time:** Laravel Reverb WebSockets
- **UI Components:** Shadcn/ui

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your hosting meets the requirements
3. Contact your hosting provider for server-specific issues
4. Check the Laravel and React documentation

---

**Happy financial management! 💰**