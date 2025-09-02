<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        if (!User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
                'role' => 'admin',
                'permissions' => [
                    'view_dashboard',
                    'manage_transactions',
                    'view_reports',
                    'manage_users',
                    'view_analytics',
                    'manage_categories',
                    'manage_settings',
                    'view_logs',
                    'view_all_transactions',
                    'view_all_user_data',
                    'access_ledger',
                    'manage_categories',
                    'export_data',
                    'perform_bulk_operations',
                    'manage_notifications',
                    'view_activity_logs'
                ],
                'is_active' => true,
                'last_login_at' => now(),
            ]);

            $this->command->info('Admin user created successfully!');
            $this->command->info('Email: admin@example.com');
            $this->command->info('Password: admin123');
        } else {
            $this->command->info('Admin user already exists.');
        }
    }
}
