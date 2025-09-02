<?php
// cPanel Fix Script - Run this from your browser
// Visit: https://yourdomain.com/cpanel-fix.php

header('Content-Type: text/plain; charset=utf-8');

echo "=== cPanel Laravel Fix Script ===\n\n";

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

// Clear caches
echo "\n=== Clearing Caches ===\n";

try {
    // Clear config cache
    if (file_exists('../bootstrap/cache/config.php')) {
        unlink('../bootstrap/cache/config.php');
        echo "✓ Config cache cleared\n";
    }
    
    // Clear route cache
    if (file_exists('../bootstrap/cache/routes.php')) {
        unlink('../bootstrap/cache/routes.php');
        echo "✓ Route cache cleared\n";
    }
    
    // Clear view cache
    if (is_dir('../storage/framework/views')) {
        $files = glob('../storage/framework/views/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        echo "✓ View cache cleared\n";
    }
    
    // Clear application cache
    if (is_dir('../storage/framework/cache')) {
        $files = glob('../storage/framework/cache/data/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        echo "✓ Application cache cleared\n";
    }
    
} catch (Exception $e) {
    echo "✗ Cache clearing failed: " . $e->getMessage() . "\n";
}

// Test database connection
echo "\n=== Testing Database ===\n";

try {
    $connection = \DB::connection();
    $pdo = $connection->getPdo();
    echo "✓ Database connection successful\n";
    
    // Test User model
    $user = \App\Models\User::first();
    if ($user) {
        echo "✓ User model works - Found user: " . $user->name . "\n";
    } else {
        echo "✓ User model works - No users found\n";
    }
    
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    echo "Check your .env file database settings\n";
}

// Test UserManagementController
echo "\n=== Testing UserManagementController ===\n";

try {
    $controller = new \App\Http\Controllers\Admin\UserManagementController();
    $response = $controller->index();
    echo "✓ UserManagementController works\n";
} catch (Exception $e) {
    echo "✗ UserManagementController error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

// Check file permissions
echo "\n=== Checking File Permissions ===\n";

$directories = [
    '../storage' => 'Storage directory',
    '../bootstrap/cache' => 'Bootstrap cache',
    '../public/build' => 'Build directory',
];

foreach ($directories as $path => $name) {
    if (is_dir($path)) {
        if (is_writable($path)) {
            echo "✓ $name is writable\n";
        } else {
            echo "✗ $name is not writable (set to 755)\n";
        }
    } else {
        echo "✗ $name not found\n";
    }
}

// Check .env file
if (file_exists('../.env')) {
    if (is_readable('../.env')) {
        echo "✓ .env file is readable\n";
    } else {
        echo "✗ .env file is not readable (set to 644)\n";
    }
} else {
    echo "✗ .env file not found\n";
}

echo "\n=== Recommendations ===\n";
echo "1. If any directories are not writable, set them to 755 in cPanel File Manager\n";
echo "2. If .env is not readable, set it to 644 in cPanel File Manager\n";
echo "3. Check cPanel Error Logs for specific PHP errors\n";
echo "4. Ensure your database credentials in .env are correct\n";
echo "5. Make sure all Laravel files are uploaded to the correct directory\n";

echo "\n=== End Fix Script ===\n";
echo "Remove this file after troubleshooting for security!\n";
