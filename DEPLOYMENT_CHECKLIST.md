# Production Deployment Checklist

## Fix 500 Internal Server Error

### 1. Frontend Build (Already Fixed)
- ✅ Run `npm run build` to create production assets
- ✅ Verify `public/build/` directory exists
- ✅ Verify `public/build/.vite/manifest.json` exists

### 2. Laravel Configuration
- [ ] Clear all caches:
  ```bash
  php artisan config:clear
  php artisan route:clear
  php artisan view:clear
  php artisan cache:clear
  ```

- [ ] Regenerate caches:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```

### 3. File Permissions
- [ ] Set proper permissions on production server:
  ```bash
  chmod -R 755 storage/
  chmod -R 755 bootstrap/cache/
  chmod -R 755 public/build/
  ```

### 4. Environment Configuration
- [ ] Verify `.env` file exists on production
- [ ] Check database connection settings in `.env`
- [ ] Ensure `APP_ENV=production`
- [ ] Ensure `APP_DEBUG=false`

### 5. Database
- [ ] Run migrations on production:
  ```bash
  php artisan migrate
  ```
- [ ] Verify database connection works
- [ ] Check if all tables exist

### 6. Dependencies
- [ ] Install/update Composer dependencies:
  ```bash
  composer install --optimize-autoloader --no-dev
  ```

### 7. Diagnostic Steps
- [ ] Run diagnostic script: `https://yourdomain.com/diagnostic.php`
- [ ] Check Laravel logs: `storage/logs/laravel.log`
- [ ] Check web server error logs (Apache/Nginx)

### 8. Common Issues & Solutions

#### Issue: "Production build not found"
**Solution:** Run `npm run build` and upload the `public/build/` directory

#### Issue: Database connection failed
**Solution:** Check `.env` file database settings and ensure database server is accessible

#### Issue: File permissions
**Solution:** Set proper permissions on storage and cache directories

#### Issue: Missing vendor dependencies
**Solution:** Run `composer install --optimize-autoloader --no-dev`

#### Issue: Cache issues
**Solution:** Clear all Laravel caches and regenerate them

### 9. Testing Steps
- [ ] Test database connection
- [ ] Test User model
- [ ] Test UserManagementController
- [ ] Test admin routes
- [ ] Test frontend assets loading

### 10. Security
- [ ] Remove diagnostic.php after troubleshooting
- [ ] Ensure `.env` file is not publicly accessible
- [ ] Set proper file permissions
- [ ] Enable HTTPS if not already enabled

## Quick Fix Commands

If you have SSH access to your production server, run these commands:

```bash
# Navigate to your Laravel project directory
cd /path/to/your/laravel/project

# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Regenerate caches
php artisan config:cache
php artisan route:cache

# Set permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/

# Install dependencies (if needed)
composer install --optimize-autoloader --no-dev

# Run migrations (if needed)
php artisan migrate
```

## If Still Getting 500 Error

1. Check web server error logs
2. Enable debug mode temporarily: `APP_DEBUG=true` in `.env`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Run the diagnostic script: `https://yourdomain.com/diagnostic.php`
5. Contact your hosting provider if the issue persists
