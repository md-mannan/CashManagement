<?php
/**
 * cPanel Photo Upload Fix Script
 * 
 * This script fixes common photo upload issues on cPanel hosting:
 * 1. Creates storage link
 * 2. Sets correct permissions
 * 3. Tests file access
 * 4. Provides diagnostic information
 * 
 * Usage: Upload this file to your domain root and visit it in browser
 * Example: https://yourdomain.com/fix-photo-upload.php
 * 
 * IMPORTANT: Remove this file after running it for security!
 */

// Prevent direct access if not in browser
if (php_sapi_name() === 'cli') {
    echo "This script should be run in a web browser for cPanel hosting.\n";
    exit(1);
}

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔧 cPanel Photo Upload Fix Script</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
    .warning { color: orange; font-weight: bold; }
    .info { color: blue; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
    .step { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
</style>";

// Function to check if Laravel is present
function isLaravelProject() {
    return file_exists('artisan') && file_exists('composer.json');
}

// Function to get project root
function getProjectRoot() {
    $currentDir = __DIR__;
    
    // If we're in public directory, go up one level
    if (basename($currentDir) === 'public') {
        return dirname($currentDir);
    }
    
    // If we're in the root, check if it's a Laravel project
    if (isLaravelProject()) {
        return $currentDir;
    }
    
    // Try to find Laravel project
    $parentDir = dirname($currentDir);
    if (file_exists($parentDir . '/artisan')) {
        return $parentDir;
    }
    
    return $currentDir;
}

$projectRoot = getProjectRoot();
$publicDir = $projectRoot . '/public';
$storageDir = $projectRoot . '/storage';
$publicStorageDir = $publicDir . '/storage';

echo "<div class='step'>";
echo "<h2>📋 System Information</h2>";
echo "<p><strong>Project Root:</strong> {$projectRoot}</p>";
echo "<p><strong>Public Directory:</strong> {$publicDir}</p>";
echo "<p><strong>Storage Directory:</strong> {$storageDir}</p>";
echo "<p><strong>Public Storage:</strong> {$publicStorageDir}</p>";
echo "<p><strong>PHP Version:</strong> " . PHP_VERSION . "</p>";
echo "<p><strong>Current User:</strong> " . get_current_user() . "</p>";
echo "</div>";

// Step 1: Check Laravel Installation
echo "<div class='step'>";
echo "<h2>🔍 Step 1: Laravel Installation Check</h2>";

if (!isLaravelProject()) {
    echo "<p class='error'>❌ Laravel not detected in current directory.</p>";
    echo "<p>Please upload this script to your Laravel project root or public directory.</p>";
    exit;
}

echo "<p class='success'>✅ Laravel project detected!</p>";
echo "</div>";

// Step 2: Check Storage Directory
echo "<div class='step'>";
echo "<h2>📁 Step 2: Storage Directory Check</h2>";

if (!is_dir($storageDir)) {
    echo "<p class='error'>❌ Storage directory not found: {$storageDir}</p>";
    exit;
}

if (!is_dir($storageDir . '/app/public')) {
    echo "<p class='error'>❌ Storage/app/public directory not found</p>";
    echo "<p>Creating storage/app/public directory...</p>";
    mkdir($storageDir . '/app/public', 0755, true);
}

echo "<p class='success'>✅ Storage directory exists</p>";

// Check storage permissions
$storagePerms = substr(sprintf('%o', fileperms($storageDir)), -4);
echo "<p><strong>Storage Permissions:</strong> {$storagePerms}</p>";

if ($storagePerms !== '0755') {
    echo "<p class='warning'>⚠️ Storage permissions should be 755</p>";
}
echo "</div>";

// Step 3: Create Storage Link
echo "<div class='step'>";
echo "<h2>🔗 Step 3: Storage Link Creation</h2>";

// Remove existing broken link
if (is_link($publicStorageDir)) {
    echo "<p>Removing existing storage link...</p>";
    unlink($publicStorageDir);
}

// Create storage link
if (!is_dir($publicStorageDir)) {
    echo "<p>Creating storage link...</p>";
    
    // Try using symlink
    if (symlink($storageDir . '/app/public', $publicStorageDir)) {
        echo "<p class='success'>✅ Storage link created successfully using symlink</p>";
    } else {
        echo "<p class='warning'>⚠️ Symlink failed, trying alternative method...</p>";
        
        // Alternative: Copy files
        if (!is_dir($publicStorageDir)) {
            mkdir($publicStorageDir, 0755, true);
        }
        
        // Copy files from storage to public
        $source = $storageDir . '/app/public';
        if (is_dir($source)) {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::SELF_FIRST
            );
            
            foreach ($files as $file) {
                $target = $publicStorageDir . '/' . $files->getSubPathName();
                
                if ($file->isDir()) {
                    if (!is_dir($target)) {
                        mkdir($target, 0755, true);
                    }
                } else {
                    copy($file, $target);
                }
            }
            echo "<p class='success'>✅ Files copied to public/storage</p>";
        }
    }
} else {
    echo "<p class='success'>✅ Storage link already exists</p>";
}

// Verify storage link
if (is_dir($publicStorageDir)) {
    echo "<p class='success'>✅ Public storage directory accessible</p>";
} else {
    echo "<p class='error'>❌ Public storage directory not accessible</p>";
}
echo "</div>";

// Step 4: Set Permissions
echo "<div class='step'>";
echo "<h2>🔐 Step 4: Setting Permissions</h2>";

// Set storage permissions
$directories = [
    $storageDir,
    $storageDir . '/app',
    $storageDir . '/app/public',
    $publicStorageDir
];

foreach ($directories as $dir) {
    if (is_dir($dir)) {
        chmod($dir, 0755);
        echo "<p>Set permissions 755 on: " . basename($dir) . "</p>";
    }
}

// Set file permissions
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($storageDir . '/app/public', RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::LEAVES_ONLY
);

foreach ($files as $file) {
    if ($file->isFile()) {
        chmod($file->getPathname(), 0644);
    }
}

echo "<p class='success'>✅ Permissions set successfully</p>";
echo "</div>";

// Step 5: Test File Access
echo "<div class='step'>";
echo "<h2>🧪 Step 5: File Access Test</h2>";

// Create a test file
$testFile = $storageDir . '/app/public/test-image.txt';
$testContent = "This is a test file created at " . date('Y-m-d H:i:s');
file_put_contents($testFile, $testContent);

$testUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/storage/test-image.txt';
echo "<p><strong>Test File URL:</strong> <a href='{$testUrl}' target='_blank'>{$testUrl}</a></p>";

// Test if file is accessible
$headers = get_headers($testUrl);
if ($headers && strpos($headers[0], '200') !== false) {
    echo "<p class='success'>✅ Test file accessible via web</p>";
} else {
    echo "<p class='error'>❌ Test file not accessible via web</p>";
    echo "<p>Headers: " . implode(', ', $headers) . "</p>";
}

// Clean up test file
unlink($testFile);
echo "</div>";

// Step 6: Diagnostic Information
echo "<div class='step'>";
echo "<h2>📊 Step 6: Diagnostic Information</h2>";

echo "<h3>Directory Status:</h3>";
$dirs = [
    'Storage Root' => $storageDir,
    'Storage App' => $storageDir . '/app',
    'Storage Public' => $storageDir . '/app/public',
    'Public Storage' => $publicStorageDir
];

foreach ($dirs as $name => $dir) {
    $exists = is_dir($dir) ? '✅ Exists' : '❌ Missing';
    $readable = is_readable($dir) ? '✅ Readable' : '❌ Not Readable';
    $writable = is_writable($dir) ? '✅ Writable' : '❌ Not Writable';
    $perms = is_dir($dir) ? substr(sprintf('%o', fileperms($dir)), -4) : 'N/A';
    
    echo "<p><strong>{$name}:</strong> {$exists} | {$readable} | {$writable} | Perms: {$perms}</p>";
}

echo "<h3>Profile Photos Directory:</h3>";
$profilePhotosDir = $storageDir . '/app/public/profile-photos';
if (is_dir($profilePhotosDir)) {
    $files = scandir($profilePhotosDir);
    $photoFiles = array_filter($files, function($file) {
        return !in_array($file, ['.', '..']) && is_file($profilePhotosDir . '/' . $file);
    });
    
    echo "<p class='success'>✅ Profile photos directory exists</p>";
    echo "<p><strong>Files found:</strong> " . count($photoFiles) . "</p>";
    
    if (!empty($photoFiles)) {
        echo "<ul>";
        foreach (array_slice($photoFiles, 0, 5) as $file) {
            $fileUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/storage/profile-photos/' . $file;
            echo "<li><a href='{$fileUrl}' target='_blank'>{$file}</a></li>";
        }
        if (count($photoFiles) > 5) {
            echo "<li>... and " . (count($photoFiles) - 5) . " more files</li>";
        }
        echo "</ul>";
    }
} else {
    echo "<p class='warning'>⚠️ Profile photos directory not found</p>";
    echo "<p>Creating profile photos directory...</p>";
    mkdir($profilePhotosDir, 0755, true);
    echo "<p class='success'>✅ Profile photos directory created</p>";
}
echo "</div>";

// Step 7: Recommendations
echo "<div class='step'>";
echo "<h2>💡 Step 7: Recommendations</h2>";

echo "<h3>Next Steps:</h3>";
echo "<ol>";
echo "<li>Try uploading a new profile photo</li>";
echo "<li>Check if the photo appears in the UI</li>";
echo "<li>Test downloading the photo</li>";
echo "<li>Check if the avatar appears in navigation</li>";
echo "</ol>";

echo "<h3>If Issues Persist:</h3>";
echo "<ol>";
echo "<li>Check your .htaccess file for proper image handling</li>";
echo "<li>Contact your hosting provider about symbolic link support</li>";
echo "<li>Consider using the file copy method instead of symlinks</li>";
echo "<li>Check server error logs for additional information</li>";
echo "</ol>";

echo "<h3>Security Note:</h3>";
echo "<p class='warning'>⚠️ IMPORTANT: Remove this file after running it for security!</p>";
echo "<p>Delete: " . __FILE__ . "</p>";
echo "</div>";

echo "<div class='step'>";
echo "<h2>✅ Fix Complete!</h2>";
echo "<p class='success'>The photo upload fix has been applied. Please test your photo upload functionality now.</p>";
echo "<p><a href='javascript:location.reload()'>🔄 Refresh Page</a> | <a href='/' target='_blank'>🏠 Go to Homepage</a></p>";
echo "</div>";
?>
