<?php

namespace Database\Seeders;

use App\Models\TransactionType;
use Illuminate\Database\Seeder;

class TransactionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create transaction types for the basic system
        TransactionType::firstOrCreate(
            ['name' => 'income'],
            [
                'name' => 'income',
                'direction' => 'incoming',
            ]
        );

        TransactionType::firstOrCreate(
            ['name' => 'expense'],
            [
                'name' => 'expense',
                'direction' => 'outgoing',
            ]
        );

        // Create transaction types for the payable/receivable system
        TransactionType::firstOrCreate(
            ['name' => 'payable'],
            [
                'name' => 'payable',
                'direction' => 'outgoing',
            ]
        );

        TransactionType::firstOrCreate(
            ['name' => 'receivable'],
            [
                'name' => 'receivable',
                'direction' => 'incoming',
            ]
        );

        TransactionType::firstOrCreate(
            ['name' => 'settlement'],
            [
                'name' => 'settlement',
                'direction' => 'neutral',
            ]
        );

        TransactionType::firstOrCreate(
            ['name' => 'settle_receivable'],
            [
                'name' => 'settle_receivable',
                'direction' => 'incoming',
            ]
        );

        TransactionType::firstOrCreate(
            ['name' => 'settle_payable'],
            [
                'name' => 'settle_payable',
                'direction' => 'outgoing',
            ]
        );
    }
}
