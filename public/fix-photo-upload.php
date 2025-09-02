<?php
// Photo Upload Fix Script for cPanel
// Visit: https://yourdomain.com/fix-photo-upload.php

header('Content-Type: text/plain; charset=utf-8');

echo "=== Photo Upload Fix Script ===\n\n";

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

echo "\n=== Step 1: Creating Storage Directories ===\n";

// Create storage directories if they don't exist
$directories = [
    '../storage/app/public',
    '../storage/app/public/profile-photos',
    './storage',
    './storage/profile-photos'
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        if (mkdir($dir, 0755, true)) {
            echo "✓ Created directory: $dir\n";
        } else {
            echo "✗ Failed to create directory: $dir\n";
        }
    } else {
        echo "✓ Directory exists: $dir\n";
    }
}

echo "\n=== Step 2: Setting File Permissions ===\n";

// Set permissions for storage directories
$storageDirs = [
    '../storage',
    '../storage/app',
    '../storage/app/public',
    '../storage/app/public/profile-photos',
    './storage',
    './storage/profile-photos'
];

foreach ($storageDirs as $dir) {
    if (is_dir($dir)) {
        if (chmod($dir, 0755)) {
            echo "✓ Set permissions 755 for: $dir\n";
        } else {
            echo "✗ Failed to set permissions for: $dir\n";
        }
    }
}

echo "\n=== Step 3: Creating Storage Symbolic Link ===\n";

// Remove existing storage link if it exists
if (is_link('./storage')) {
    unlink('./storage');
    echo "✓ Removed existing storage link\n";
}

// Create new storage link
try {
    // Try using Laravel's storage:link command
    $output = shell_exec('cd .. && php artisan storage:link 2>&1');
    echo "✓ Storage link created via artisan command\n";
    echo "Output: $output\n";
} catch (Exception $e) {
    echo "✗ Failed to create storage link via artisan: " . $e->getMessage() . "\n";
    
    // Fallback: Create link manually
    try {
        if (symlink('../storage/app/public', './storage')) {
            echo "✓ Storage link created manually\n";
        } else {
            echo "✗ Failed to create storage link manually\n";
            
            // Last resort: Copy files
            echo "Attempting to copy files instead...\n";
            $source = '../storage/app/public';
            $destination = './storage';
            
            if (is_dir($source)) {
                // Copy all files from source to destination
                $files = glob($source . '/*');
                foreach ($files as $file) {
                    $destFile = $destination . '/' . basename($file);
                    if (is_file($file)) {
                        copy($file, $destFile);
                    } elseif (is_dir($file)) {
                        // Recursively copy directory
                        copyDirectory($file, $destFile);
                    }
                }
                echo "✓ Files copied from storage to public/storage\n";
            }
        }
    } catch (Exception $e2) {
        echo "✗ Failed to create storage link or copy files: " . $e2->getMessage() . "\n";
    }
}

echo "\n=== Step 4: Updating .htaccess for Image Support ===\n";

// Check if .htaccess exists and update it
$htaccessPath = './.htaccess';
$htaccessContent = '';

if (file_exists($htaccessPath)) {
    $htaccessContent = file_get_contents($htaccessPath);
    echo "✓ .htaccess file found\n";
} else {
    echo "✗ .htaccess file not found\n";
}

// Add image MIME type support if not present
$imageMimeTypes = '
# Image MIME Types
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType image/webp .webp
</IfModule>

# Allow access to storage files
<Directory "storage">
    <IfModule mod_authz_core.c>
        Require all granted
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Allow from all
    </IfModule>
</Directory>

# Handle image files properly
<FilesMatch "\.(jpg|jpeg|png|gif|webp)$">
    Header set Content-Type "image/$1"
    Header set Cache-Control "public, max-age=31536000"
</FilesMatch>
';

if (strpos($htaccessContent, 'AddType image/jpeg') === false) {
    // Append the image support to .htaccess
    $htaccessContent .= $imageMimeTypes;
    if (file_put_contents($htaccessPath, $htaccessContent)) {
        echo "✓ Updated .htaccess with image support\n";
    } else {
        echo "✗ Failed to update .htaccess\n";
    }
} else {
    echo "✓ .htaccess already has image support\n";
}

echo "\n=== Step 5: Clearing Laravel Caches ===\n";

// Clear Laravel caches
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

echo "\n=== Step 6: Testing File Upload ===\n";

// Test if we can create a test file
$testFile = './storage/test-upload.txt';
$testContent = 'Test file created at ' . date('Y-m-d H:i:s');

if (file_put_contents($testFile, $testContent)) {
    echo "✓ Test file created successfully\n";
    
    // Test if we can read it back
    if (file_get_contents($testFile) === $testContent) {
        echo "✓ Test file can be read back\n";
    } else {
        echo "✗ Test file cannot be read back\n";
    }
    
    // Clean up test file
    unlink($testFile);
    echo "✓ Test file cleaned up\n";
} else {
    echo "✗ Failed to create test file\n";
}

echo "\n=== Step 7: Database Check ===\n";

try {
    $connection = \DB::connection();
    $pdo = $connection->getPdo();
    echo "✓ Database connection successful\n";
    
    // Check ProfilePhoto model
    $profilePhotos = \App\Models\ProfilePhoto::all();
    echo "✓ ProfilePhoto model works - Found " . $profilePhotos->count() . " photos\n";
    
    // Test storage URL generation
    if ($profilePhotos->count() > 0) {
        $testPhoto = $profilePhotos->first();
        $storage = \Storage::disk('public');
        $url = $storage->url($testPhoto->file_path);
        echo "✓ Storage URL generated: $url\n";
    }
    
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== Fix Complete ===\n";
echo "Your photo upload system should now work properly!\n";
echo "Try uploading a new profile photo and see if it works.\n";
echo "\nIf you still have issues:\n";
echo "1. Check the diagnostic script: /photo-diagnostic.php\n";
echo "2. Contact your hosting provider about file permissions\n";
echo "3. Ensure your hosting supports symbolic links\n";
echo "\nRemove this file after successful fix for security!\n";

// Helper function for copying directories
function copyDirectory($source, $destination) {
    if (!is_dir($destination)) {
        mkdir($destination, 0755, true);
    }
    
    $files = glob($source . '/*');
    foreach ($files as $file) {
        $destFile = $destination . '/' . basename($file);
        if (is_file($file)) {
            copy($file, $destFile);
        } elseif (is_dir($file)) {
            copyDirectory($file, $destFile);
        }
    }
}
