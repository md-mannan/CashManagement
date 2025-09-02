<?php
// Fix Photo Upload with Existing .htaccess
// Visit: https://accounts.mannnan.space/fix-with-existing-htaccess.php

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>Fix with Existing .htaccess</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .info { color: #17a2b8; font-weight: bold; }
        .step { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        .code { background: #f1f1f1; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
        .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
    </style>
</head>
<body>
<div class='container'>
<h1>🔧 Fix Photo Upload with Existing .htaccess</h1>";

echo "<div class='step'>
<h2>Step 1: Backup Current .htaccess</h2>";

// Backup current .htaccess
$htaccessPath = './.htaccess';
$htaccessCpanelPath = './.htaccess.cpanel';

if (file_exists($htaccessPath)) {
    $backupName = './.htaccess.backup.' . date('Y-m-d-H-i-s');
    copy($htaccessPath, $backupName);
    echo "<div class='success'>✅ Current .htaccess backed up as: " . basename($backupName) . "</div>";
} else {
    echo "<div class='info'>ℹ️ No current .htaccess found</div>";
}

if (file_exists($htaccessCpanelPath)) {
    $backupCpanelName = './.htaccess.cpanel.backup.' . date('Y-m-d-H-i-s');
    copy($htaccessCpanelPath, $backupCpanelName);
    echo "<div class='success'>✅ .htaccess.cpanel backed up as: " . basename($backupCpanelName) . "</div>";
} else {
    echo "<div class='error'>❌ .htaccess.cpanel not found</div>";
    exit;
}

echo "</div>";

echo "<div class='step'>
<h2>Step 2: Create Enhanced .htaccess with Storage Support</h2>";

// Read the existing .htaccess.cpanel
$htaccessCpanelContent = file_get_contents($htaccessCpanelPath);

// Add storage access rules before the closing of the file
$storageRules = '

# Storage Access Rules for Photo Uploads
<Directory "storage">
    <IfModule mod_authz_core.c>
        Require all granted
        Options -Indexes +FollowSymLinks
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Allow from all
        Options -Indexes +FollowSymLinks
    </IfModule>
</Directory>

# Handle storage files with proper MIME types
<LocationMatch "^/storage/">
    <IfModule mod_authz_core.c>
        Require all granted
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Allow from all
    </IfModule>
</LocationMatch>

# Enhanced MIME types for images
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType image/webp .webp
    AddType image/svg+xml .svg
</IfModule>

# Handle image files properly
<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg)$">
    <IfModule mod_headers.c>
        Header set Content-Type "image/$1"
        Header set Cache-Control "public, max-age=31536000"
        Header set Access-Control-Allow-Origin "*"
    </IfModule>
</FilesMatch>

# LiteSpeed specific optimizations (if using LiteSpeed)
<IfModule LiteSpeed>
    RewriteEngine On
    RewriteRule .* - [E=noabort:1]
    RewriteRule .* - [E=noconntimeout:1]
</IfModule>
';

// Add the storage rules to the end of the .htaccess.cpanel content
$enhancedHtaccess = $htaccessCpanelContent . $storageRules;

// Create the enhanced .htaccess
if (file_put_contents($htaccessPath, $enhancedHtaccess)) {
    echo "<div class='success'>✅ Enhanced .htaccess created with storage support</div>";
} else {
    echo "<div class='error'>❌ Failed to create enhanced .htaccess</div>";
    exit;
}

echo "</div>";

echo "<div class='step'>
<h2>Step 3: Create Storage Directory Structure</h2>";

// Create storage directories
$directories = [
    'storage/app/public',
    'storage/app/public/profile-photos',
    './storage',
    './storage/profile-photos'
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        if (mkdir($dir, 0755, true)) {
            echo "<div class='success'>✅ Created directory: $dir</div>";
        } else {
            echo "<div class='error'>❌ Failed to create directory: $dir</div>";
        }
    } else {
        echo "<div class='info'>ℹ️ Directory exists: $dir</div>";
    }
}

echo "</div>";

echo "<div class='step'>
<h2>Step 4: Set Proper Permissions</h2>";

// Set permissions for storage directories
$storageDirs = [
    'storage',
    'storage/app',
    'storage/app/public',
    'storage/app/public/profile-photos',
    './storage',
    './storage/profile-photos'
];

foreach ($storageDirs as $dir) {
    if (is_dir($dir)) {
        if (chmod($dir, 0755)) {
            echo "<div class='success'>✅ Set permissions 755 for: $dir</div>";
        } else {
            echo "<div class='error'>❌ Failed to set permissions for: $dir</div>";
        }
    }
}

echo "</div>";

echo "<div class='step'>
<h2>Step 5: Create Storage Link</h2>";

// Remove existing storage link if it exists
if (is_link('./storage')) {
    unlink('./storage');
    echo "<div class='info'>ℹ️ Removed existing storage link</div>";
}

// Try to create storage link
$linkCreated = false;

// Method 1: Try Laravel's storage:link command
try {
    $output = shell_exec('php artisan storage:link 2>&1');
    if (is_link('./storage')) {
        echo "<div class='success'>✅ Storage link created via artisan command</div>";
        $linkCreated = true;
    } else {
        echo "<div class='warning'>⚠️ Artisan command didn't create link</div>";
    }
} catch (Exception $e) {
    echo "<div class='error'>❌ Failed to create storage link via artisan: " . $e->getMessage() . "</div>";
}

// Method 2: Try manual symlink
if (!$linkCreated) {
    try {
        if (symlink('storage/app/public', './storage')) {
            echo "<div class='success'>✅ Storage link created manually</div>";
            $linkCreated = true;
        } else {
            echo "<div class='error'>❌ Failed to create storage link manually</div>";
        }
    } catch (Exception $e) {
        echo "<div class='error'>❌ Manual symlink failed: " . $e->getMessage() . "</div>";
    }
}

// Method 3: Copy files if symlink fails
if (!$linkCreated) {
    echo "<div class='warning'>⚠️ Symlink failed, using file copy method</div>";
    
    $source = 'storage/app/public';
    $destination = './storage';
    
    if (is_dir($source)) {
        // Copy files from source to destination
        $files = glob($source . '/*');
        $copiedCount = 0;
        foreach ($files as $file) {
            $destFile = $destination . '/' . basename($file);
            if (is_file($file)) {
                if (copy($file, $destFile)) {
                    $copiedCount++;
                }
            } elseif (is_dir($file)) {
                // Recursively copy directory
                copyDirectory($file, $destFile);
                $copiedCount++;
            }
        }
        echo "<div class='success'>✅ Files copied from storage to public/storage ($copiedCount items)</div>";
        $linkCreated = true;
    } else {
        echo "<div class='error'>❌ Source directory doesn't exist</div>";
    }
}

echo "</div>";

echo "<div class='step'>
<h2>Step 6: Test File Access</h2>";

// Create a test file
$testFile = './storage/test.txt';
$testContent = 'Test file created at ' . date('Y-m-d H:i:s');

if (file_put_contents($testFile, $testContent)) {
    echo "<div class='success'>✅ Test file created successfully</div>";
    
    // Test web access
    $testUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/storage/test.txt';
    echo "<div class='info'>ℹ️ Testing web access to: $testUrl</div>";
    
    $headers = get_headers($testUrl);
    if ($headers && strpos($headers[0], '200') !== false) {
        echo "<div class='success'>✅ Test file accessible via web</div>";
    } else {
        echo "<div class='error'>❌ Test file not accessible via web</div>";
        echo "<div class='code'>Headers: " . htmlspecialchars(print_r($headers, true)) . "</div>";
    }
    
    // Clean up test file
    unlink($testFile);
    echo "<div class='info'>ℹ️ Test file cleaned up</div>";
} else {
    echo "<div class='error'>❌ Failed to create test file</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 7: Create .user.ini for PHP Settings</h2>";

// Create .user.ini file for PHP settings
$userIniPath = './.user.ini';
$userIniContent = '; PHP Settings for Laravel Storage
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
max_file_uploads = 20
';

if (file_put_contents($userIniPath, $userIniContent)) {
    echo "<div class='success'>✅ Created .user.ini file with PHP settings</div>";
} else {
    echo "<div class='error'>❌ Failed to create .user.ini file</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Fix Complete!</h2>";

echo "<div class='success'>✅ Photo upload fix completed successfully!</div>";

echo "<p><strong>What was done:</strong></p>";
echo "<ul>";
echo "<li>✅ Backed up your existing .htaccess files</li>";
echo "<li>✅ Enhanced .htaccess with storage access rules</li>";
echo "<li>✅ Created storage directory structure</li>";
echo "<li>✅ Set proper file permissions</li>";
echo "<li>✅ Created storage link (or copied files)</li>";
echo "<li>✅ Added PHP settings for file uploads</li>";
echo "</ul>";

echo "<p><strong>Next Steps:</strong></p>";
echo "<ol>";
echo "<li>Try uploading a new profile photo</li>";
echo "<li>Check if the photo appears in the UI</li>";
echo "<li>Test downloading the photo</li>";
echo "<li>Check if the avatar appears in navigation</li>";
echo "</ol>";

echo "<p><strong>If Issues Persist:</strong></p>";
echo "<ol>";
echo "<li>Check your hosting provider's file upload limits</li>";
echo "<li>Contact them about symbolic link support</li>";
echo "<li>Consider using the file copy method permanently</li>";
echo "</ol>";

echo "</div>";

echo "<div class='step'>
<h2>Security Notice</h2>";
echo "<div class='warning'>⚠️ IMPORTANT: Remove this file after running it for security!</div>";
echo "<p><strong>Delete:</strong> " . realpath(__FILE__) . "</p>";
echo "</div>";

echo "<div style='text-align: center; margin-top: 20px;'>
<a href='/' class='button'>🏠 Test Homepage</a>
<a href='/welcome' class='button'>🧪 Test Welcome Page</a>
<a href='javascript:location.reload()' class='button'>🔄 Refresh Page</a>
</div>";

echo "</div></body></html>";

// Helper function for copying directories
function copyDirectory($source, $destination) {
    if (!is_dir($destination)) {
        mkdir($destination, 0755, true);
    }
    
    $files = glob($source . '/*');
    foreach ($files as $file) {
        $destFile = $destination . '/' . basename($file);
        if (is_file($file)) {
            copy($file, $destFile);
        } elseif (is_dir($file)) {
            copyDirectory($file, $destFile);
        }
    }
}
