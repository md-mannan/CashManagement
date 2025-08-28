<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Models\TransactionType;
use Illuminate\Console\Command;

class FixTransactionTypes extends Command
{
    protected $signature = 'transactions:fix-types';
    protected $description = 'Fix existing transactions by setting their transaction_type_id';

    public function handle()
    {
        $this->info('Starting to fix transaction types...');

        // Get transaction type IDs
        $incomeTypeId = TransactionType::where('name', 'income')->value('id');
        $expenseTypeId = TransactionType::where('name', 'expense')->value('id');
        $receivableTypeId = TransactionType::where('name', 'receivable')->value('id');
        $payableTypeId = TransactionType::where('name', 'payable')->value('id');

        if (!$incomeTypeId || !$expenseTypeId) {
            $this->error('Transaction types not found. Please run the TransactionTypeSeeder first.');
            return 1;
        }

        // Update income transactions
        $incomeCount = Transaction::where('type', 'income')
            ->whereNull('transaction_type_id')
            ->update(['transaction_type_id' => $incomeTypeId]);
        $this->info("Updated {$incomeCount} income transactions");

        // Update expense transactions
        $expenseCount = Transaction::where('type', 'expense')
            ->whereNull('transaction_type_id')
            ->update(['transaction_type_id' => $expenseTypeId]);
        $this->info("Updated {$expenseCount} expense transactions");

        // Update receivable transactions if they exist
        if ($receivableTypeId) {
            $receivableCount = Transaction::where('type', 'receivable')
                ->whereNull('transaction_type_id')
                ->update(['transaction_type_id' => $receivableTypeId]);
            $this->info("Updated {$receivableCount} receivable transactions");
        }

        // Update payable transactions if they exist
        if ($payableTypeId) {
            $payableCount = Transaction::where('type', 'payable')
                ->whereNull('transaction_type_id')
                ->update(['transaction_type_id' => $payableTypeId]);
            $this->info("Updated {$payableCount} payable transactions");
        }

        // Check for any remaining null values
        $remainingNull = Transaction::whereNull('transaction_type_id')->count();
        if ($remainingNull > 0) {
            $this->warn("Warning: {$remainingNull} transactions still have null transaction_type_id");
        } else {
            $this->info('All transactions have been updated successfully!');
        }

        return 0;
    }
}
