# 🚀 Cash Management - Production Deployment Guide

Complete guide for deploying Cash Management application to production servers (shared hosting, VPS, cloud platforms).

## 📋 **Prerequisites**

- PHP 8.2 or higher
- MySQL 5.7 or higher
- Composer 2.0+
- Node.js 18+ and npm (for building assets)
- Web server (Apache/Nginx) with mod_rewrite enabled

## 🏗️ **Production Architecture**

```
Production Server Structure:
├── /home/username/domain.com/          # Web root (subdomain/domain)
│   ├── build/                          # Production assets (CSS, JS)
│   ├── storage/                        # Laravel storage (logs, cache)
│   ├── vendor/                         # PHP dependencies
│   ├── app/, config/, routes/          # Laravel core files
│   ├── .env                           # Production environment
│   ├── .htaccess                      # Web server config
│   └── index.php                      # Entry point
```

## 🔧 **Step 1: Prepare Local Environment**

### **Build Production Assets**
```bash
# Clone and setup project locally first
git clone <repository-url>
cd CashManagement

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install

# Build production assets
npm run build

# Create deployment package
zip -r production-deploy.zip . -x "node_modules/*" ".git/*" "tests/*" "*.md" ".env*"
```

## 🌐 **Step 2: Server Setup**

### **For Shared Hosting (cPanel)**

1. **Upload Files**
   ```bash
   # Upload production-deploy.zip to your domain/subdomain directory
   # Extract all files to: /home/username/domain.com/
   ```

2. **Directory Structure**
   ```
   /home/username/domain.com/
   ├── build/assets/           # Your compiled CSS/JS
   ├── index.php              # Laravel entry point
   ├── .htaccess              # Apache configuration
   └── [all Laravel files]
   ```

### **For VPS/Dedicated Servers**

1. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/yourdomain.com;
       index index.php;

       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }

       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
           fastcgi_index index.php;
           fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
           include fastcgi_params;
       }

       location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

2. **Apache Configuration (.htaccess)**
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteRule ^ index.php [L]
   </IfModule>

   <IfModule mod_headers.c>
       Header always set X-Content-Type-Options nosniff
       Header always set X-Frame-Options SAMEORIGIN
       Header always set X-XSS-Protection "1; mode=block"
   </IfModule>
   ```

## ⚙️ **Step 3: Environment Configuration**

### **Create Production .env**

```env
# Application
APP_NAME="Cash Management"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_secure_password

# Laravel Reverb (WebSockets)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=123456
REVERB_APP_KEY=your-reverb-key
REVERB_APP_SECRET=your-reverb-secret
REVERB_HOST="yourdomain.com"
REVERB_PORT=443
REVERB_SCHEME=https

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls

# Security
LOG_LEVEL=error
LOG_CHANNEL=single

# Frontend Assets
VITE_APP_NAME="${APP_NAME}"
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

## 🚀 **Step 4: Deploy Application**

### **On Your Server**

```bash
# Navigate to your domain directory
cd /home/username/domain.com

# Set proper permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chmod 644 .env

# Generate application key
php artisan key:generate --force

# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Run database migrations
php artisan migrate --force

# Create storage symlink
php artisan storage:link

# Cache for production performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Verify deployment
php artisan about
```

## 🔍 **Step 5: Verification**

### **Check Application Status**
```bash
# Verify environment
php artisan about

# Should show:
# Environment: production
# Debug Mode: OFF
# Broadcasting: reverb
```

### **Test Website**
1. Visit your domain: `https://yourdomain.com`
2. Check browser console - no CORS errors
3. Verify assets load from your domain (not 127.0.0.1:5173)
4. Test user registration and login
5. Verify WebSocket notifications work

## 🔧 **Step 6: Fix app.blade.php for Production**

**Critical Fix** - Update `resources/views/app.blade.php`:

```php
@routes

@if(config('app.env') === 'local' || config('app.debug'))
    {{-- Development mode: Use Vite dev server --}}
    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
@else
    {{-- Production mode: Use build assets --}}
    @if(file_exists(public_path('build/.vite/manifest.json')))
        @php
            $manifest = json_decode(file_get_contents(public_path('build/.vite/manifest.json')), true);
            $appJs = $manifest['resources/js/app.tsx']['file'] ?? 'assets/app.js';
            $appCss = $manifest['resources/js/app.tsx']['css'][0] ?? 'assets/app.css';
        @endphp
        <link rel="stylesheet" href="{{ asset('build/' . $appCss) }}">
        <script type="module" src="{{ asset('build/' . $appJs) }}"></script>
    @else
        {{-- Fallback if manifest missing --}}
        <link rel="stylesheet" href="{{ asset('build/assets/app.css') }}">
        <script type="module" src="{{ asset('build/assets/app.js') }}"></script>
    @endif
@endif
```

## 🛠️ **Troubleshooting**

### **CORS Errors (127.0.0.1:5173)**
- Ensure `APP_ENV=production` in .env
- Clear all caches: `php artisan optimize:clear`
- Fix app.blade.php as shown above
- Verify build files exist in `build/assets/`

### **500 Internal Server Error**
- Check `storage/logs/laravel.log`
- Verify file permissions: `chmod -R 755 storage/`
- Ensure database credentials are correct
- Run `php artisan config:clear`

### **Assets Not Loading**
- Verify `build/` directory exists with assets
- Check `.htaccess` file is present
- Ensure `APP_URL` matches your domain
- Run `npm run build` locally and re-upload

### **Database Connection Issues**
- Verify database exists and credentials are correct
- Check if database server is accessible
- Ensure database user has proper permissions
- Test connection: `php artisan migrate:status`

## 🔐 **Security Checklist**

- [ ] `APP_DEBUG=false` in production
- [ ] Strong `APP_KEY` generated
- [ ] Database credentials secured
- [ ] File permissions properly set (755 for directories, 644 for files)
- [ ] `.env` file not publicly accessible
- [ ] SSL certificate installed
- [ ] Regular backups configured
- [ ] Error logging enabled (`LOG_LEVEL=error`)

## 📊 **Performance Optimization**

### **Caching**
```bash
# Enable all production caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### **Database**
- Use database indexes on frequently queried columns
- Enable MySQL query cache
- Consider Redis for session/cache storage (VPS/Cloud)

### **Web Server**
- Enable Gzip compression
- Set proper cache headers for static assets
- Use CDN for global distribution (optional)

## 🔄 **Updates & Maintenance**

### **Deploying Updates**
```bash
# 1. Build assets locally
npm run build

# 2. Upload changed files
# 3. On server:
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **Backup Strategy**
- Database: Daily automated backups
- Files: Weekly full backup
- Code: Version control (Git)
- Test restore procedures regularly

---

## 🎯 **Quick Deployment Checklist**

- [ ] Upload all files to server
- [ ] Set file permissions (755/644)
- [ ] Create production .env file
- [ ] Generate application key
- [ ] Run migrations
- [ ] Clear and cache configs
- [ ] Test website functionality
- [ ] Verify no CORS errors
- [ ] Check SSL certificate
- [ ] Configure backups

**Your Cash Management application is now ready for production! 🚀**
