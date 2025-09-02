<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Seed essential data only
        $this->call([
            SuperAdminSeeder::class,
            SettlementCategorySeeder::class,
            TransactionTypeSeeder::class,
            // TransactionSeeder::class, // Commented out - no sample transactions
        ]);

        // Note: Create your own user account through registration
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
