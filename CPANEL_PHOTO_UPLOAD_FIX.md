# 🔧 cPanel Photo Upload Fix Guide

## 🚨 **Problem Analysis**

The issue you're experiencing is common on cPanel hosting and involves several factors:

1. **Storage Link Not Created**: The symbolic link from `public/storage` to `storage/app/public` is missing
2. **File Permissions**: Incorrect permissions on storage directories
3. **File Access**: Files are uploaded but not accessible via web
4. **MIME Type Issues**: Server not serving files with correct content type

## 🔍 **Diagnostic Steps**

### **Step 1: Check Storage Link**
Via SSH or cPanel Terminal:
```bash
ls -la public/storage
```

**Expected Output:**
```
lrwxrwxrwx 1 username username 20 Jan 1 12:00 public/storage -> ../storage/app/public
```

**If missing or broken:**
```bash
php artisan storage:link
```

### **Step 2: Check File Permissions**
```bash
ls -la storage/
ls -la storage/app/
ls -la storage/app/public/
ls -la public/storage/
```

**Correct Permissions:**
- Directories: `755` (drwxr-xr-x)
- Files: `644` (-rw-r--r--)

### **Step 3: Check File Existence**
```bash
ls -la storage/app/public/profile-photos/
```

## 🛠️ **Complete Fix Solution**

### **Method 1: SSH/Terminal Access (Recommended)**

#### **Step 1: Create Storage Link**
```bash
# Remove existing broken link if any
rm -f public/storage

# Create new storage link
php artisan storage:link

# Verify the link
ls -la public/storage
```

#### **Step 2: Fix Permissions**
```bash
# Set directory permissions
find storage -type d -exec chmod 755 {} \;
find public/storage -type d -exec chmod 755 {} \;

# Set file permissions
find storage -type f -exec chmod 644 {} \;
find public/storage -type f -exec chmod 644 {} \;

# Set ownership (if needed)
chown -R username:username storage/
chown -R username:username public/storage/
```

#### **Step 3: Clear Caches**
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **Method 2: cPanel File Manager (No SSH)**

#### **Step 1: Create Storage Link Manually**
1. Go to **cPanel File Manager**
2. Navigate to your domain's `public` folder
3. **Delete** the existing `storage` folder/link if it exists
4. **Create** a new folder called `storage`
5. **Upload** all contents from `storage/app/public/` to `public/storage/`

#### **Step 2: Set Permissions via File Manager**
1. Right-click on `storage` folder → **Change Permissions**
2. Set to **755** for directories
3. Set to **644** for files
4. Apply recursively

### **Method 3: Browser-based Fix**

#### **Step 1: Create Temporary Route**
Add this to your `routes/web.php`:
```php
Route::get('/fix-storage', function () {
    try {
        // Remove existing link
        if (is_link(public_path('storage'))) {
            unlink(public_path('storage'));
        }
        
        // Create storage link
        Artisan::call('storage:link');
        
        // Set permissions
        $storagePath = storage_path('app/public');
        $publicStoragePath = public_path('storage');
        
        // Set directory permissions
        system("find {$storagePath} -type d -exec chmod 755 {} \\;");
        system("find {$publicStoragePath} -type d -exec chmod 755 {} \\;");
        
        // Set file permissions
        system("find {$storagePath} -type f -exec chmod 644 {} \\;");
        system("find {$publicStoragePath} -type f -exec chmod 644 {} \\;");
        
        return 'Storage fixed successfully!';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});
```

#### **Step 2: Run the Fix**
1. Visit: `https://yourdomain.com/fix-storage`
2. Remove the route after successful execution

## 🔧 **Advanced Troubleshooting**

### **Issue 1: Files Upload but Not Accessible**

#### **Check .htaccess Configuration**
Ensure your `public/.htaccess` includes:
```apache
# Allow access to storage files
<Directory "storage">
    Require all granted
</Directory>

# Handle image files
<FilesMatch "\.(jpg|jpeg|png|gif|webp)$">
    Header set Content-Type "image/$1"
</FilesMatch>
```

#### **Check File URLs**
Test direct file access:
```
https://yourdomain.com/storage/profile-photos/filename.jpg
```

### **Issue 2: "Unsupported File" Error**

#### **Check MIME Types**
Add to your `public/.htaccess`:
```apache
# MIME Types for Images
AddType image/jpeg .jpg .jpeg
AddType image/png .png
AddType image/gif .gif
AddType image/webp .webp
```

#### **Check File Extension**
Ensure uploaded files have correct extensions:
```php
// In ProfileController.php
$extension = $file->getClientOriginalExtension();
if (!in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif'])) {
    return back()->withErrors(['profile_photo' => 'Invalid file type']);
}
```

### **Issue 3: Permission Denied**

#### **Check Server Configuration**
Create a test file to check permissions:
```php
Route::get('/test-permissions', function () {
    $storagePath = storage_path('app/public');
    $publicStoragePath = public_path('storage');
    
    return [
        'storage_exists' => file_exists($storagePath),
        'storage_readable' => is_readable($storagePath),
        'storage_writable' => is_writable($storagePath),
        'public_storage_exists' => file_exists($publicStoragePath),
        'public_storage_readable' => is_readable($publicStoragePath),
        'php_user' => get_current_user(),
        'storage_perms' => substr(sprintf('%o', fileperms($storagePath)), -4),
        'public_storage_perms' => substr(sprintf('%o', fileperms($publicStoragePath)), -4),
    ];
});
```

## 📱 **Frontend Fixes**

### **Update Profile Component**
Modify your profile component to handle missing images:

```typescript
// In profile.tsx
const getImageUrl = (url: string | null) => {
    if (!url) return null;
    
    // Add fallback for broken images
    return url + '?v=' + Date.now(); // Cache buster
};

// Use in image component
<img 
    src={getImageUrl(photo.url)} 
    onError={(e) => {
        e.currentTarget.src = '/default-avatar.png'; // Fallback image
    }}
    alt="Profile Photo"
/>
```

### **Add Error Handling**
```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            addToast({
                type: 'error',
                title: 'Invalid File Type',
                message: 'Please select a valid image file (JPG, PNG, GIF)',
            });
            return;
        }
        
        // Continue with upload...
    }
};
```

## 🔍 **Verification Steps**

### **Step 1: Test File Upload**
1. Upload a new profile photo
2. Check if it appears in the UI
3. Try downloading the file

### **Step 2: Check File URLs**
1. Inspect the image URL in browser dev tools
2. Try accessing the URL directly
3. Check if the file exists in the correct location

### **Step 3: Test Navigation Avatar**
1. Check if the avatar appears in the navigation
2. Verify the avatar URL is correct
3. Test on different pages

## 🚀 **Prevention Measures**

### **Add to Deployment Script**
Add these commands to your deployment script:

```bash
# Create storage link
php artisan storage:link

# Set permissions
find storage -type d -exec chmod 755 {} \;
find storage -type f -exec chmod 644 {} \;
find public/storage -type d -exec chmod 755 {} \;
find public/storage -type f -exec chmod 644 {} \;

# Clear caches
php artisan optimize:clear
```

### **Add to .htaccess**
Ensure your `.htaccess` includes proper image handling:

```apache
# Image handling
<FilesMatch "\.(jpg|jpeg|png|gif|webp)$">
    Header set Cache-Control "public, max-age=31536000"
    Header set Content-Type "image/$1"
</FilesMatch>

# Allow storage access
<Directory "storage">
    Require all granted
    Options -Indexes
</Directory>
```

## 📞 **Support Commands**

### **Debug Commands**
```bash
# Check storage status
php artisan storage:link --help

# Check file permissions
ls -la storage/app/public/

# Check symbolic links
ls -la public/storage

# Test file access
curl -I https://yourdomain.com/storage/profile-photos/test.jpg
```

### **Emergency Fix**
If nothing works, use this emergency route:
```php
Route::get('/emergency-fix', function () {
    // Copy files directly
    $source = storage_path('app/public');
    $destination = public_path('storage');
    
    if (!is_dir($destination)) {
        mkdir($destination, 0755, true);
    }
    
    // Copy all files
    system("cp -r {$source}/* {$destination}/");
    
    return 'Emergency fix applied!';
});
```

## ✅ **Success Indicators**

After applying the fix, you should see:
- ✅ Photos upload successfully
- ✅ Photos display in the UI
- ✅ Photos appear in navigation
- ✅ Photos can be downloaded
- ✅ No "unsupported file" errors
- ✅ Proper file URLs in browser dev tools

---

**This comprehensive guide should resolve your photo upload issues on cPanel hosting! 🎉**
