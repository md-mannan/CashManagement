<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\TransactionService;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\TransactionType;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransactionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected TransactionService $transactionService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->transactionService = new TransactionService();
    }

    public function test_receivable_settlements_are_not_treated_as_expenses()
    {
        // Create a user
        $user = User::factory()->create();

        // Create transaction types
        $receivableType = TransactionType::create(['name' => 'receivable']);
        $settlementType = TransactionType::create(['name' => 'settlement']);

        // Create categories
        $category = Category::create([
            'name' => 'Test Category',
            'type' => 'receivable',
            'color' => '#000000'
        ]);

        // Create a receivable transaction
        $receivable = Transaction::create([
            'user_id' => $user->id,
            'type' => 'receivable',
            'amount' => 1000,
            'description' => 'Money lent to friend',
            'category_id' => $category->id,
            'transaction_type_id' => $receivableType->id,
            'date' => now(),
            'status' => 'pending'
        ]);

        // Create a settlement for the receivable (money returned)
        $settlement = Transaction::create([
            'user_id' => $user->id,
            'type' => 'settlement',
            'amount' => 1000,
            'description' => 'Money returned',
            'category_id' => $category->id,
            'transaction_type_id' => $settlementType->id,
            'related_transaction_id' => $receivable->id,
            'date' => now(),
            'status' => 'completed'
        ]);

        // Get financial summary
        $summary = $this->transactionService->getFinancialSummary($user);

        // Verify that receivable settlements are NOT treated as expenses
        $this->assertEquals(0, $summary['total_expenses']);
        $this->assertEquals(1000, $summary['receivable_settlements']);
        $this->assertEquals(0, $summary['payable_settlements']);
        
        // Net balance should be increased by the receivable settlement
        // Formula: Income(0) - Expenses(0) + Payables(0) - Receivables(1000) + Receivable Settlements(1000) = 0
        $this->assertEquals(0, $summary['net_balance']);
    }

    public function test_payable_settlements_are_treated_as_expenses()
    {
        // Create a user
        $user = User::factory()->create();

        // Create transaction types
        $payableType = TransactionType::create(['name' => 'payable']);
        $settlementType = TransactionType::create(['name' => 'settlement']);

        // Create categories
        $category = Category::create([
            'name' => 'Test Category',
            'type' => 'payable',
            'color' => '#000000'
        ]);

        // Create a payable transaction
        $payable = Transaction::create([
            'user_id' => $user->id,
            'type' => 'payable',
            'amount' => 1000,
            'description' => 'Money borrowed from friend',
            'category_id' => $category->id,
            'transaction_type_id' => $payableType->id,
            'date' => now(),
            'status' => 'pending'
        ]);

        // Create a settlement for the payable (money paid back)
        $settlement = Transaction::create([
            'user_id' => $user->id,
            'type' => 'settlement',
            'amount' => 1000,
            'description' => 'Money paid back',
            'category_id' => $category->id,
            'transaction_type_id' => $settlementType->id,
            'related_transaction_id' => $payable->id,
            'date' => now(),
            'status' => 'completed'
        ]);

        // Get financial summary
        $summary = $this->transactionService->getFinancialSummary($user);

        // Verify that payable settlements ARE treated as expenses
        $this->assertEquals(0, $summary['total_expenses']);
        $this->assertEquals(0, $summary['receivable_settlements']);
        $this->assertEquals(1000, $summary['payable_settlements']);
        $this->assertEquals(1000, $summary['total_expenses_with_payable_settlements']);
        
        // Net balance should be decreased by the payable settlement
        // Formula: Income(0) - Expenses(0) - Payable Settlements(1000) + Payables(1000) - Receivables(0) + Receivable Settlements(0) = 0
        $this->assertEquals(0, $summary['net_balance']);
    }

    public function test_mixed_settlements_are_handled_correctly()
    {
        // Create a user
        $user = User::factory()->create();

        // Create transaction types
        $receivableType = TransactionType::create(['name' => 'receivable']);
        $payableType = TransactionType::create(['name' => 'payable']);
        $settlementType = TransactionType::create(['name' => 'settlement']);

        // Create categories
        $category = Category::create([
            'name' => 'Test Category',
            'type' => 'receivable',
            'color' => '#000000'
        ]);

        // Create a receivable transaction
        $receivable = Transaction::create([
            'user_id' => $user->id,
            'type' => 'receivable',
            'amount' => 1000,
            'description' => 'Money lent to friend',
            'category_id' => $category->id,
            'transaction_type_id' => $receivableType->id,
            'date' => now(),
            'status' => 'pending'
        ]);

        // Create a payable transaction
        $payable = Transaction::create([
            'user_id' => $user->id,
            'type' => 'payable',
            'amount' => 500,
            'description' => 'Money borrowed from friend',
            'category_id' => $category->id,
            'transaction_type_id' => $payableType->id,
            'date' => now(),
            'status' => 'pending'
        ]);

        // Create a settlement for the receivable (money returned)
        $receivableSettlement = Transaction::create([
            'user_id' => $user->id,
            'type' => 'settlement',
            'amount' => 1000,
            'description' => 'Money returned',
            'category_id' => $category->id,
            'transaction_type_id' => $settlementType->id,
            'related_transaction_id' => $receivable->id,
            'date' => now(),
            'status' => 'completed'
        ]);

        // Create a settlement for the payable (money paid back)
        $payableSettlement = Transaction::create([
            'user_id' => $user->id,
            'type' => 'settlement',
            'amount' => 500,
            'description' => 'Money paid back',
            'category_id' => $category->id,
            'transaction_type_id' => $settlementType->id,
            'related_transaction_id' => $payable->id,
            'date' => now(),
            'status' => 'completed'
        ]);

        // Get financial summary
        $summary = $this->transactionService->getFinancialSummary($user);

        // Verify the breakdown
        $this->assertEquals(0, $summary['total_expenses']);
        $this->assertEquals(1000, $summary['receivable_settlements']);
        $this->assertEquals(500, $summary['payable_settlements']);
        $this->assertEquals(500, $summary['total_expenses_with_payable_settlements']);
        
        // Net balance should be: 0 - 0 - 500 + 0 - 0 + 1000 = 500
        $this->assertEquals(500, $summary['net_balance']);
    }
}
