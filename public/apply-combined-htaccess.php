<?php
/**
 * Apply Combined .htaccess Configuration
 * This script applies the combined .htaccess file with storage access rules
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type
header('Content-Type: text/html; charset=utf-8');

echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apply Combined .htaccess - Cash Management System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #007bff; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .success { background: #28a745; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .warning { background: #ffc107; color: black; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { background: #dc3545; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .info { background: #17a2b8; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #0056b3; }
        .btn-success { background: #28a745; }
        .btn-warning { background: #ffc107; color: black; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 Apply Combined .htaccess Configuration</h1>
            <p>This will apply the combined .htaccess file with storage access rules for photo serving</p>
        </div>';

// Check if combined .htaccess file exists
if (!file_exists('.htaccess.combined')) {
    echo '<div class="error">❌ Combined .htaccess file not found!</div>';
    echo '<div class="info">Please ensure .htaccess.combined exists in the same directory.</div>';
    echo '</div></body></html>';
    exit;
}

// Handle form submission
if ($_POST['action'] ?? false) {
    $action = $_POST['action'];
    
    echo '<div class="section">
        <h2>🔧 Executing Action: ' . ucwords(str_replace('_', ' ', $action)) . '</h2>';
    
    switch ($action) {
        case 'backup_current':
            echo '<div class="info">💾 Creating backup of current .htaccess...</div>';
            
            if (file_exists('.htaccess')) {
                $backupName = '.htaccess.backup.' . date('Y-m-d-H-i-s');
                if (copy('.htaccess', $backupName)) {
                    echo '<div class="success">✓ Current .htaccess backed up as: ' . $backupName . '</div>';
                } else {
                    echo '<div class="error">✗ Failed to create backup</div>';
                }
            } else {
                echo '<div class="warning">⚠️ No existing .htaccess file to backup</div>';
            }
            break;
            
        case 'apply_combined':
            echo '<div class="info">📄 Applying combined .htaccess configuration...</div>';
            
            // Read the combined .htaccess content
            $combinedContent = file_get_contents('.htaccess.combined');
            
            if ($combinedContent === false) {
                echo '<div class="error">✗ Failed to read combined .htaccess file</div>';
                break;
            }
            
            // Write to .htaccess
            if (file_put_contents('.htaccess', $combinedContent)) {
                echo '<div class="success">✓ Combined .htaccess applied successfully</div>';
                echo '<div class="info">📝 The new .htaccess includes:</div>';
                echo '<ul>';
                echo '<li>✓ Your original cPanel configuration</li>';
                echo '<li>✓ Storage access rules for photos</li>';
                echo '<li>✓ Proper MIME types for images</li>';
                echo '<li>✓ Security headers and file protection</li>';
                echo '<li>✓ Performance optimizations</li>';
                echo '</ul>';
            } else {
                echo '<div class="error">✗ Failed to write .htaccess file</div>';
            }
            break;
            
        case 'restore_backup':
            echo '<div class="info">🔄 Restoring from backup...</div>';
            
            $backupFiles = glob('.htaccess.backup.*');
            if (empty($backupFiles)) {
                echo '<div class="error">✗ No backup files found</div>';
                break;
            }
            
            // Get the most recent backup
            $latestBackup = max($backupFiles);
            
            if (copy($latestBackup, '.htaccess')) {
                echo '<div class="success">✓ Restored from backup: ' . basename($latestBackup) . '</div>';
            } else {
                echo '<div class="error">✗ Failed to restore from backup</div>';
            }
            break;
    }
    
    echo '</div>';
}

// Show current status
echo '<div class="section">
    <h2>📊 Current Status</h2>';

if (file_exists('.htaccess')) {
    $currentContent = file_get_contents('.htaccess');
    $hasStorageRules = strpos($currentContent, 'storage/') !== false;
    $hasPhotoMimeTypes = strpos($currentContent, 'image/jpeg') !== false;
    
    echo '<div class="info">📄 Current .htaccess file exists</div>';
    echo '<ul>';
    echo $hasStorageRules ? '<li class="success">✓ Storage access rules present</li>' : '<li class="warning">⚠ Storage access rules missing</li>';
    echo $hasPhotoMimeTypes ? '<li class="success">✓ Photo MIME types configured</li>' : '<li class="warning">⚠ Photo MIME types missing</li>';
    echo '</ul>';
} else {
    echo '<div class="warning">⚠️ No .htaccess file found</div>';
}

// Check for backup files
$backupFiles = glob('.htaccess.backup.*');
if (!empty($backupFiles)) {
    echo '<div class="info">💾 Backup files available:</div>';
    echo '<ul>';
    foreach ($backupFiles as $backup) {
        echo '<li>' . basename($backup) . '</li>';
    }
    echo '</ul>';
}

echo '</div>';

// Action buttons
echo '<div class="section">
    <h2>🔧 Actions</h2>
    <p>Choose an action to perform:</p>
    
    <form method="post" style="margin: 10px 0;">
        <button type="submit" name="action" value="backup_current" class="btn btn-warning">💾 Backup Current .htaccess</button>
        <button type="submit" name="action" value="apply_combined" class="btn btn-success">📄 Apply Combined .htaccess</button>
        <button type="submit" name="action" value="restore_backup" class="btn btn-warning">🔄 Restore from Backup</button>
    </form>
</div>';

// Instructions
echo '<div class="section">
    <h2>📝 What This Does</h2>
    <p>The combined .htaccess file includes:</p>
    <ul>
        <li><strong>Your Original Configuration:</strong> All your existing cPanel settings</li>
        <li><strong>Storage Access Rules:</strong> Allows direct access to /storage/ files</li>
        <li><strong>Photo MIME Types:</strong> Proper content types for images</li>
        <li><strong>Security Headers:</strong> Updated CSP to allow blob URLs for photos</li>
        <li><strong>Performance Optimizations:</strong> Caching rules for images</li>
        <li><strong>LiteSpeed Compatibility:</strong> Additional rewrite rules for LiteSpeed</li>
    </ul>
</div>';

// Next steps
echo '<div class="section">
    <h2>🚀 Next Steps</h2>
    <ol>
        <li><strong>Backup Current:</strong> Create a backup of your current .htaccess</li>
        <li><strong>Apply Combined:</strong> Apply the new combined configuration</li>
        <li><strong>Test Photos:</strong> Try uploading and viewing profile photos</li>
        <li><strong>Check Storage:</strong> Ensure storage link exists (run fix-photo-404-error.php if needed)</li>
        <li><strong>Restore if Needed:</strong> Use the restore option if issues occur</li>
    </ol>
</div>';

echo '</div></body></html>';
?>
