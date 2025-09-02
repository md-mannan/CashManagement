<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use Illuminate\Console\Command;

class FixSettlementAmounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'settlements:fix-amounts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix settlement amounts by recalculating from actual settlement records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix settlement amounts...');

        $payableReceivables = Transaction::whereIn('type', ['payable', 'receivable'])->get();
        $fixedCount = 0;

        foreach ($payableReceivables as $transaction) {
            $actualSettledAmount = $transaction->settlements->sum('amount');
            $currentSettledAmount = $transaction->settled_amount ?? 0;

            if ($actualSettledAmount != $currentSettledAmount) {
                $this->line("Transaction #{$transaction->id}: Current settled_amount: {$currentSettledAmount}, Actual: {$actualSettledAmount}");
                
                $transaction->update([
                    'settled_amount' => $actualSettledAmount,
                    'status' => $this->calculateStatus($transaction->amount, $actualSettledAmount),
                    'settled_at' => $actualSettledAmount >= $transaction->amount ? now() : null,
                ]);
                
                $fixedCount++;
            }
        }

        $this->info("Fixed {$fixedCount} transactions with incorrect settlement amounts.");
        $this->info('Settlement amounts are now synchronized with actual settlement records.');
    }

    private function calculateStatus($totalAmount, $settledAmount)
    {
        if ($settledAmount == 0) return 'pending';
        if ($settledAmount < $totalAmount) return 'partial';
        if ($settledAmount >= $totalAmount) return 'completed';
        return 'pending';
    }
}
