# 🔧 419 CSRF Token Error Fix Guide

## 🚨 **Issue: 419 CSRF Token Mismatch Error**

This error occurs when Laravel's CSRF protection fails to validate the token.

## 🔍 **Common Causes:**

1. **Session Configuration Issues**
2. **Cached Application Key**
3. **HTTPS/HTTP Protocol Mismatch**
4. **Browser Cache Issues**
5. **File Permissions Problems**

## 🛠️ **Complete Fix Steps:**

### **Step 1: Update .env File**

```env
# Application Configuration
APP_NAME="Cash Management System"
APP_ENV=production
APP_KEY=base64:YOUR_NEW_KEY_HERE
APP_DEBUG=false
APP_URL=https://accounts.mannnan.space

# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=1440
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=accounts.mannnan.space
SESSION_SECURE_COOKIE=false
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=none
```

### **Step 2: Clear All Caches**

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

### **Step 3: Regenerate Application Key**

```bash
php artisan key:generate
```

### **Step 4: Clear Session Data**

```bash
php artisan session:table
php artisan migrate --force
```

### **Step 5: Set File Permissions**

```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chmod -R 755 public/build/
chmod 644 .env
```

### **Step 6: Rebuild Caches**

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🌐 **Browser Fixes:**

1. **Clear Browser Cache and Cookies**
2. **Try Incognito/Private Mode**
3. **Disable Browser Extensions**
4. **Check HTTPS Certificate**

## 🔧 **Alternative Session Configurations:**

### **Option 1: File-based Sessions**
```env
SESSION_DRIVER=file
SESSION_LIFETIME=1440
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=accounts.mannnan.space
SESSION_SECURE_COOKIE=false
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=none
```

### **Option 2: Cookie-based Sessions**
```env
SESSION_DRIVER=cookie
SESSION_LIFETIME=1440
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=accounts.mannnan.space
SESSION_SECURE_COOKIE=false
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=none
```

## 🚨 **Emergency Fix:**

If nothing works, try this emergency configuration:

```env
# Disable CSRF temporarily (NOT RECOMMENDED FOR PRODUCTION)
CSRF_PROTECTION=false

# Or use cookie sessions
SESSION_DRIVER=cookie
SESSION_DOMAIN=accounts.mannnan.space
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=none
```

## 📋 **Checklist:**

- [ ] Updated .env with correct session settings
- [ ] Cleared all Laravel caches
- [ ] Regenerated application key
- [ ] Set proper file permissions
- [ ] Cleared browser cache
- [ ] Tested in incognito mode
- [ ] Verified HTTPS certificate
- [ ] Checked hosting provider settings

## 🆘 **Still Having Issues?**

1. **Contact your hosting provider** - Some shared hosting has restrictions
2. **Check error logs** - Look in `storage/logs/laravel.log`
3. **Try different session drivers** - File, cookie, or database
4. **Verify domain configuration** - Ensure subdomain is properly set up

## 📞 **Support:**

If you're still experiencing issues, check:
- Laravel logs: `storage/logs/laravel.log`
- Server error logs (cPanel error logs)
- Browser developer tools console
