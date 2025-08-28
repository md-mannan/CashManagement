<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user (test user)
        $user = User::first();

        if (!$user) {
            $this->command->warn('No users found. Please run the user seeder first.');
            return;
        }

        // Get categories
        $categories = Category::all()->keyBy('slug');

        $transactions = [
            [
                'user_id' => $user->id,
                'category_id' => $categories['salary']->id,
                'date' => Carbon::now()->subDays(5),
                'description' => 'Monthly Salary Payment',
                'type' => 'income',
                'amount' => 3750.00,
                'currency' => 'USD',
                'source' => 'Company Inc.',
                'status' => 'completed',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['food-dining']->id,
                'date' => Carbon::now()->subDays(3),
                'description' => 'Grocery Shopping',
                'type' => 'expense',
                'amount' => 450.00,
                'currency' => 'USD',
                'source' => 'Local Supermarket',
                'status' => 'completed',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['freelance']->id,
                'date' => Carbon::now()->subDays(7),
                'description' => 'Web Development Project',
                'type' => 'income',
                'amount' => 1200.00,
                'currency' => 'USD',
                'source' => 'Client XYZ',
                'status' => 'completed',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['utilities']->id,
                'date' => Carbon::now()->subDays(2),
                'description' => 'Electricity Bill',
                'type' => 'expense',
                'amount' => 180.00,
                'currency' => 'USD',
                'source' => 'Electric Company',
                'status' => 'completed',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['investment']->id,
                'date' => Carbon::now()->subDays(10),
                'description' => 'Dividend Payment',
                'type' => 'income',
                'amount' => 500.00,
                'currency' => 'USD',
                'source' => 'Investment Bank',
                'status' => 'completed',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['food-dining']->id,
                'date' => Carbon::now()->subDays(1),
                'description' => 'Restaurant Dinner',
                'type' => 'expense',
                'amount' => 120.00,
                'currency' => 'USD',
                'source' => 'Fine Dining Restaurant',
                'status' => 'completed',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['client-payment']->id,
                'date' => Carbon::now()->addDays(5),
                'description' => 'Website Project Payment',
                'type' => 'receivable',
                'amount' => 2500.00,
                'currency' => 'USD',
                'source' => 'Client ABC',
                'status' => 'pending',

            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['loan-repayment']->id,
                'date' => Carbon::now()->addDays(3),
                'description' => 'Personal Loan Repayment',
                'type' => 'receivable',
                'amount' => 800.00,
                'currency' => 'USD',
                'source' => 'John Doe',
                'status' => 'pending',

            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['credit-card']->id,
                'date' => Carbon::now()->addDays(7),
                'description' => 'Credit Card Bill Payment',
                'type' => 'payable',
                'amount' => 350.00,
                'currency' => 'USD',
                'source' => 'Bank Credit Card',
                'status' => 'pending',

            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['rent']->id,
                'date' => Carbon::now()->addDays(1),
                'description' => 'Monthly Rent Payment',
                'type' => 'payable',
                'amount' => 1200.00,
                'currency' => 'USD',
                'source' => 'Landlord',
                'status' => 'pending',

            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['rental-payment']->id,
                'date' => Carbon::now()->subDays(15),
                'description' => 'Rental Income - Apartment 2A',
                'type' => 'receivable',
                'amount' => 1500.00,
                'currency' => 'USD',
                'source' => 'Tenant - Sarah Smith',
                'status' => 'completed',
            ],
            [
                'user_id' => $user->id,
                'category_id' => $categories['taxes']->id,
                'date' => Carbon::now()->addDays(15),
                'description' => 'Quarterly Tax Payment',
                'type' => 'payable',
                'amount' => 750.00,
                'currency' => 'USD',
                'source' => 'Tax Authority',
                'status' => 'pending',

            ],
        ];

        foreach ($transactions as $transaction) {
            Transaction::create($transaction);
        }

        $this->command->info('Created ' . count($transactions) . ' sample transactions.');
    }
}
