<?php
// Simple test file to check basic functionality

echo "<h1>PHP Test</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Check if vendor directory exists
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "<p>✅ Vendor directory found</p>";
} else {
    echo "<p>❌ Vendor directory not found</p>";
}

// Check if bootstrap directory exists
if (file_exists(__DIR__ . '/bootstrap/app.php')) {
    echo "<p>✅ Bootstrap directory found</p>";
} else {
    echo "<p>❌ Bootstrap directory not found</p>";
}

// Check if storage directory exists
if (file_exists(__DIR__ . '/storage/framework/maintenance.php')) {
    echo "<p>✅ Storage directory found</p>";
} else {
    echo "<p>❌ Storage directory not found</p>";
}

// Check if .env file exists
if (file_exists(__DIR__ . '/.env')) {
    echo "<p>✅ .env file found</p>";
} else {
    echo "<p>❌ .env file not found</p>";
}

echo "<hr>";
echo "<p><strong>Current Directory:</strong> " . __DIR__ . "</p>";
echo "<p><strong>Files in current directory:</strong></p>";
echo "<ul>";
$files = scandir(__DIR__);
foreach ($files as $file) {
    if ($file != '.' && $file != '..') {
        echo "<li>" . $file . "</li>";
    }
}
echo "</ul>";
