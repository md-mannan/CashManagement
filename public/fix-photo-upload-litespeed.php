<?php
// Photo Upload Fix Script for LiteSpeed Shared Hosting
// Visit: https://accounts.mannnan.space/fix-photo-upload-litespeed.php

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>Photo Upload Fix - LiteSpeed Hosting</title>
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
        .button:hover { background: #0056b3; }
    </style>
</head>
<body>
<div class='container'>
<h1>🔧 Photo Upload Fix for LiteSpeed Shared Hosting</h1>";

// Check if we're in the right directory (public folder of Laravel)
if (!file_exists('vendor/autoload.php')) {
    echo "<div class='error'>❌ ERROR: Laravel not found. Make sure this script is in the public directory.</div>";
    exit;
}

echo "<div class='success'>✅ Laravel found</div>";

// Load Laravel
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

try {
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    echo "<div class='success'>✅ Laravel bootstrapped successfully</div>";
} catch (Exception $e) {
    echo "<div class='error'>❌ Bootstrap failed: " . $e->getMessage() . "</div>";
    exit;
}

echo "<div class='step'>
<h2>Step 1: Server Environment Detection</h2>";

// Detect server environment
$serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? '';
$isLiteSpeed = stripos($serverSoftware, 'litespeed') !== false;
$isApache = stripos($serverSoftware, 'apache') !== false;
$isNginx = stripos($serverSoftware, 'nginx') !== false;

echo "<p><strong>Server Software:</strong> " . htmlspecialchars($serverSoftware) . "</p>";
echo "<p><strong>Is LiteSpeed:</strong> " . ($isLiteSpeed ? 'Yes' : 'No') . "</p>";
echo "<p><strong>Is Apache:</strong> " . ($isApache ? 'Yes' : 'No') . "</p>";
echo "<p><strong>Is Nginx:</strong> " . ($isNginx ? 'Yes' : 'No') . "</p>";
echo "<p><strong>PHP Version:</strong> " . PHP_VERSION . "</p>";
echo "<p><strong>Current User:</strong> " . get_current_user() . "</p>";

echo "</div>";

echo "<div class='step'>
<h2>Step 2: Storage Directory Setup</h2>";

// Create storage directories if they don't exist
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
<h2>Step 3: File Permissions (LiteSpeed Optimized)</h2>";

// Set permissions for storage directories - LiteSpeed often needs more permissive settings
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
        // Try 755 first, then 777 if needed
        if (chmod($dir, 0755)) {
            echo "<div class='success'>✅ Set permissions 755 for: $dir</div>";
        } elseif (chmod($dir, 0777)) {
            echo "<div class='warning'>⚠️ Set permissions 777 for: $dir (less secure but may be required)</div>";
        } else {
            echo "<div class='error'>❌ Failed to set permissions for: $dir</div>";
        }
    }
}

echo "</div>";

echo "<div class='step'>
<h2>Step 4: Storage Link Creation (LiteSpeed Compatible)</h2>";

// Remove existing storage link if it exists
if (is_link('./storage')) {
    unlink('./storage');
    echo "<div class='info'>ℹ️ Removed existing storage link</div>";
}

$linkCreated = false;

// Method 1: Try Laravel's storage:link command
echo "<h3>Method 1: Laravel Artisan Command</h3>";
try {
    $output = shell_exec('cd .. && php artisan storage:link 2>&1');
    if (is_link('./storage')) {
        echo "<div class='success'>✅ Storage link created via artisan command</div>";
        echo "<div class='code'>Output: " . htmlspecialchars($output) . "</div>";
        $linkCreated = true;
    } else {
        echo "<div class='warning'>⚠️ Artisan command didn't create link</div>";
    }
} catch (Exception $e) {
    echo "<div class='error'>❌ Failed to create storage link via artisan: " . $e->getMessage() . "</div>";
}

// Method 2: Try manual symlink
if (!$linkCreated) {
    echo "<h3>Method 2: Manual Symlink</h3>";
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

// Method 3: Copy files instead of symlink (Recommended for LiteSpeed)
if (!$linkCreated) {
    echo "<h3>Method 3: File Copy (Recommended for LiteSpeed)</h3>";
    echo "<div class='info'>ℹ️ LiteSpeed often has issues with symlinks. Using file copy method...</div>";
    
    $source = 'storage/app/public';
    $destination = './storage';
    
    if (is_dir($source)) {
        // Remove existing storage directory if it exists
        if (is_dir($destination)) {
            system("rm -rf $destination");
        }
        
        // Copy all files from source to destination
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
<h2>Step 5: LiteSpeed .htaccess Configuration</h2>";

// Check if .htaccess exists and update it
$htaccessPath = './.htaccess';
$htaccessContent = '';

if (file_exists($htaccessPath)) {
    $htaccessContent = file_get_contents($htaccessPath);
    echo "<div class='success'>✅ .htaccess file found</div>";
} else {
    echo "<div class='error'>❌ .htaccess file not found</div>";
}

// LiteSpeed optimized image support
$litespeedImageSupport = '

# LiteSpeed Image Support for Laravel Storage
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType image/webp .webp
    AddType image/svg+xml .svg
</IfModule>

# Allow access to storage files (LiteSpeed compatible)
<Directory "storage">
    Require all granted
    Options -Indexes +FollowSymLinks
</Directory>

# Handle image files properly for LiteSpeed
<FilesMatch "\.(jpg|jpeg|png|gif|webp|svg)$">
    <IfModule mod_headers.c>
        Header set Content-Type "image/$1"
        Header set Cache-Control "public, max-age=31536000"
        Header set Access-Control-Allow-Origin "*"
    </IfModule>
</FilesMatch>

# LiteSpeed specific optimizations
<IfModule LiteSpeed>
    RewriteEngine On
    RewriteRule .* - [E=noabort:1]
    RewriteRule .* - [E=noconntimeout:1]
</IfModule>

# Force download for certain file types
<FilesMatch "\.(txt|log)$">
    <IfModule mod_headers.c>
        Header set Content-Type "text/plain"
        Header set Content-Disposition "attachment"
    </IfModule>
</FilesMatch>

# Prevent access to sensitive files
<FilesMatch "\.(env|git|svn|htaccess|htpasswd)$">
    Require all denied
</FilesMatch>
';

if (strpos($htaccessContent, 'AddType image/jpeg') === false) {
    // Append the LiteSpeed image support to .htaccess
    $htaccessContent .= $litespeedImageSupport;
    if (file_put_contents($htaccessPath, $htaccessContent)) {
        echo "<div class='success'>✅ Updated .htaccess with LiteSpeed image support</div>";
    } else {
        echo "<div class='error'>❌ Failed to update .htaccess</div>";
    }
} else {
    echo "<div class='info'>ℹ️ .htaccess already has image support</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 6: Create .user.ini for PHP Settings</h2>";

// Create .user.ini file for PHP settings (often needed on LiteSpeed)
$userIniPath = './.user.ini';
$userIniContent = '; LiteSpeed PHP Settings for Laravel Storage
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
<h2>Step 7: Test File Creation and Access</h2>";

// Create a test image file
$testImagePath = './storage/test-image.jpg';
$testImageContent = base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A');

if (file_put_contents($testImagePath, $testImageContent)) {
    echo "<div class='success'>✅ Test image created successfully</div>";
    
    // Test if we can read it back
    if (file_get_contents($testImagePath) === $testImageContent) {
        echo "<div class='success'>✅ Test image can be read back</div>";
    } else {
        echo "<div class='error'>❌ Test image cannot be read back</div>";
    }
    
    // Test web access
    $testUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/storage/test-image.jpg';
    echo "<div class='info'>ℹ️ Testing web access to: $testUrl</div>";
    
    $headers = get_headers($testUrl);
    if ($headers && strpos($headers[0], '200') !== false) {
        echo "<div class='success'>✅ Test image accessible via web</div>";
    } else {
        echo "<div class='error'>❌ Test image not accessible via web</div>";
        echo "<div class='code'>Headers: " . htmlspecialchars(print_r($headers, true)) . "</div>";
    }
    
    // Clean up test file
    unlink($testImagePath);
    echo "<div class='info'>ℹ️ Test image cleaned up</div>";
} else {
    echo "<div class='error'>❌ Failed to create test image</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 8: Database and Model Check</h2>";

try {
    $connection = \DB::connection();
    $pdo = $connection->getPdo();
    echo "<div class='success'>✅ Database connection successful</div>";
    
    // Check ProfilePhoto model
    $profilePhotos = \App\Models\ProfilePhoto::all();
    echo "<div class='success'>✅ ProfilePhoto model works - Found " . $profilePhotos->count() . " photos</div>";
    
    // Test storage URL generation
    if ($profilePhotos->count() > 0) {
        $testPhoto = $profilePhotos->first();
        $storage = \Storage::disk('public');
        $url = $storage->url($testPhoto->file_path);
        echo "<div class='success'>✅ Storage URL generated: $url</div>";
        
        // Test if the URL is accessible
        $headers = get_headers($url);
        if ($headers && strpos($headers[0], '200') !== false) {
            echo "<div class='success'>✅ Existing photo URL is accessible</div>";
        } else {
            echo "<div class='warning'>⚠️ Existing photo URL is not accessible</div>";
        }
    }
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Database error: " . $e->getMessage() . "</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 9: LiteSpeed Specific Recommendations</h2>";

if ($linkCreated) {
    echo "<div class='success'>✅ Storage setup completed successfully!</div>";
    echo "<p><strong>Next Steps:</strong></p>";
    echo "<ol>";
    echo "<li>Try uploading a new profile photo</li>";
    echo "<li>Check if the photo appears in the UI</li>";
    echo "<li>Test downloading the photo</li>";
    echo "<li>Check if the avatar appears in navigation</li>";
    echo "</ol>";
} else {
    echo "<div class='error'>❌ Storage setup failed</div>";
    echo "<p><strong>Manual Steps Required:</strong></p>";
    echo "<ol>";
    echo "<li>Contact your hosting provider about LiteSpeed symlink support</li>";
    echo "<li>Use cPanel File Manager to manually copy files from storage/app/public to public/storage</li>";
    echo "<li>Set proper file permissions (755 for directories, 644 for files)</li>";
    echo "</ol>";
}

echo "<p><strong>LiteSpeed Specific Notes:</strong></p>";
echo "<ul>";
echo "<li>LiteSpeed often has issues with symbolic links - file copy method is recommended</li>";
echo "<li>You may need to contact your hosting provider to enable symlinks</li>";
echo "<li>LiteSpeed caching can interfere with file access - clear cache if needed</li>";
echo "<li>Consider using the file copy method and setting up a cron job to sync files</li>";
echo "</ul>";

echo "<p><strong>If Issues Persist:</strong></p>";
echo "<ol>";
echo "<li>Contact your hosting provider about LiteSpeed configuration</li>";
echo "<li>Ask them to enable symbolic links for your domain</li>";
echo "<li>Request LiteSpeed cache clearing</li>";
echo "<li>Consider switching to file copy method permanently</li>";
echo "</ol>";

echo "</div>";

echo "<div class='step'>
<h2>Security Notice</h2>";
echo "<div class='warning'>⚠️ IMPORTANT: Remove this file after running it for security!</div>";
echo "<p><strong>Delete:</strong> " . realpath(__FILE__) . "</p>";
echo "</div>";

echo "<div style='text-align: center; margin-top: 20px;'>
<a href='/' class='button'>🏠 Go to Homepage</a>
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
