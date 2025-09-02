<?php
// Diagnostic Script for 500 Error
// Visit: https://accounts.mannnan.space/diagnostic-500-error.php

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>500 Error Diagnostic</title>
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
<h1>🔍 500 Error Diagnostic</h1>";

echo "<div class='step'>
<h2>Step 1: Check Laravel Bootstrap</h2>";

// Check if Laravel can bootstrap
try {
    if (!file_exists('vendor/autoload.php')) {
        echo "<div class='error'>❌ vendor/autoload.php not found</div>";
        exit;
    }
    
    require_once 'vendor/autoload.php';
    echo "<div class='success'>✅ vendor/autoload.php loaded</div>";
    
    if (!file_exists('bootstrap/app.php')) {
        echo "<div class='error'>❌ bootstrap/app.php not found</div>";
        exit;
    }
    
    $app = require_once 'bootstrap/app.php';
    echo "<div class='success'>✅ bootstrap/app.php loaded</div>";
    
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    echo "<div class='success'>✅ Laravel bootstrapped successfully</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Laravel bootstrap failed: " . $e->getMessage() . "</div>";
    echo "<div class='code'>Stack trace: " . $e->getTraceAsString() . "</div>";
    exit;
}

echo "</div>";

echo "<div class='step'>
<h2>Step 2: Check .htaccess File</h2>";

// Check .htaccess file
$htaccessPath = './.htaccess';
if (file_exists($htaccessPath)) {
    $htaccessContent = file_get_contents($htaccessPath);
    echo "<div class='success'>✅ .htaccess file exists</div>";
    
    // Check for syntax errors
    if (strpos($htaccessContent, 'Directory "storage"') !== false) {
        echo "<div class='info'>ℹ️ Storage directory rules found</div>";
    }
    
    // Check for potential issues
    if (strpos($htaccessContent, 'Require all granted') !== false) {
        echo "<div class='info'>ℹ️ Access rules found</div>";
    }
    
    // Show first few lines
    $lines = explode("\n", $htaccessContent);
    $firstLines = array_slice($lines, 0, 10);
    echo "<div class='code'>First 10 lines of .htaccess:<br>" . htmlspecialchars(implode("\n", $firstLines)) . "</div>";
    
} else {
    echo "<div class='error'>❌ .htaccess file not found</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 3: Check Storage Directory</h2>";

// Check storage directory
if (is_dir('./storage')) {
    echo "<div class='success'>✅ Storage directory exists</div>";
    
    if (is_link('./storage')) {
        echo "<div class='info'>ℹ️ Storage is a symbolic link</div>";
    } else {
        echo "<div class='info'>ℹ️ Storage is a regular directory</div>";
    }
    
    // Check permissions
    $perms = substr(sprintf('%o', fileperms('./storage')), -4);
    echo "<div class='info'>ℹ️ Storage permissions: $perms</div>";
    
    // Check if storage/.htaccess exists
    if (file_exists('./storage/.htaccess')) {
        echo "<div class='success'>✅ storage/.htaccess exists</div>";
    } else {
        echo "<div class='warning'>⚠️ storage/.htaccess not found</div>";
    }
    
} else {
    echo "<div class='error'>❌ Storage directory not found</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 4: Check PHP Error Log</h2>";

// Try to get PHP error log
$errorLog = ini_get('error_log');
if ($errorLog && file_exists($errorLog)) {
    echo "<div class='success'>✅ Error log found: $errorLog</div>";
    
    // Get last few lines
    $lines = file($errorLog);
    $lastLines = array_slice($lines, -10);
    echo "<div class='code'>Last 10 lines of error log:<br>" . htmlspecialchars(implode("", $lastLines)) . "</div>";
} else {
    echo "<div class='warning'>⚠️ Error log not found or not accessible</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 5: Test Laravel Routes</h2>";

// Test if Laravel routes are working
try {
    $router = $app->make('router');
    echo "<div class='success'>✅ Router loaded</div>";
    
    // Test a simple route
    $routes = $router->getRoutes();
    echo "<div class='info'>ℹ️ Found " . count($routes) . " routes</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Router test failed: " . $e->getMessage() . "</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 6: Check Environment Configuration</h2>";

// Check environment
try {
    $env = $app->environment();
    echo "<div class='success'>✅ Environment: $env</div>";
    
    $debug = config('app.debug');
    echo "<div class='info'>ℹ️ Debug mode: " . ($debug ? 'ON' : 'OFF') . "</div>";
    
    $url = config('app.url');
    echo "<div class='info'>ℹ️ App URL: $url</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Environment check failed: " . $e->getMessage() . "</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 7: Fix Potential Issues</h2>";

// Create a backup of .htaccess
$htaccessBackup = './.htaccess.backup.' . date('Y-m-d-H-i-s');
if (file_exists($htaccessPath)) {
    copy($htaccessPath, $htaccessBackup);
    echo "<div class='success'>✅ Created .htaccess backup: " . basename($htaccessBackup) . "</div>";
}

// Create a minimal .htaccess for testing
$minimalHtaccess = '<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>';

if (file_put_contents('./.htaccess.minimal', $minimalHtaccess)) {
    echo "<div class='success'>✅ Created minimal .htaccess for testing</div>";
    echo "<div class='info'>ℹ️ To test with minimal .htaccess, rename .htaccess to .htaccess.broken and .htaccess.minimal to .htaccess</div>";
}

echo "</div>";

echo "<div class='step'>
<h2>Step 8: Recommendations</h2>";

echo "<div class='warning'>⚠️ Based on the diagnostic, here are the most likely causes:</div>";

echo "<ol>";
echo "<li><strong>.htaccess Syntax Error:</strong> The storage rules may have syntax issues</li>";
echo "<li><strong>Storage Directory Issues:</strong> The storage directory may be causing conflicts</li>";
echo "<li><strong>Laravel Configuration:</strong> Environment or configuration issues</li>";
echo "<li><strong>PHP Memory/Timeout:</strong> Server resource limitations</li>";
echo "</ol>";

echo "<p><strong>Immediate Actions:</strong></p>";
echo "<ol>";
echo "<li>Try the minimal .htaccess file to isolate the issue</li>";
echo "<li>Check if the error persists with minimal configuration</li>";
echo "<li>Restore from backup if needed</li>";
echo "<li>Contact hosting provider if issues persist</li>";
echo "</ol>";

echo "</div>";

echo "<div class='step'>
<h2>Quick Fix Options</h2>";

echo "<div style='text-align: center; margin: 20px 0;'>";
echo "<a href='?action=restore-htaccess' class='button'>🔄 Restore .htaccess from Backup</a>";
echo "<a href='?action=use-minimal' class='button'>🔧 Use Minimal .htaccess</a>";
echo "<a href='?action=remove-storage' class='button'>🗑️ Remove Storage Directory</a>";
echo "</div>";

// Handle actions
if (isset($_GET['action'])) {
    $action = $_GET['action'];
    
    if ($action === 'restore-htaccess') {
        // Find latest backup
        $backups = glob('./.htaccess.backup.*');
        if (!empty($backups)) {
            $latestBackup = end($backups);
            if (copy($latestBackup, './.htaccess')) {
                echo "<div class='success'>✅ .htaccess restored from backup</div>";
            } else {
                echo "<div class='error'>❌ Failed to restore .htaccess</div>";
            }
        } else {
            echo "<div class='error'>❌ No backup found</div>";
        }
    }
    
    if ($action === 'use-minimal') {
        if (file_exists('./.htaccess.minimal')) {
            if (copy('./.htaccess.minimal', './.htaccess')) {
                echo "<div class='success'>✅ Minimal .htaccess applied</div>";
            } else {
                echo "<div class='error'>❌ Failed to apply minimal .htaccess</div>";
            }
        } else {
            echo "<div class='error'>❌ Minimal .htaccess not found</div>";
        }
    }
    
    if ($action === 'remove-storage') {
        if (is_dir('./storage')) {
            if (is_link('./storage')) {
                unlink('./storage');
            } else {
                system("rm -rf ./storage");
            }
            echo "<div class='success'>✅ Storage directory removed</div>";
        } else {
            echo "<div class='info'>ℹ️ Storage directory not found</div>";
        }
    }
}

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
