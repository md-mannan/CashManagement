<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create super admin user if it doesn't exist
        if (!User::where('email', 'admin@cashmanagement.com')->exists()) {
            User::create([
                'name' => 'Super Admin',
                'email' => 'admin@cashmanagement.com',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
                'role' => 'super_admin',
                'permissions' => [
                    'manage_users',
                    'manage_admins',
                    'view_analytics',
                    'manage_transactions',
                    'manage_categories',
                    'manage_settings',
                    'view_all_transactions',
                    'view_all_user_data',
                    'access_ledger',
                    'manage_system_settings',
                    'view_system_logs',
                    'export_data',
                    'perform_bulk_operations',
                    'manage_exchange_rates',
                    'manage_currencies',
                    'manage_appearance',
                    'view_activity_logs',
                    'manage_notifications',
                    'system_audit',
                    'full_system_access'
                ],
                'is_active' => true,
                'last_login_at' => now(),
            ]);

            $this->command->info('Super Admin user created successfully!');
            $this->command->info('Email: admin@cashmanagement.com');
            $this->command->info('Password: admin123');
        } else {
            $this->command->info('Super Admin user already exists.');
        }
    }
}
