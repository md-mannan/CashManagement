# Fix CORS Issues for cPanel Deployment

## Problem Description

You're encountering CORS errors because the application is trying to load resources from the development server (`http://[::1]:5173`) instead of your cPanel domain. This happens when:

1. Development configuration is still active
2. Frontend assets aren't properly built for production
3. Vite configuration isn't set for production mode

## 🚀 Quick Fix (5 minutes)

### Step 1: Build Production Assets
```bash
# In your cPanel terminal, navigate to your app directory
cd public_html/cash-management

# Install production dependencies
npm install --production

# Build for production
npm run build
```

### Step 2: Clear Application Caches
```bash
# Clear all Laravel caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Rebuild caches for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 3: Verify .env Configuration
Make sure your `.env` file has:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com/cash-management
ASSET_URL=https://yourdomain.com/cash-management
```

## 🔧 Detailed Solution

### 1. Check Vite Configuration

Your `vite.config.js` should have production settings:

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
    build: {
        outDir: 'public/build',
        assetsDir: 'assets',
        manifest: true,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
    server: {
        hmr: {
            host: 'localhost',
        },
    },
});
```

### 2. Update Laravel Configuration

Check `config/app.php`:
```php
'env' => env('APP_ENV', 'production'),
'debug' => env('APP_DEBUG', false),
'url' => env('APP_URL', 'https://yourdomain.com'),
'asset_url' => env('ASSET_URL', 'https://yourdomain.com'),
```

### 3. Verify Asset Loading

In your main layout file (`resources/views/app.blade.php` or similar), ensure assets are loaded correctly:

```php
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Cash Management') }}</title>
    
    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

## 🛠️ Manual Asset Fix

If the above doesn't work, manually copy built assets:

### Step 1: Build Locally
```bash
# On your local machine
npm run build
```

### Step 2: Upload Assets
Upload the `public/build` folder to your cPanel `public_html/cash-management/public/build` directory.

### Step 3: Update .htaccess
Ensure your `.htaccess` in the public directory handles assets correctly:

```apache
<IfModule mod_rewrite.c>
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

# Asset Caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
</IfModule>
```

## 🔍 Troubleshooting Steps

### 1. Check Browser Console
Look for specific error messages in the browser's developer console.

### 2. Verify File Paths
Ensure the `public/build` directory exists and contains:
- `manifest.json`
- `assets/` folder with CSS and JS files

### 3. Check Network Tab
In browser dev tools, check the Network tab to see which URLs are failing.

### 4. Verify Domain Configuration
Make sure your cPanel domain points to the correct directory.

## 🚨 Common Issues & Solutions

### Issue: Assets still loading from localhost
**Solution**: Clear browser cache and rebuild assets

### Issue: 404 errors for assets
**Solution**: Check file permissions and .htaccess configuration

### Issue: Mixed content (HTTP/HTTPS)
**Solution**: Ensure all URLs use HTTPS in production

### Issue: Vite dev server still running
**Solution**: Stop any running Vite processes and use production build

## 📋 Complete Production Checklist

- [ ] `npm run build` completed successfully
- [ ] `public/build` directory exists with assets
- [ ] `.env` has `APP_ENV=production`
- [ ] `.env` has correct `APP_URL`
- [ ] Laravel caches cleared and rebuilt
- [ ] Browser cache cleared
- [ ] Assets accessible via direct URL
- [ ] No localhost references in HTML source

## 🔄 Alternative: Disable Vite for Production

If you continue having issues, you can temporarily disable Vite and use traditional asset loading:

### 1. Comment out Vite in your layout
```php
<!-- @viteReactRefresh -->
<!-- @vite(['resources/js/app.tsx']) -->
```

### 2. Manually include built assets
```php
<link rel="stylesheet" href="{{ asset('build/assets/app-[hash].css') }}">
<script src="{{ asset('build/assets/app-[hash].js') }}"></script>
```

## 📞 Support

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Verify your cPanel file structure
3. Ensure all dependencies are installed
4. Check Laravel logs: `storage/logs/laravel.log`

---

**Environment**: cPanel Shared Hosting  
**Issue**: CORS/Asset Loading Errors  
**Solution**: Production Build + Cache Clearing
