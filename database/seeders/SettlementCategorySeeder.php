<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SettlementCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Settle Payable category
        Category::firstOrCreate(
            ['type' => 'settle_payable'],
            [
                'name' => 'Settle Payable',
                'slug' => Str::slug('Settle Payable'),
                'type' => 'settle_payable',
                'color' => '#F59E0B',
                'icon' => 'ArrowDownLeft',
                'is_active' => true,
            ]
        );

        // Create Settle Receivable category
        Category::firstOrCreate(
            ['type' => 'settle_receivable'],
            [
                'name' => 'Settle Receivable',
                'slug' => Str::slug('Settle Receivable'),
                'type' => 'settle_receivable',
                'color' => '#3B82F6',
                'icon' => 'ArrowUpRight',
                'is_active' => true,
            ]
        );
    }
}
