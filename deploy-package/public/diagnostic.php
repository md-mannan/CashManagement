<?php

// Simple diagnostic script for production troubleshooting
header('Content-Type: text/plain');

echo "=== Laravel Application Diagnostic ===\n\n";

// Check PHP version
echo "PHP Version: " . PHP_VERSION . "\n";

// Check if Laravel is loaded
if (file_exists('../vendor/autoload.php')) {
    echo "✓ Laravel autoloader found\n";
} else {
    echo "✗ Laravel autoloader not found\n";
}

// Check if .env file exists
if (file_exists('../.env')) {
    echo "✓ .env file found\n";
} else {
    echo "✗ .env file not found\n";
}

// Check if storage directory is writable
if (is_writable('../storage')) {
    echo "✓ Storage directory is writable\n";
} else {
    echo "✗ Storage directory is not writable\n";
}

// Check if bootstrap/cache directory is writable
if (is_writable('../bootstrap/cache')) {
    echo "✓ Bootstrap cache directory is writable\n";
} else {
    echo "✗ Bootstrap cache directory is not writable\n";
}

// Check if public/build directory exists
if (is_dir('../public/build')) {
    echo "✓ Build directory exists\n";
    
    // Check if manifest file exists
    if (file_exists('../public/build/.vite/manifest.json')) {
        echo "✓ Vite manifest file exists\n";
    } else {
        echo "✗ Vite manifest file not found\n";
    }
} else {
    echo "✗ Build directory not found\n";
}

// Check if vendor directory exists
if (is_dir('../vendor')) {
    echo "✓ Vendor directory exists\n";
} else {
    echo "✗ Vendor directory not found\n";
}

// Check if app directory exists
if (is_dir('../app')) {
    echo "✓ App directory exists\n";
} else {
    echo "✗ App directory not found\n";
}

// Check if routes directory exists
if (is_dir('../routes')) {
    echo "✓ Routes directory exists\n";
} else {
    echo "✗ Routes directory not found\n";
}

// Check if config directory exists
if (is_dir('../config')) {
    echo "✓ Config directory exists\n";
} else {
    echo "✗ Config directory not found\n";
}

echo "\n=== Database Connection Test ===\n";

try {
    // Load Laravel
    require_once '../vendor/autoload.php';
    $app = require_once '../bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Test database connection
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
    
    // Test UserManagementController
    $controller = new \App\Http\Controllers\Admin\UserManagementController();
    $response = $controller->index();
    echo "✓ UserManagementController works\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "\n=== End Diagnostic ===\n";
