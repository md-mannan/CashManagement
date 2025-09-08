# 🚀 cPanel Production Deployment Guide
## Cash Management System

This guide will walk you through deploying your Laravel Cash Management System to cPanel shared hosting for production.

---

## 📋 **Pre-Deployment Requirements**

### **Local Environment**
- ✅ PHP 8.2+ installed
- ✅ Node.js 16+ installed  
- ✅ Composer installed
- ✅ Git repository cloned
- ✅ Application working locally

### **cPanel Hosting Requirements**
- ✅ PHP 8.2+ available
- ✅ MySQL 8.0+ available
- ✅ Composer support (via SSH or cPanel)
- ✅ Node.js support (for building assets)
- ✅ SSL certificate configured
- ✅ Domain/subdomain pointing to hosting

---

## 🛠️ **Step 1: Prepare Production Build**

### **Option A: Using the Build Script (Recommended)**

```bash
# Windows
deploy-cpanel.bat

# Linux/Mac
./deploy-cpanel.sh
```

### **Option B: Manual Build Process**

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
npm install

# Build production assets
npm run build

# Move build files to correct location
# (The build script handles this automatically)
```

---

## 🔧 **Step 2: Configure Environment Variables**

Create your production `.env` file based on `env-cpanel.example`:

```env
# Application Configuration
APP_NAME="Cash Management System"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
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
SESSION_DOMAIN=yourdomain.com
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Cache Configuration (use file cache for shared hosting)
CACHE_STORE=file
CACHE_PREFIX=cashmanagement_prod

# Queue Configuration (use database for shared hosting)
QUEUE_CONNECTION=database
QUEUE_FAILED_DRIVER=database-uuids

# Filesystem Configuration
FILESYSTEM_DISK=public
```

---

## 📁 **Step 3: Upload Files to cPanel**

### **Method 1: cPanel File Manager (Easiest)**

1. **Log into cPanel**
2. **Open File Manager**
3. **Navigate to `public_html`** (or your domain directory)
4. **Upload all project files** (except `node_modules` and `.git`)
5. **Important:** Ensure the `public` folder contents are in the root of your domain

### **Method 2: FTP/SFTP Client**

1. **Use FileZilla, WinSCP, or similar**
2. **Connect to your hosting server**
3. **Upload all project files** to your domain directory
4. **Ensure `public` folder contents are in the root**

### **Method 3: Git Deployment (if SSH available)**

```bash
# SSH into your hosting
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

---

## 🗄️ **Step 4: Set Up Database**

### **Create Database in cPanel:**

1. **Go to MySQL Databases** in cPanel
2. **Create a new database** (e.g., `yourdomain_cashmanagement`)
3. **Create a database user** (e.g., `yourdomain_cashuser`)
4. **Assign the user to the database** with **ALL PRIVILEGES**
5. **Note down the credentials** for your `.env` file

### **Run Database Migrations:**

```bash
# Via SSH (if available)
php artisan migrate --force
php artisan db:seed --force

# OR via browser (create a temporary route)
# Add this to routes/web.php temporarily:
Route::get('/migrate', function() {
    Artisan::call('migrate', ['--force' => true]);
    Artisan::call('db:seed', ['--force' => true]);
    return 'Database migrated successfully!';
});
# Then visit: https://yourdomain.com/migrate
# Remove this route after migration!
```

---

## 🔐 **Step 5: Configure File Permissions**

Set the following permissions via cPanel File Manager:

**Required Permissions:**
- `storage/` → **755** (or **775**)
- `bootstrap/cache/` → **755** (or **775**)
- `public/build/` → **755**
- `.env` → **644**
- `.htaccess` → **644**

---

## 🔑 **Step 6: Generate Application Key**

```bash
# Via SSH
php artisan key:generate

# OR manually generate and add to .env
# Use: php artisan key:generate --show
# Then add the output to your .env file
```

---

## 🔗 **Step 7: Create Storage Link**

```bash
# Via SSH
php artisan storage:link

# OR manually create symlink in public_html (if artisan fails)
# In cPanel File Manager, create a symbolic link from:
# public_html/storage → ../storage/app/public
```

---

## ⚙️ **Step 8: Optimize for Production**

```bash
# Via SSH
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear any existing caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## 🧪 **Step 9: Test Your Installation**

1. **Visit your domain:** `https://yourdomain.com`
2. **You should see the welcome page**
3. **Try registering a new account**
4. **Test the login functionality**
5. **Check if assets are loading properly**

---

## 👤 **Step 10: Create Admin Account**

### **Method 1: Database Update**
1. **Register a regular account** through the website
2. **Access your database** via phpMyAdmin in cPanel
3. **Find the `users` table**
4. **Change the user's `role`** to `admin` or `super_admin`

### **Method 2: Seeder (if available)**
```bash
# Via SSH
php artisan db:seed --class=AdminSeeder
```

---

## 📧 **Step 11: Configure Email**

1. **Set up SMTP** in your `.env` file using your hosting provider's settings
2. **Test password reset** functionality
3. **Configure email notifications**

---

## 🔒 **Step 12: Security Configuration**

### **Enable HTTPS (if not already enabled)**
Uncomment these lines in your `.htaccess` file:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### **Final Security Checklist:**
- ✅ `APP_DEBUG=false` in production
- ✅ `APP_ENV=production`
- ✅ Database credentials are secure
- ✅ File permissions are properly set
- ✅ HTTPS is enabled
- ✅ `.env` file is not publicly accessible
- ✅ SSL certificate is properly configured

---

## 🛠️ **Troubleshooting Common Issues**

### **White Screen or 500 Error**
```bash
# Check .env file exists and is readable
# Verify database credentials
# Check PHP version (must be 8.2+)
# Enable error reporting temporarily:
APP_DEBUG=true
```

### **Assets Not Loading**
```bash
# Ensure public/build/ folder exists
# Check file permissions on public/build/
# Verify .htaccess file is present in root
# Clear browser cache
```

### **Database Connection Error**
```bash
# Verify database credentials in .env
# Check if database exists in cPanel
# Ensure database user has proper privileges
# Try connecting via phpMyAdmin
```

### **419 CSRF Token Mismatch Error**
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Regenerate application key
php artisan key:generate

# Check session configuration in .env
SESSION_DOMAIN=yourdomain.com
SESSION_SECURE_COOKIE=true
```

### **Build Error - "Production build not found"**
```bash
# Check if build files are in the correct location
ls -la public/build/

# If no build files exist, rebuild
npm install
npm run build

# Ensure public/build/.vite/manifest.json exists
```

---

## 📱 **Mobile Optimization Verification**

After deployment, test:
- ✅ **Responsive Design**: All breakpoints working
- ✅ **Touch Interactions**: 44px minimum touch targets
- ✅ **Performance**: Load time < 3s
- ✅ **Mobile Navigation**: Sidebar and menu working
- ✅ **Table Responsiveness**: Auto-switch to cards on mobile
- ✅ **Form Usability**: No zoom on input focus

---

## 🎯 **Performance Optimization**

### **Enable Caching**
```bash
# Via SSH
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **Optimize Assets**
- Assets are already optimized in the build
- Consider using a CDN for static files
- Enable Gzip compression in cPanel

---

## 📋 **Final Deployment Checklist**

- [ ] **Local build completed** (`npm run build`)
- [ ] **Environment file configured** (`.env`)
- [ ] **Files uploaded to cPanel**
- [ ] **Database created and configured**
- [ ] **File permissions set correctly**
- [ ] **Application key generated**
- [ ] **Storage link created**
- [ ] **`.htaccess` file configured for cPanel**
- [ ] **Caches cleared and optimized**
- [ ] **Application tested and working**
- [ ] **Admin account created**
- [ ] **Email configured**
- [ ] **Security settings verified**
- [ ] **Mobile responsiveness tested**
- [ ] **Performance optimized**
- [ ] **Backup strategy implemented**

---

## 🆘 **Support**

If you encounter issues:
1. **Check the troubleshooting section** above
2. **Verify your hosting meets the requirements**
3. **Contact your hosting provider** for server-specific issues
4. **Check the Laravel and React documentation**
5. **Review the main README.md** for additional guidance

---

**🎉 Your Cash Management System is now ready for production! 🚀**
