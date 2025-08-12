<?php
// Debug file to check Laravel configuration and logs

echo "<h1>Laravel Debug Information</h1>";

// Check if .env exists and show key values
if (file_exists(__DIR__ . '/.env')) {
    echo "<h2>Environment File (.env)</h2>";
    $envContent = file_get_contents(__DIR__ . '/.env');
    $envLines = explode("\n", $envContent);

    foreach ($envLines as $line) {
        if (strpos($line, '=') !== false && !empty(trim($line))) {
            $parts = explode('=', $line, 2);
            $key = trim($parts[0]);
            $value = isset($parts[1]) ? trim($parts[1]) : '';

            // Hide sensitive information
            if (in_array($key, ['DB_PASSWORD', 'APP_KEY', 'MAIL_PASSWORD'])) {
                $value = '***HIDDEN***';
            }

            echo "<p><strong>$key:</strong> $value</p>";
        }
    }
} else {
    echo "<p>❌ .env file not found!</p>";
}

echo "<hr>";

// Check storage directory permissions
echo "<h2>Storage Directory Permissions</h2>";
$storagePath = __DIR__ . '/storage';
if (is_dir($storagePath)) {
    echo "<p>✅ Storage directory exists</p>";
    echo "<p>Storage permissions: " . substr(sprintf('%o', fileperms($storagePath)), -4) . "</p>";

    // Check if logs directory exists and is writable
    $logsPath = $storagePath . '/logs';
    if (is_dir($logsPath)) {
        echo "<p>✅ Logs directory exists</p>";
        echo "<p>Logs permissions: " . substr(sprintf('%o', fileperms($logsPath)), -4) . "</p>";

        // Check for Laravel log file
        $logFile = $logsPath . '/laravel.log';
        if (file_exists($logFile)) {
            echo "<p>✅ Laravel log file exists</p>";
            echo "<p>Log file size: " . filesize($logFile) . " bytes</p>";

            // Show last few lines of log
            echo "<h3>Last 10 lines of Laravel log:</h3>";
            $logContent = file($logFile);
            $lastLines = array_slice($logContent, -10);
            echo "<pre style='background: #f5f5f5; padding: 10px; border: 1px solid #ddd;'>";
            foreach ($lastLines as $line) {
                echo htmlspecialchars($line);
            }
            echo "</pre>";
        } else {
            echo "<p>❌ Laravel log file not found</p>";
        }
    } else {
        echo "<p>❌ Logs directory not found</p>";
    }
} else {
    echo "<p>❌ Storage directory not found!</p>";
}

echo "<hr>";

// Check if vendor autoloader works
echo "<h2>Composer Autoloader Test</h2>";
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "<p>✅ Vendor autoloader found</p>";

    try {
        require_once __DIR__ . '/vendor/autoload.php';
        echo "<p>✅ Autoloader loaded successfully</p>";

        // Try to load Laravel classes
        if (class_exists('Illuminate\Foundation\Application')) {
            echo "<p>✅ Laravel Application class found</p>";
        } else {
            echo "<p>❌ Laravel Application class not found</p>";
        }

        if (class_exists('Illuminate\Http\Request')) {
            echo "<p>✅ Laravel Request class found</p>";
        } else {
            echo "<p>❌ Laravel Request class not found</p>";
        }

    } catch (Exception $e) {
        echo "<p>❌ Error loading autoloader: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p>❌ Vendor autoloader not found!</p>";
}

echo "<hr>";

// Check bootstrap directory
echo "<h2>Bootstrap Directory Test</h2>";
$bootstrapPath = __DIR__ . '/bootstrap/app.php';
if (file_exists($bootstrapPath)) {
    echo "<p>✅ Bootstrap app.php found</p>";

    // Check if we can require it
    try {
        $app = require_once $bootstrapPath;
        echo "<p>✅ Bootstrap app.php loaded successfully</p>";

        if (is_object($app)) {
            echo "<p>✅ App object created: " . get_class($app) . "</p>";
        } else {
            echo "<p>❌ App object not created properly</p>";
        }

    } catch (Exception $e) {
        echo "<p>❌ Error loading bootstrap: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p>❌ Bootstrap app.php not found!</p>";
}

echo "<hr>";

// Check public build directory
echo "<h2>Frontend Assets Test</h2>";
$buildPath = __DIR__ . '/public/build';
if (is_dir($buildPath)) {
    echo "<p>✅ Build directory exists</p>";

    $files = scandir($buildPath);
    echo "<p>Files in build directory:</p><ul>";
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "<li>$file</li>";
        }
    }
    echo "</ul>";

    // Check for manifest file
    $manifestFile = $buildPath . '/manifest.json';
    if (file_exists($manifestFile)) {
        echo "<p>✅ Manifest file exists</p>";
        $manifest = json_decode(file_get_contents($manifestFile), true);
        if ($manifest) {
            echo "<p>✅ Manifest file is valid JSON</p>";
        } else {
            echo "<p>❌ Manifest file is not valid JSON</p>";
        }
    } else {
        echo "<p>❌ Manifest file not found</p>";
    }
} else {
    echo "<p>❌ Build directory not found!</p>";
}
