<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income categories
            [
                'name' => 'Salary',
                'slug' => 'salary',
                'type' => 'income',
                'color' => '#10B981',
                'icon' => 'Banknote',
            ],
            [
                'name' => 'Freelance',
                'slug' => 'freelance',
                'type' => 'income',
                'color' => '#059669',
                'icon' => 'Laptop',
            ],
            [
                'name' => 'Investment',
                'slug' => 'investment',
                'type' => 'income',
                'color' => '#0D9488',
                'icon' => 'TrendingUp',
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'type' => 'income',
                'color' => '#0891B2',
                'icon' => 'Building',
            ],
            [
                'name' => 'Other Income',
                'slug' => 'other-income',
                'type' => 'income',
                'color' => '#0EA5E9',
                'icon' => 'Plus',
            ],

            // Expense categories
            [
                'name' => 'Food & Dining',
                'slug' => 'food-dining',
                'type' => 'expense',
                'color' => '#EF4444',
                'icon' => 'UtensilsCrossed',
            ],
            [
                'name' => 'Transportation',
                'slug' => 'transportation',
                'type' => 'expense',
                'color' => '#DC2626',
                'icon' => 'Car',
            ],
            [
                'name' => 'Utilities',
                'slug' => 'utilities',
                'type' => 'expense',
                'color' => '#B91C1C',
                'icon' => 'Zap',
            ],
            [
                'name' => 'Shopping',
                'slug' => 'shopping',
                'type' => 'expense',
                'color' => '#991B1B',
                'icon' => 'ShoppingBag',
            ],
            [
                'name' => 'Entertainment',
                'slug' => 'entertainment',
                'type' => 'expense',
                'color' => '#7C2D12',
                'icon' => 'Film',
            ],
            [
                'name' => 'Healthcare',
                'slug' => 'healthcare',
                'type' => 'expense',
                'color' => '#92400E',
                'icon' => 'Heart',
            ],
            [
                'name' => 'Education',
                'slug' => 'education',
                'type' => 'expense',
                'color' => '#B45309',
                'icon' => 'BookOpen',
            ],
            [
                'name' => 'Other Expenses',
                'slug' => 'other-expenses',
                'type' => 'expense',
                'color' => '#D97706',
                'icon' => 'Minus',
            ],

            // Receivable categories
            [
                'name' => 'Client Payment',
                'slug' => 'client-payment',
                'type' => 'receivable',
                'color' => '#8B5CF6',
                'icon' => 'Users',
            ],
            [
                'name' => 'Loan Repayment',
                'slug' => 'loan-repayment',
                'type' => 'receivable',
                'color' => '#7C3AED',
                'icon' => 'HandCoins',
            ],
            [
                'name' => 'Rental Payment',
                'slug' => 'rental-payment',
                'type' => 'receivable',
                'color' => '#6D28D9',
                'icon' => 'Home',
            ],

            // Payable categories
            [
                'name' => 'Credit Card',
                'slug' => 'credit-card',
                'type' => 'payable',
                'color' => '#F59E0B',
                'icon' => 'CreditCard',
            ],
            [
                'name' => 'Rent',
                'slug' => 'rent',
                'type' => 'payable',
                'color' => '#D97706',
                'icon' => 'Home',
            ],
            [
                'name' => 'Taxes',
                'slug' => 'taxes',
                'type' => 'payable',
                'color' => '#B45309',
                'icon' => 'FileText',
            ],
            [
                'name' => 'Insurance',
                'slug' => 'insurance',
                'type' => 'payable',
                'color' => '#92400E',
                'icon' => 'Shield',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
