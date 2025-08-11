<?php
// Simple installation status check
// This file helps verify if the installer is working correctly

echo "<h1>Cash Management System - Installation Check</h1>";

// Check if .env exists
if (file_exists('../.env')) {
    echo "<p>✅ .env file exists</p>";

    $envContent = file_get_contents('../.env');

    // Check APP_INSTALLED
    if (strpos($envContent, 'APP_INSTALLED=true') !== false) {
        echo "<p>✅ Application is marked as INSTALLED</p>";
        echo "<p><a href='/'>Go to Application</a></p>";
    } else {
        echo "<p>❌ Application is NOT installed (APP_INSTALLED not set to true)</p>";
        echo "<p><a href='/install'>Go to Installer</a></p>";
    }

    // Show key environment variables
    echo "<h3>Environment Variables:</h3>";
    $lines = explode("\n", $envContent);
    foreach ($lines as $line) {
        if (strpos($line, 'APP_') === 0 || strpos($line, 'DB_') === 0) {
            echo "<p><code>$line</code></p>";
        }
    }
} else {
    echo "<p>❌ .env file does not exist</p>";
    echo "<p><a href='/install'>Go to Installer</a></p>";
}

echo "<hr>";
echo "<p><strong>Current Directory:</strong> " . __DIR__ . "</p>";
echo "<p><strong>Parent Directory:</strong> " . dirname(__DIR__) . "</p>";
echo "<p><strong>Base Path:</strong> " . realpath(dirname(__DIR__)) . "</p>";
?>
