<?php

namespace App\Console\Commands;


use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CreateSampleActivityLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-sample-activity-logs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create sample activity logs for testing the system audit functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating sample activity logs...');

        // Get a user to associate with the logs
        $user = User::first();
        if (!$user) {
            $this->error('No users found in the database. Please create a user first.');
            return 1;
        }

        // Sample activities to create
        $activities = [
            [
                'user_id' => $user->id,
                'action' => 'user_login',
                'target_type' => User::class,
                'target_id' => $user->id,
                'description' => "User {$user->name} logged in successfully",
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'properties' => ['email' => $user->email, 'role' => $user->role ?? 'user'],
                'created_at' => now()->subHours(2),
            ],
            [
                'user_id' => $user->id,
                'action' => 'user_updated',
                'target_type' => User::class,
                'target_id' => $user->id,
                'description' => "User {$user->name} updated their profile",
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'properties' => ['changes' => ['name', 'email']],
                'created_at' => now()->subHours(4),
            ],
            [
                'user_id' => $user->id,
                'action' => 'admin_action',
                'target_type' => null,
                'target_id' => null,
                'description' => "User {$user->name} accessed admin dashboard",
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'properties' => ['action' => 'dashboard_access', 'role' => $user->role ?? 'user'],
                'created_at' => now()->subHours(6),
            ],
            [
                'user_id' => $user->id,
                'action' => 'system_maintenance',
                'target_type' => null,
                'target_id' => null,
                'description' => "System maintenance performed by {$user->name}",
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'properties' => ['maintenance_type' => 'database_optimization'],
                'created_at' => now()->subHours(8),
            ],
            [
                'user_id' => $user->id,
                'action' => 'user_logout',
                'target_type' => User::class,
                'target_id' => $user->id,
                'description' => "User {$user->name} logged out",
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'properties' => ['email' => $user->email, 'role' => $user->role ?? 'user'],
                'created_at' => now()->subHours(10),
            ],
        ];

        // Create the activity logs
        foreach ($activities as $activityData) {
            ActivityLog::create($activityData);
        }

        $this->info('Successfully created ' . count($activities) . ' sample activity logs!');
        $this->info('You can now view them in the System Audit page.');

        return 0;
    }
}
