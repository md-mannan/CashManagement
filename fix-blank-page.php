<?php
// Quick fix script for blank page issues

echo "<h1>🔧 Quick Fix for Blank Page</h1>";

// Step 1: Check and create .env if missing
echo "<h2>Step 1: Environment File</h2>";
if (!file_exists(__DIR__ . '/.env')) {
    echo "<p>❌ .env file missing - creating one...</p>";

    $envContent = 'APP_NAME="Cash Management"
APP_ENV=production
APP_KEY=
APP_DEBUG=true
APP_URL=https://mannnan.space

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"';

    if (file_put_contents(__DIR__ . '/.env', $envContent)) {
        echo "<p>✅ .env file created successfully</p>";
        echo "<p>⚠️ Please edit it with your actual database credentials!</p>";
    } else {
        echo "<p>❌ Failed to create .env file</p>";
    }
} else {
    echo "<p>✅ .env file exists</p>";
}

echo "<hr>";

// Step 2: Check storage permissions
echo "<h2>Step 2: Storage Permissions</h2>";
$storagePath = __DIR__ . '/storage';
if (is_dir($storagePath)) {
    echo "<p>✅ Storage directory exists</p>";

    // Try to make storage writable
    if (chmod($storagePath, 0755)) {
        echo "<p>✅ Storage permissions set to 755</p>";
    } else {
        echo "<p>❌ Failed to set storage permissions</p>";
    }

    // Check logs directory
    $logsPath = $storagePath . '/logs';
    if (is_dir($logsPath)) {
        if (chmod($logsPath, 0755)) {
            echo "<p>✅ Logs directory permissions set to 755</p>";
        }
    }
} else {
    echo "<p>❌ Storage directory not found</p>";
}

echo "<hr>";

// Step 3: Check bootstrap cache
echo "<h2>Step 3: Bootstrap Cache</h2>";
$bootstrapCachePath = __DIR__ . '/bootstrap/cache';
if (is_dir($bootstrapCachePath)) {
    echo "<p>✅ Bootstrap cache directory exists</p>";

    if (chmod($bootstrapCachePath, 0755)) {
        echo "<p>✅ Bootstrap cache permissions set to 755</p>";
    }
} else {
    echo "<p>❌ Bootstrap cache directory not found</p>";
}

echo "<hr>";

// Step 4: Check vendor directory
echo "<h2>Step 4: Vendor Directory</h2>";
if (is_dir(__DIR__ . '/vendor')) {
    echo "<p>✅ Vendor directory exists</p>";
} else {
    echo "<p>❌ Vendor directory missing - you need to run: composer install</p>";
}

echo "<hr>";

// Step 5: Check public build directory
echo "<h2>Step 5: Frontend Assets</h2>";
$buildPath = __DIR__ . '/public/build';
if (is_dir($buildPath)) {
    echo "<p>✅ Build directory exists</p>";

    $files = scandir($buildPath);
    $fileCount = count($files) - 2; // Exclude . and ..

    if ($fileCount > 0) {
        echo "<p>✅ Build directory has $fileCount files</p>";
    } else {
        echo "<p>❌ Build directory is empty - you need to run: npm run build</p>";
    }
} else {
    echo "<p>❌ Build directory missing - you need to run: npm run build</p>";
}

echo "<hr>";

// Step 6: Generate application key if missing
echo "<h2>Step 6: Application Key</h2>";
if (file_exists(__DIR__ . '/.env')) {
    $envContent = file_get_contents(__DIR__ . '/.env');
    if (strpos($envContent, 'APP_KEY=base64:') === false) {
        echo "<p>❌ APP_KEY is missing or not generated</p>";
        echo "<p>Run this command in cPanel Terminal:</p>";
        echo "<code>php artisan key:generate</code>";
    } else {
        echo "<p>✅ APP_KEY is set</p>";
    }
}

echo "<hr>";

// Step 7: Summary and next steps
echo "<h2>📋 Next Steps</h2>";
echo "<p>After running this script, you need to:</p>";
echo "<ol>";
echo "<li><strong>Edit .env file</strong> with your database credentials</li>";
echo "<li><strong>Install dependencies:</strong> <code>composer install</code></li>";
echo "<li><strong>Install Node.js dependencies:</strong> <code>npm install</code></li>";
echo "<li><strong>Build frontend assets:</strong> <code>npm run build:production</code></li>";
echo "<li><strong>Generate app key:</strong> <code>php artisan key:generate</code></li>";
echo "<li><strong>Run migrations:</strong> <code>php artisan migrate</code></li>";
echo "<li><strong>Clear caches:</strong> <code>php artisan config:clear</code></li>";
echo "</ol>";

echo "<p><strong>Run these commands in cPanel Terminal or SSH:</strong></p>";
echo "<pre style='background: #f5f5f5; padding: 10px; border: 1px solid #ddd;'>";
echo "cd public_html\n";
echo "composer install --no-dev --optimize-autoloader\n";
echo "npm install\n";
echo "npm run build:production\n";
echo "php artisan key:generate\n";
echo "php artisan migrate\n";
echo "php artisan config:clear\n";
echo "php artisan cache:clear\n";
echo "</pre>";
