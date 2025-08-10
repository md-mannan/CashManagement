<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing ActivityLog table...\n";

try {
    $count = \App\Models\ActivityLog::count();
    echo "SUCCESS - Found {$count} activity logs\n";

    // Test if we can create a test log
    $testLog = \App\Models\ActivityLog::create([
        'user_id' => null,
        'action' => 'test_action',
        'description' => 'Test activity log entry',
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test Script',
    ]);

    echo "SUCCESS - Created test activity log with ID: {$testLog->id}\n";

    // Clean up test log
    $testLog->delete();
    echo "SUCCESS - Cleaned up test log\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
