<?php
// LiteSpeed Manual Fix Script
// Visit: https://accounts.mannnan.space/litespeed-manual-fix.php

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>LiteSpeed Manual Fix</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .info { color: #17a2b8; font-weight: bold; }
        .step { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
    </style>
</head>
<body>
<div class='container'>
<h1>📁 LiteSpeed Manual Storage Fix</h1>";

// Check if we're in the right directory
if (!file_exists('vendor/autoload.php')) {
    echo "<div class='error'>❌ ERROR: Laravel not found. Make sure this script is in the public directory.</div>";
    exit;
}

echo "<div class='success'>✅ Laravel found</div>";

echo "<div class='step'>
<h2>Step 1: Remove Existing Storage Link</h2>";

// Remove existing storage link if it exists
if (is_link('./storage')) {
    unlink('./storage');
    echo "<div class='success'>✅ Removed existing storage link</div>";
} else {
    echo "<div class='info'>ℹ️ No existing storage link found</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 2: Create Storage Directory</h2>";

// Create storage directory
if (!is_dir('./storage')) {
    if (mkdir('./storage', 0755, true)) {
        echo "<div class='success'>✅ Created public/storage directory</div>";
    } else {
        echo "<div class='error'>❌ Failed to create public/storage directory</div>";
        exit;
    }
} else {
    echo "<div class='info'>ℹ️ public/storage directory already exists</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 3: Copy Files from Storage (LiteSpeed Method)</h2>";

$source = 'storage/app/public';
$destination = './storage';

if (!is_dir($source)) {
    echo "<div class='error'>❌ Source directory doesn't exist: $source</div>";
    echo "<p>Please create the directory structure first:</p>";
    echo "<ul>";
    echo "<li>storage/app/public</li>";
    echo "<li>storage/app/public/profile-photos</li>";
    echo "</ul>";
    exit;
}

echo "<div class='info'>ℹ️ Copying files from $source to $destination</div>";

$copiedCount = 0;
$errorCount = 0;

// Copy all files and directories
$items = glob($source . '/*');
foreach ($items as $item) {
    $destItem = $destination . '/' . basename($item);
    
    if (is_file($item)) {
        if (copy($item, $destItem)) {
            $copiedCount++;
            echo "<div class='success'>✅ Copied file: " . basename($item) . "</div>";
        } else {
            $errorCount++;
            echo "<div class='error'>❌ Failed to copy file: " . basename($item) . "</div>";
        }
    } elseif (is_dir($item)) {
        if (copyDirectory($item, $destItem)) {
            $copiedCount++;
            echo "<div class='success'>✅ Copied directory: " . basename($item) . "</div>";
        } else {
            $errorCount++;
            echo "<div class='error'>❌ Failed to copy directory: " . basename($item) . "</div>";
        }
    }
}

echo "<div class='info'>ℹ️ Copy operation completed: $copiedCount items copied, $errorCount errors</div>";

echo "</div>";

echo "<div class='step'>
<h2>Step 4: Set Permissions (LiteSpeed Compatible)</h2>";

// Set permissions for the copied files
$permissionCount = 0;
$permissionErrors = 0;

function setPermissionsRecursive($dir) {
    global $permissionCount, $permissionErrors;
    
    if (is_dir($dir)) {
        // Try 755 first, then 777 for LiteSpeed
        if (chmod($dir, 0755)) {
            $permissionCount++;
        } elseif (chmod($dir, 0777)) {
            $permissionCount++;
        } else {
            $permissionErrors++;
        }
        
        $items = glob($dir . '/*');
        foreach ($items as $item) {
            if (is_dir($item)) {
                setPermissionsRecursive($item);
            } else {
                if (chmod($item, 0644)) {
                    $permissionCount++;
                } else {
                    $permissionErrors++;
                }
            }
        }
    }
}

setPermissionsRecursive($destination);

echo "<div class='info'>ℹ️ Permissions set: $permissionCount items, $permissionErrors errors</div>";

echo "</div>";

echo "<div class='step'>
<h2>Step 5: Test File Access</h2>";

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
        echo "<div class='info'>Headers: " . htmlspecialchars(print_r($headers, true)) . "</div>";
    }
    
    // Clean up test file
    unlink($testFile);
    echo "<div class='info'>ℹ️ Test file cleaned up</div>";
} else {
    echo "<div class='error'>❌ Failed to create test file</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 6: Update .htaccess for LiteSpeed</h2>";

// Update .htaccess with LiteSpeed storage access rules
$htaccessPath = './.htaccess';
$htaccessContent = '';

if (file_exists($htaccessPath)) {
    $htaccessContent = file_get_contents($htaccessPath);
    echo "<div class='success'>✅ .htaccess file found</div>";
} else {
    echo "<div class='error'>❌ .htaccess file not found</div>";
}

// LiteSpeed storage access rules
$litespeedRules = '

# LiteSpeed Storage Access Rules
<Directory "storage">
    Require all granted
    Options -Indexes +FollowSymLinks
</Directory>

# Image MIME Types for LiteSpeed
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType image/webp .webp
</IfModule>

# Handle image files for LiteSpeed
<FilesMatch "\.(jpg|jpeg|png|gif|webp)$">
    <IfModule mod_headers.c>
        Header set Content-Type "image/$1"
        Header set Cache-Control "public, max-age=31536000"
    </IfModule>
</FilesMatch>

# LiteSpeed specific optimizations
<IfModule LiteSpeed>
    RewriteEngine On
    RewriteRule .* - [E=noabort:1]
    RewriteRule .* - [E=noconntimeout:1]
</IfModule>
';

if (strpos($htaccessContent, 'Directory "storage"') === false) {
    $htaccessContent .= $litespeedRules;
    if (file_put_contents($htaccessPath, $htaccessContent)) {
        echo "<div class='success'>✅ Updated .htaccess with LiteSpeed storage access rules</div>";
    } else {
        echo "<div class='error'>❌ Failed to update .htaccess</div>";
    }
} else {
    echo "<div class='info'>ℹ️ .htaccess already has storage access rules</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 7: Create .user.ini for PHP Settings</h2>";

// Create .user.ini file for PHP settings
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
<h2>LiteSpeed Manual Fix Complete!</h2>";

if ($errorCount == 0) {
    echo "<div class='success'>✅ LiteSpeed manual fix completed successfully!</div>";
    echo "<p><strong>Next Steps:</strong></p>";
    echo "<ol>";
    echo "<li>Try uploading a new profile photo</li>";
    echo "<li>Check if the photo appears in the UI</li>";
    echo "<li>Test downloading the photo</li>";
    echo "<li>Check if the avatar appears in navigation</li>";
    echo "</ol>";
} else {
    echo "<div class='error'>⚠️ Manual fix completed with $errorCount errors</div>";
    echo "<p>Some files may not have been copied properly. Please check the errors above.</p>";
}

echo "<p><strong>Important Notes for LiteSpeed:</strong></p>";
echo "<ul>";
echo "<li>This method copies files instead of using symbolic links (recommended for LiteSpeed)</li>";
echo "<li>You'll need to run this script again if you add new files to storage</li>";
echo "<li>Consider setting up a cron job to sync files periodically</li>";
echo "<li>LiteSpeed caching may interfere - clear cache if needed</li>";
echo "</ul>";

echo "<p><strong>If Issues Persist:</strong></p>";
echo "<ol>";
echo "<li>Contact your hosting provider about LiteSpeed configuration</li>";
echo "<li>Ask them to clear LiteSpeed cache</li>";
echo "<li>Request them to check file permissions</li>";
echo "<li>Consider using a different hosting provider that supports Laravel better</li>";
echo "</ol>";

echo "</div>";

echo "<div class='step'>
<h2>Security Notice</h2>";
echo "<div class='error'>⚠️ IMPORTANT: Remove this file after running it for security!</div>";
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
        if (!mkdir($destination, 0755, true)) {
            return false;
        }
    }
    
    $items = glob($source . '/*');
    foreach ($items as $item) {
        $destItem = $destination . '/' . basename($item);
        
        if (is_file($item)) {
            if (!copy($item, $destItem)) {
                return false;
            }
        } elseif (is_dir($item)) {
            if (!copyDirectory($item, $destItem)) {
                return false;
            }
        }
    }
    
    return true;
}
