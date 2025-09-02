<?php
// Photo Upload Diagnostic Script for cPanel
// Visit: https://yourdomain.com/photo-diagnostic.php

header('Content-Type: text/plain; charset=utf-8');

echo "=== Photo Upload Diagnostic Script ===\n\n";

// Check if we're in the right directory
if (!file_exists('../vendor/autoload.php')) {
    echo "ERROR: Laravel not found. Make sure this script is in the public_html directory.\n";
    exit;
}

echo "✓ Laravel found\n";

// Load Laravel
require_once '../vendor/autoload.php';
$app = require_once '../bootstrap/app.php';

try {
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    echo "✓ Laravel bootstrapped successfully\n";
} catch (Exception $e) {
    echo "✗ Bootstrap failed: " . $e->getMessage() . "\n";
    exit;
}

echo "\n=== Storage Configuration Check ===\n";

// Check storage directories
$storagePath = '../storage/app/public';
$publicStoragePath = './storage';

echo "Storage path: $storagePath\n";
echo "Public storage path: $publicStoragePath\n\n";

// Check if storage directories exist
if (is_dir($storagePath)) {
    echo "✓ Storage directory exists\n";
    echo "  - Readable: " . (is_readable($storagePath) ? 'Yes' : 'No') . "\n";
    echo "  - Writable: " . (is_writable($storagePath) ? 'Yes' : 'No') . "\n";
    echo "  - Permissions: " . substr(sprintf('%o', fileperms($storagePath)), -4) . "\n";
} else {
    echo "✗ Storage directory does not exist\n";
}

if (is_dir($publicStoragePath)) {
    echo "✓ Public storage directory exists\n";
    echo "  - Readable: " . (is_readable($publicStoragePath) ? 'Yes' : 'No') . "\n";
    echo "  - Writable: " . (is_writable($publicStoragePath) ? 'Yes' : 'No') . "\n";
    echo "  - Permissions: " . substr(sprintf('%o', fileperms($publicStoragePath)), -4) . "\n";
} else {
    echo "✗ Public storage directory does not exist\n";
}

// Check if it's a symbolic link
if (is_link($publicStoragePath)) {
    echo "✓ Public storage is a symbolic link\n";
    echo "  - Link target: " . readlink($publicStoragePath) . "\n";
} else {
    echo "✗ Public storage is NOT a symbolic link\n";
}

echo "\n=== Profile Photos Directory Check ===\n";

$profilePhotosPath = $storagePath . '/profile-photos';
$publicProfilePhotosPath = $publicStoragePath . '/profile-photos';

if (is_dir($profilePhotosPath)) {
    echo "✓ Profile photos directory exists\n";
    echo "  - Readable: " . (is_readable($profilePhotosPath) ? 'Yes' : 'No') . "\n";
    echo "  - Writable: " . (is_writable($profilePhotosPath) ? 'Yes' : 'No') . "\n";
    echo "  - Permissions: " . substr(sprintf('%o', fileperms($profilePhotosPath)), -4) . "\n";
    
    // List files in directory
    $files = glob($profilePhotosPath . '/*');
    echo "  - Files found: " . count($files) . "\n";
    foreach ($files as $file) {
        echo "    * " . basename($file) . " (" . filesize($file) . " bytes)\n";
    }
} else {
    echo "✗ Profile photos directory does not exist\n";
}

if (is_dir($publicProfilePhotosPath)) {
    echo "✓ Public profile photos directory exists\n";
    echo "  - Readable: " . (is_readable($publicProfilePhotosPath) ? 'Yes' : 'No') . "\n";
    echo "  - Writable: " . (is_writable($publicProfilePhotosPath) ? 'Yes' : 'No') . "\n";
    echo "  - Permissions: " . substr(sprintf('%o', fileperms($publicProfilePhotosPath)), -4) . "\n";
} else {
    echo "✗ Public profile photos directory does not exist\n";
}

echo "\n=== Database Check ===\n";

try {
    $connection = \DB::connection();
    $pdo = $connection->getPdo();
    echo "✓ Database connection successful\n";
    
    // Check ProfilePhoto model
    $profilePhotos = \App\Models\ProfilePhoto::all();
    echo "✓ ProfilePhoto model works - Found " . $profilePhotos->count() . " photos\n";
    
    foreach ($profilePhotos as $photo) {
        echo "  * ID: {$photo->id}, File: {$photo->file_path}, Current: " . ($photo->is_current ? 'Yes' : 'No') . "\n";
        
        // Check if file exists
        $fullPath = storage_path('app/public/' . $photo->file_path);
        echo "    - Full path: $fullPath\n";
        echo "    - File exists: " . (file_exists($fullPath) ? 'Yes' : 'No') . "\n";
        if (file_exists($fullPath)) {
            echo "    - File size: " . filesize($fullPath) . " bytes\n";
            echo "    - Readable: " . (is_readable($fullPath) ? 'Yes' : 'No') . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== URL Generation Test ===\n";

try {
    $storage = \Storage::disk('public');
    echo "✓ Storage disk initialized\n";
    
    // Test URL generation
    if ($profilePhotos->count() > 0) {
        $testPhoto = $profilePhotos->first();
        $url = $storage->url($testPhoto->file_path);
        echo "✓ URL generated: $url\n";
        
        // Test if URL is accessible
        $headers = get_headers($url);
        if ($headers && strpos($headers[0], '200') !== false) {
            echo "✓ URL is accessible\n";
        } else {
            echo "✗ URL is not accessible\n";
        }
    }
    
} catch (Exception $e) {
    echo "✗ Storage error: " . $e->getMessage() . "\n";
}

echo "\n=== Recommendations ===\n";

if (!is_link($publicStoragePath)) {
    echo "1. Create storage symbolic link\n";
    echo "2. Set proper file permissions\n";
    echo "3. Ensure .htaccess allows access to storage files\n";
}

if (!is_dir($profilePhotosPath)) {
    echo "4. Create profile-photos directory\n";
}

echo "\n=== End Diagnostic ===\n";
echo "Remove this file after troubleshooting for security!\n";
