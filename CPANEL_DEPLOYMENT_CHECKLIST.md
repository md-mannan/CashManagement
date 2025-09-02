# cPanel Deployment Checklist for Cash Management System

## 📋 Pre-Deployment Checklist

### ✅ **Local Environment Preparation**
- [ ] **PHP 8.2+** installed and working
- [ ] **Node.js 16+** installed and working
- [ ] **Composer** installed and working
- [ ] **npm** installed and working
- [ ] **Git** repository cloned locally
- [ ] All local tests passing
- [ ] Application working locally

### ✅ **Build Preparation**
- [ ] Run deployment script: `./deploy-cpanel.sh` (Linux/Mac) or `deploy-cpanel.bat` (Windows)
- [ ] Production assets built successfully
- [ ] Build files located in `public/build/`
- [ ] Environment file created from `env-cpanel.example`
- [ ] Application key generated
- [ ] `.htaccess` configured for cPanel
- [ ] File permissions set correctly
- [ ] Storage link created
- [ ] Application optimized (caches cleared and rebuilt)

### ✅ **cPanel Hosting Requirements**
- [ ] **PHP 8.2 or higher** available
- [ ] **MySQL 8.0 or higher** available
- [ ] **Composer** support (via SSH or cPanel)
- [ ] **Node.js** support (for building assets)
- [ ] **Git** access (optional, for direct deployment)
- [ ] **SSL certificate** configured
- [ ] **Domain/subdomain** pointing to hosting

## 🚀 Deployment Steps

### **Step 1: Prepare Your Local Environment**

```bash
# Clone repository (if not already done)
git clone <your-repo-url>
cd CashManagement

# Run deployment script
./deploy-cpanel.sh
# OR on Windows: deploy-cpanel.bat
```

### **Step 2: Configure Environment Variables**

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

# Broadcasting Configuration (optional)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=yourdomain.com
REVERB_PORT=443
REVERB_SCHEME=https
```

### **Step 3: Upload Files to cPanel**

#### **Option A: Using cPanel File Manager**
1. Log into your cPanel
2. Open **File Manager**
3. Navigate to `public_html` (or your domain directory)
4. Upload all files from the project folder
5. **Important:** Ensure the `public` folder contents are in the root of your domain

#### **Option B: Using FTP/SFTP**
1. Use an FTP client (FileZilla, WinSCP, etc.)
2. Connect to your hosting server
3. Upload all project files to your domain directory
4. Ensure `public` folder contents are in the root

#### **Option C: Using Git (if available)**
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

### **Step 4: Set Up Database**

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

### **Step 5: Configure File Permissions**

Set the following permissions via cPanel File Manager:

**Required Permissions:**
- `storage/` → **755** (or **775**)
- `bootstrap/cache/` → **755** (or **775**)
- `public/build/` → **755**
- `.env` → **644**

### **Step 6: Generate Application Key**

```bash
# Via SSH
php artisan key:generate

# OR manually add to .env file
APP_KEY=base64:your-32-character-key-here
```

### **Step 7: Create Storage Link**

```bash
# Via SSH
php artisan storage:link

# OR manually create symlink in public_html (if artisan fails)
ln -s ../storage/app/public public/storage
```

### **Step 8: Configure .htaccess for cPanel**

Copy the cPanel-specific `.htaccess` file:
```bash
# Copy the cPanel .htaccess to the root
cp public/.htaccess.cpanel public/.htaccess
```

### **Step 9: Clear and Cache Configuration**

```bash
# Via SSH
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Also ensure APP_URL is correct
sed -n 's/^APP_URL=.*/APP_URL=https:\/\/yourdomain.com/p' .env >/dev/null || true
```

### **Step 10: Test Your Installation**

1. Visit your domain: `https://yourdomain.com`
2. You should see the welcome page
3. Try registering a new account
4. Test the login functionality

## 🔧 Post-Deployment Configuration

### **Create Admin Account**
1. Register a regular account
2. Access your database via phpMyAdmin
3. Find the `users` table
4. Change the user's `role` to `admin` or `super_admin`

### **Configure Email**
1. Set up SMTP in `.env`
2. Test password reset functionality
3. Configure email notifications

### **Backup Strategy**
1. Set up regular database backups
2. Backup your `.env` file
3. Consider using cPanel's backup feature

## 🛠️ Troubleshooting Common Issues

### **Issue: White Screen or 500 Error**
**Solution:**
1. Check `.env` file exists and is readable
2. Verify database credentials
3. Check PHP version (must be 8.2+)
4. Enable error reporting temporarily:
```env
APP_DEBUG=true
```

### **Issue: Assets Not Loading**
**Solution:**
1. Ensure `public/build/` folder exists
2. Check file permissions on `public/build/`
3. Verify `.htaccess` file is present in root
4. Clear browser cache

### **Issue: Database Connection Error**
**Solution:**
1. Verify database credentials in `.env`
2. Check if database exists in cPanel
3. Ensure database user has proper privileges
4. Try connecting via phpMyAdmin

### **Issue: Permission Denied Errors**
**Solution:**
1. Set proper permissions on `storage/` and `bootstrap/cache/`
2. Check if your hosting supports the required PHP functions
3. Contact hosting support if needed

### **Issue: Mail Not Working**
**Solution:**
1. Configure SMTP settings in `.env`
2. Use your hosting provider's SMTP settings
3. Test with a simple mail function first

### **Issue: 419 CSRF Token Mismatch Error**
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

### **Issue: Build Error - "Production build not found. Please run: npm run build"**
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

### **Issue: JavaScript Error - "can't access property 'innerHTML', document.body is null"**
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

### **Issue: Content Security Policy (CSP) Errors**
**Solution:**
1. The CSP policy has been updated to allow blob URLs for profile photos
2. If you still see CSP errors, check that the correct `.htaccess` file is being used
3. Ensure the cPanel `.htaccess` file is copied to the root:
   ```bash
   cp public/.htaccess.cpanel public/.htaccess
   ```

### **Issue: Profile Photos Not Loading (404 Errors)**
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

## 🔒 Security Checklist

After deployment, ensure:
- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production`
- [ ] Database credentials are secure
- [ ] File permissions are properly set
- [ ] HTTPS is enabled
- [ ] `.env` file is not publicly accessible
- [ ] SSL certificate is properly configured
- [ ] Regular backups are scheduled

## 📱 Mobile Optimization Verification

After deployment, test:
- [ ] **Responsive Design**: All breakpoints working
- [ ] **Touch Interactions**: 44px minimum touch targets
- [ ] **Performance**: FPS > 30, load time < 3s
- [ ] **Mobile Navigation**: Sidebar and menu working
- [ ] **Table Responsiveness**: Auto-switch to cards on mobile
- [ ] **Form Usability**: No zoom on input focus
- [ ] **Touch Feedback**: Proper visual feedback

## 🎯 Performance Optimization

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

### **Database Optimization**
- Regular database maintenance
- Monitor slow queries
- Use proper indexing

## 📋 Final Deployment Checklist

- [ ] **Local build completed** (`npm run build:deploy`)
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

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your hosting meets the requirements
3. Contact your hosting provider for server-specific issues
4. Check the Laravel and React documentation
5. Review the main README.md for additional guidance

---

**Your Cash Management System is now ready for production! 🚀**
