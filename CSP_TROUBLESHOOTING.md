# 🛡️ Content Security Policy (CSP) Troubleshooting Guide

## Common CSP Issues and Solutions

This guide helps resolve Content Security Policy issues, especially with Vite development server and production deployments.

---

## 🚨 **Common CSP Error Messages**

### **Vite Development Server Blocked**
```
Content-Security-Policy: The page's settings blocked a script (script-src-elem) 
at http://127.0.0.1:5173/@vite/client from being executed because it violates 
the following directive: "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```

### **Production Assets Blocked**
```
Content-Security-Policy: The page's settings blocked a script (script-src-elem) 
at https://yourdomain.com/build/assets/app.js from being executed
```

---

## 🔧 **Solutions**

### **1. For Local Development**

#### **Use Local Development .htaccess**
```bash
# Copy the development-specific .htaccess
cp public/.htaccess.local public/.htaccess
```

#### **Development CSP Policy** (in `.htaccess.local`):
```apache
Header always set Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 http://127.0.0.1:5173 ws://localhost:5173 ws://127.0.0.1:5173; connect-src 'self' ws: wss: http: https: http://localhost:5173 http://127.0.0.1:5173 ws://localhost:5173 ws://127.0.0.1:5173; style-src 'self' 'unsafe-inline' http://localhost:5173 http://127.0.0.1:5173;"
```

### **2. For Production Deployment**

#### **Use Production .htaccess**
```bash
# Copy the production-specific .htaccess
cp public/.htaccess.production public/.htaccess
```

#### **Production CSP Policy** (in `.htaccess.production`):
```apache
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-vite'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss: https:; worker-src 'self' blob:;"
```

### **3. For cPanel/Shared Hosting**

#### **Use cPanel .htaccess**
```bash
# Copy the cPanel-specific .htaccess
cp public/.htaccess.cpanel public/.htaccess
```

---

## ⚙️ **Environment-Aware CSP (Automatic)**

The application now includes environment-aware CSP in the Blade template:

### **Development Environment** (`APP_ENV=local`)
- **More permissive** CSP allowing Vite dev server
- **Allows** `localhost:5173` and `127.0.0.1:5173`
- **Enables** WebSocket connections for hot reload

### **Production Environment** (`APP_ENV=production`)
- **Secure** CSP with minimal required permissions
- **Blocks** external scripts except built assets
- **Allows** Google Fonts and necessary resources

---

## 🔍 **Debugging CSP Issues**

### **Check Current CSP Policy**
```bash
# Check response headers
curl -I https://yourdomain.com

# Look for Content-Security-Policy header
```

### **Browser Developer Tools**
1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Look for CSP violation errors**
4. **Check Network tab** for blocked resources

### **Test CSP Policy**
Use online CSP evaluators:
- https://csp-evaluator.withgoogle.com/
- https://cspvalidator.org/

---

## 🛠️ **Manual CSP Configuration**

### **Disable CSP Temporarily** (for testing)
```apache
# In .htaccess - ONLY FOR TESTING
# Header unset Content-Security-Policy
```

### **Custom CSP Policy**
```apache
# Add your custom sources
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://trusted-domain.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
```

---

## 📋 **Environment-Specific Setup**

### **Local Development Setup**
```bash
# 1. Use local environment
cp env-local.example .env
APP_ENV=local

# 2. Use development .htaccess
cp public/.htaccess.local public/.htaccess

# 3. Start development servers
php artisan serve
npm run dev
```

### **Production Setup**
```bash
# 1. Use production environment
cp env-production.example .env
APP_ENV=production

# 2. Use production .htaccess
cp public/.htaccess.production public/.htaccess

# 3. Build assets
npm run build
```

### **cPanel Setup**
```bash
# 1. Use cPanel environment
cp env-cpanel.example .env
APP_ENV=production

# 2. Use cPanel .htaccess
cp public/.htaccess.cpanel public/.htaccess

# 3. Build assets
npm run build
```

---

## 🚨 **Emergency CSP Bypass**

If CSP is completely blocking your application:

### **Method 1: Remove CSP Header**
```apache
# In .htaccess - TEMPORARY ONLY
Header unset Content-Security-Policy
```

### **Method 2: Most Permissive CSP**
```apache
# VERY INSECURE - ONLY FOR EMERGENCY TESTING
Header always set Content-Security-Policy "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';"
```

⚠️ **WARNING**: Never use permissive CSP in production!

---

## ✅ **Testing Your CSP Fix**

### **Development Testing**
1. **Start servers**: `php artisan serve` and `npm run dev`
2. **Check console** for CSP errors
3. **Verify hot reload** works
4. **Test all pages** and functionality

### **Production Testing**
1. **Build assets**: `npm run build`
2. **Test with production server**
3. **Check all external resources** load
4. **Verify no console errors**

---

## 📞 **Getting Help**

### **Check These First**
- [ ] Correct `.htaccess` file for your environment
- [ ] `APP_ENV` matches your deployment type
- [ ] Assets are built (`npm run build` for production)
- [ ] Browser cache cleared
- [ ] No browser extensions blocking scripts

### **Common Solutions**
- **Development**: Use `.htaccess.local`
- **Production**: Use `.htaccess.production`
- **cPanel**: Use `.htaccess.cpanel`
- **Clear cache**: Browser and server cache
- **Check environment**: `APP_ENV` in `.env` file

---

## 🎯 **Quick Fix Commands**

```bash
# For development CSP issues
cp public/.htaccess.local public/.htaccess
php artisan config:clear
npm run dev

# For production CSP issues
cp public/.htaccess.production public/.htaccess
npm run build
php artisan config:cache

# For cPanel CSP issues
cp public/.htaccess.cpanel public/.htaccess
npm run build
```

**Your CSP issues should now be resolved!** 🎉
