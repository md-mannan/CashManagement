<?php
// LiteSpeed Storage Fix - Target 500 Error
// Visit: https://accounts.mannnan.space/litespeed-storage-fix.php

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>LiteSpeed 500 Error Fix</title>
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
<h1>🔧 LiteSpeed 500 Error Fix</h1>";

// Check if we're in the right directory
if (!file_exists('vendor/autoload.php')) {
    echo "<div class='error'>❌ ERROR: Laravel not found. Make sure this script is in the public directory.</div>";
    exit;
}

echo "<div class='success'>✅ Laravel found</div>";

echo "<div class='step'>
<h2>Step 1: Remove Problematic Storage Directory</h2>";

// Remove the problematic storage directory completely
if (is_dir('./storage')) {
    if (is_link('./storage')) {
        unlink('./storage');
        echo "<div class='success'>✅ Removed existing storage symlink</div>";
    } else {
        system("rm -rf ./storage");
        echo "<div class='success'>✅ Removed existing storage directory</div>";
    }
} else {
    echo "<div class='info'>ℹ️ No existing storage directory found</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 2: Create Fresh Storage Directory</h2>";

// Create a fresh storage directory
if (mkdir('./storage', 0755, true)) {
    echo "<div class='success'>✅ Created fresh storage directory</div>";
} else {
    echo "<div class='error'>❌ Failed to create storage directory</div>";
    exit;
}

echo "</div>";

echo "<div class='step'>
<h2>Step 3: Create .htaccess for Storage Directory</h2>";

// Create a specific .htaccess file for the storage directory
$storageHtaccess = './storage/.htaccess';
$htaccessContent = 'Options -Indexes
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.php [L]
</IfModule>

# Allow all file types
<FilesMatch ".*">
    Require all granted
</FilesMatch>

# Set proper MIME types
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType image/webp .webp
    AddType image/svg+xml .svg
</IfModule>

# LiteSpeed specific
<IfModule LiteSpeed>
    RewriteEngine On
    RewriteRule .* - [E=noabort:1]
</IfModule>
';

if (file_put_contents($storageHtaccess, $htaccessContent)) {
    echo "<div class='success'>✅ Created storage/.htaccess file</div>";
} else {
    echo "<div class='error'>❌ Failed to create storage/.htaccess file</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 4: Update Main .htaccess File</h2>";

// Update the main .htaccess file
$mainHtaccess = './.htaccess';
$mainHtaccessContent = '';

if (file_exists($mainHtaccess)) {
    $mainHtaccessContent = file_get_contents($mainHtaccess);
    echo "<div class='success'>✅ Main .htaccess file found</div>";
} else {
    echo "<div class='error'>❌ Main .htaccess file not found</div>";
}

// Add LiteSpeed storage access rules
$litespeedStorageRules = '

# LiteSpeed Storage Access Rules
<Directory "storage">
    Require all granted
    Options -Indexes +FollowSymLinks
    AllowOverride All
</Directory>

# Handle storage files
<LocationMatch "^/storage/">
    Require all granted
    Options -Indexes
</LocationMatch>

# Image MIME Types
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType image/webp .webp
    AddType image/svg+xml .svg
</IfModule>

# LiteSpeed optimizations
<IfModule LiteSpeed>
    RewriteEngine On
    RewriteRule .* - [E=noabort:1]
    RewriteRule .* - [E=noconntimeout:1]
</IfModule>

# Prevent access to sensitive files
<FilesMatch "\.(env|git|svn|htaccess|htpasswd)$">
    Require all denied
</FilesMatch>
';

if (strpos($mainHtaccessContent, 'Directory "storage"') === false) {
    $mainHtaccessContent .= $litespeedStorageRules;
    if (file_put_contents($mainHtaccess, $mainHtaccessContent)) {
        echo "<div class='success'>✅ Updated main .htaccess with storage rules</div>";
    } else {
        echo "<div class='error'>❌ Failed to update main .htaccess</div>";
    }
} else {
    echo "<div class='info'>ℹ️ Main .htaccess already has storage rules</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 5: Create Test Files</h2>";

// Create test files to verify access
$testFiles = [
    './storage/test.txt' => 'This is a test file created at ' . date('Y-m-d H:i:s'),
    './storage/test.jpg' => base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A'),
    './storage/test.png' => base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
];

$createdCount = 0;
foreach ($testFiles as $filePath => $content) {
    if (file_put_contents($filePath, $content)) {
        echo "<div class='success'>✅ Created test file: " . basename($filePath) . "</div>";
        $createdCount++;
    } else {
        echo "<div class='error'>❌ Failed to create test file: " . basename($filePath) . "</div>";
    }
}

echo "<div class='info'>ℹ️ Created $createdCount test files</div>";

echo "</div>";

echo "<div class='step'>
<h2>Step 6: Test File Access</h2>";

// Test access to each file
$testUrls = [
    'test.txt' => 'http://' . $_SERVER['HTTP_HOST'] . '/storage/test.txt',
    'test.jpg' => 'http://' . $_SERVER['HTTP_HOST'] . '/storage/test.jpg',
    'test.png' => 'http://' . $_SERVER['HTTP_HOST'] . '/storage/test.png'
];

$successCount = 0;
foreach ($testUrls as $filename => $url) {
    echo "<div class='info'>ℹ️ Testing: $filename</div>";
    
    $headers = get_headers($url);
    if ($headers && strpos($headers[0], '200') !== false) {
        echo "<div class='success'>✅ $filename accessible via web</div>";
        $successCount++;
    } else {
        echo "<div class='error'>❌ $filename not accessible via web</div>";
        echo "<div class='code'>Headers: " . htmlspecialchars(print_r($headers, true)) . "</div>";
    }
}

echo "<div class='info'>ℹ️ $successCount out of " . count($testUrls) . " files accessible</div>";

echo "</div>";

echo "<div class='step'>
<h2>Step 7: Alternative Storage Method</h2>";

if ($successCount == 0) {
    echo "<div class='warning'>⚠️ Direct storage access failed. Trying alternative method...</div>";
    
    // Create a PHP script to serve files
    $fileServer = './storage/file-server.php';
    $fileServerContent = '<?php
// File Server for LiteSpeed
$requestedFile = $_GET["file"] ?? "";
$storagePath = "../storage/app/public/";

if (empty($requestedFile)) {
    http_response_code(404);
    exit("File not found");
}

$filePath = $storagePath . $requestedFile;

if (!file_exists($filePath)) {
    http_response_code(404);
    exit("File not found");
}

$extension = pathinfo($filePath, PATHINFO_EXTENSION);
$mimeTypes = [
    "jpg" => "image/jpeg",
    "jpeg" => "image/jpeg", 
    "png" => "image/png",
    "gif" => "image/gif",
    "webp" => "image/webp",
    "svg" => "image/svg+xml"
];

$mimeType = $mimeTypes[$extension] ?? "application/octet-stream";

header("Content-Type: $mimeType");
header("Content-Length: " . filesize($filePath));
header("Cache-Control: public, max-age=31536000");
readfile($filePath);
exit;
';

    if (file_put_contents($fileServer, $fileServerContent)) {
        echo "<div class='success'>✅ Created file server script</div>";
        echo "<div class='info'>ℹ️ You can now access files via: /storage/file-server.php?file=profile-photos/filename.jpg</div>";
    } else {
        echo "<div class='error'>❌ Failed to create file server script</div>";
    }
} else {
    echo "<div class='success'>✅ Direct storage access is working!</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 8: Update Laravel Configuration</h2>";

// Create a custom storage disk configuration
$configPath = './storage-config.php';
$configContent = '<?php
// Custom Storage Configuration for LiteSpeed
return [
    "default" => env("FILESYSTEM_DISK", "local"),
    "disks" => [
        "local" => [
            "driver" => "local",
            "root" => storage_path("app"),
        ],
        "public" => [
            "driver" => "local",
            "root" => storage_path("app/public"),
            "url" => env("APP_URL")."/storage",
            "visibility" => "public",
        ],
        "litespeed" => [
            "driver" => "local", 
            "root" => public_path("storage"),
            "url" => env("APP_URL")."/storage",
            "visibility" => "public",
        ],
    ],
];
';

if (file_put_contents($configPath, $configContent)) {
    echo "<div class='success'>✅ Created custom storage configuration</div>";
    echo "<div class='info'>ℹ️ You can use the 'litespeed' disk for better compatibility</div>";
} else {
    echo "<div class='error'>❌ Failed to create storage configuration</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 9: Clean Up Test Files</h2>";

// Clean up test files
foreach (array_keys($testFiles) as $filePath) {
    if (file_exists($filePath)) {
        unlink($filePath);
        echo "<div class='info'>ℹ️ Cleaned up: " . basename($filePath) . "</div>";
    }
}

echo "<div class='success'>✅ Test files cleaned up</div>";

echo "</div>";

echo "<div class='step'>
<h2>LiteSpeed 500 Error Fix Complete!</h2>";

if ($successCount > 0) {
    echo "<div class='success'>✅ Storage access is now working!</div>";
    echo "<p><strong>Next Steps:</strong></p>";
    echo "<ol>";
    echo "<li>Try uploading a new profile photo</li>";
    echo "<li>Check if the photo appears in the UI</li>";
    echo "<li>Test downloading the photo</li>";
    echo "<li>Check if the avatar appears in navigation</li>";
    echo "</ol>";
} else {
    echo "<div class='warning'>⚠️ Direct storage access still not working</div>";
    echo "<p><strong>Alternative Solutions:</strong></p>";
    echo "<ol>";
    echo "<li>Use the file server script: /storage/file-server.php?file=profile-photos/filename.jpg</li>";
    echo "<li>Contact your hosting provider about LiteSpeed configuration</li>";
    echo "<li>Ask them to clear LiteSpeed cache</li>";
    echo "<li>Consider switching to a different hosting provider</li>";
    echo "</ol>";
}

echo "<p><strong>Important Notes:</strong></p>";
echo "<ul>";
echo "<li>LiteSpeed often has strict security settings that block file access</li>";
echo "<li>The .htaccess files should help bypass these restrictions</li>";
echo "<li>If issues persist, the file server script provides an alternative</li>";
echo "<li>Consider using the 'litespeed' storage disk for better compatibility</li>";
echo "</ul>";

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
