<?php
// LiteSpeed Bypass Fix - PHP File Server Method
// Visit: https://accounts.mannnan.space/litespeed-bypass-fix.php

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>LiteSpeed Bypass Fix</title>
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
<h1>🔧 LiteSpeed Bypass Fix - PHP File Server Method</h1>";

echo "<div class='step'>
<h2>Step 1: Create PHP File Server</h2>";

// Create a PHP file server that bypasses LiteSpeed restrictions
$fileServerPath = './storage-server.php';
$fileServerContent = '<?php
// PHP File Server for LiteSpeed - Bypasses storage access restrictions
// Access files via: /storage-server.php?file=profile-photos/filename.jpg

// Security: Only allow access to specific directories
$allowedDirs = [
    "storage/app/public",
    "storage/app/public/profile-photos"
];

$requestedFile = $_GET["file"] ?? "";
$storagePath = "storage/app/public/";

// Validate file path
if (empty($requestedFile)) {
    http_response_code(404);
    exit("File not found");
}

// Security check - prevent directory traversal
if (strpos($requestedFile, "..") !== false || strpos($requestedFile, "/") === 0) {
    http_response_code(403);
    exit("Access denied");
}

$filePath = $storagePath . $requestedFile;

// Check if file exists
if (!file_exists($filePath)) {
    http_response_code(404);
    exit("File not found");
}

// Get file extension and set MIME type
$extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$mimeTypes = [
    "jpg" => "image/jpeg",
    "jpeg" => "image/jpeg", 
    "png" => "image/png",
    "gif" => "image/gif",
    "webp" => "image/webp",
    "svg" => "image/svg+xml",
    "pdf" => "application/pdf",
    "txt" => "text/plain"
];

$mimeType = $mimeTypes[$extension] ?? "application/octet-stream";

// Set headers
header("Content-Type: $mimeType");
header("Content-Length: " . filesize($filePath));
header("Cache-Control: public, max-age=31536000");
header("Access-Control-Allow-Origin: *");

// Output file
readfile($filePath);
exit;
';

if (file_put_contents($fileServerPath, $fileServerContent)) {
    echo "<div class='success'>✅ Created PHP file server: storage-server.php</div>";
    echo "<div class='info'>ℹ️ You can now access files via: /storage-server.php?file=profile-photos/filename.jpg</div>";
} else {
    echo "<div class='error'>❌ Failed to create PHP file server</div>";
    exit;
}

echo "</div>";

echo "<div class='step'>
<h2>Step 2: Create Storage Directories</h2>";

// Create storage directories
$directories = [
    'storage/app/public',
    'storage/app/public/profile-photos'
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
<h2>Step 3: Set Permissions</h2>";

// Set permissions for storage directories
$storageDirs = [
    'storage',
    'storage/app',
    'storage/app/public',
    'storage/app/public/profile-photos'
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
<h2>Step 4: Create Test Files</h2>";

// Create test files
$testFiles = [
    'storage/app/public/test.txt' => 'Test file created at ' . date('Y-m-d H:i:s'),
    'storage/app/public/test.jpg' => base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A'),
    'storage/app/public/profile-photos/test-profile.jpg' => base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A')
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
<h2>Step 5: Test PHP File Server</h2>";

// Test the PHP file server
$testUrls = [
    'test.txt' => 'http://' . $_SERVER['HTTP_HOST'] . '/storage-server.php?file=test.txt',
    'test.jpg' => 'http://' . $_SERVER['HTTP_HOST'] . '/storage-server.php?file=test.jpg',
    'profile-photos/test-profile.jpg' => 'http://' . $_SERVER['HTTP_HOST'] . '/storage-server.php?file=profile-photos/test-profile.jpg'
];

$successCount = 0;
foreach ($testUrls as $filename => $url) {
    echo "<div class='info'>ℹ️ Testing: $filename</div>";
    
    $headers = get_headers($url);
    if ($headers && strpos($headers[0], '200') !== false) {
        echo "<div class='success'>✅ $filename accessible via PHP file server</div>";
        $successCount++;
    } else {
        echo "<div class='error'>❌ $filename not accessible via PHP file server</div>";
        echo "<div class='code'>Headers: " . htmlspecialchars(print_r($headers, true)) . "</div>";
    }
}

echo "<div class='info'>ℹ️ $successCount out of " . count($testUrls) . " files accessible via PHP file server</div>";

echo "</div>";

echo "<div class='step'>
<h2>Step 6: Update Laravel Configuration</h2>";

// Create a custom storage disk configuration
$configPath = './storage-config.php';
$configContent = '<?php
// Custom Storage Configuration for LiteSpeed with PHP File Server
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
            "url" => env("APP_URL")."/storage-server.php?file=",
            "visibility" => "public",
        ],
        "litespeed" => [
            "driver" => "local", 
            "root" => storage_path("app/public"),
            "url" => env("APP_URL")."/storage-server.php?file=",
            "visibility" => "public",
        ],
    ],
];
';

if (file_put_contents($configPath, $configContent)) {
    echo "<div class='success'>✅ Created custom storage configuration</div>";
    echo "<div class='info'>ℹ️ Use the 'litespeed' disk for better compatibility</div>";
} else {
    echo "<div class='error'>❌ Failed to create storage configuration</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 7: Create .htaccess for PHP File Server</h2>";

// Create .htaccess for the PHP file server
$htaccessPath = './.htaccess';
$htaccessContent = '<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Allow access to PHP file server
<Files "storage-server.php">
    <IfModule mod_authz_core.c>
        Require all granted
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Allow from all
    </IfModule>
</Files>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
</IfModule>
';

if (file_put_contents($htaccessPath, $htaccessContent)) {
    echo "<div class='success'>✅ Created .htaccess for PHP file server</div>";
} else {
    echo "<div class='error'>❌ Failed to create .htaccess</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 8: Clean Up Test Files</h2>";

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
<h2>LiteSpeed Bypass Fix Complete!</h2>";

if ($successCount > 0) {
    echo "<div class='success'>✅ PHP file server is working!</div>";
    echo "<p><strong>How it works:</strong></p>";
    echo "<ul>";
    echo "<li>✅ Files are stored in storage/app/public/</li>";
    echo "<li>✅ Access files via: /storage-server.php?file=profile-photos/filename.jpg</li>";
    echo "<li>✅ Bypasses LiteSpeed storage access restrictions</li>";
    echo "<li>✅ Includes security checks and proper MIME types</li>";
    echo "</ul>";
    
    echo "<p><strong>Next Steps:</strong></p>";
    echo "<ol>";
    echo "<li>Update your Laravel code to use the 'litespeed' storage disk</li>";
    echo "<li>Try uploading a new profile photo</li>";
    echo "<li>Check if the photo appears in the UI</li>";
    echo "<li>Test downloading the photo</li>";
    echo "</ol>";
    
    echo "<p><strong>Example Usage:</strong></p>";
    echo "<div class='code'>";
    echo "// In your Laravel code, use the litespeed disk:<br>";
    echo "Storage::disk('litespeed')->url('profile-photos/filename.jpg');<br>";
    echo "// This will generate: /storage-server.php?file=profile-photos/filename.jpg";
    echo "</div>";
} else {
    echo "<div class='error'>❌ PHP file server is not working</div>";
    echo "<p><strong>Troubleshooting:</strong></p>";
    echo "<ol>";
    echo "<li>Check if PHP is working on your server</li>";
    echo "<li>Contact your hosting provider about PHP execution</li>";
    echo "<li>Check server error logs for more details</li>";
    echo "</ol>";
}

echo "</div>";

echo "<div class='step'>
<h2>Security Notice</h2>";
echo "<div class='warning'>⚠️ IMPORTANT: Remove this file after running it for security!</div>";
echo "<p><strong>Delete:</strong> " . realpath(__FILE__) . "</p>";
echo "</div>";

echo "<div style='text-align: center; margin-top: 20px;'>
<a href='/' class='button'>🏠 Test Homepage</a>
<a href='/storage-server.php?file=test.txt' class='button'>🧪 Test File Server</a>
<a href='javascript:location.reload()' class='button'>🔄 Refresh Page</a>
</div>";

echo "</div></body></html>";
