<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class FinancialConstraintService
{
    protected TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    /**
     * Check if user can create a new receivable transaction
     * Rule: Net balance must be greater than or equal to receivables
     */
    public function canCreateReceivable(User $user, float $amount = 0): array
    {
        $summary = $this->transactionService->getFinancialSummary($user);
        
        $netBalance = $summary['net_balance'];
        $totalReceivables = $summary['total_receivables'];
        $newReceivableAmount = $amount;
        
        // Check if net balance is sufficient
        $canCreate = $netBalance >= $totalReceivables + $newReceivableAmount;
        
        return [
            'can_create' => $canCreate,
            'net_balance' => $netBalance,
            'total_receivables' => $totalReceivables,
            'new_amount' => $newReceivableAmount,
            'required_balance' => $totalReceivables + $newReceivableAmount,
            'shortfall' => max(0, ($totalReceivables + $newReceivableAmount) - $netBalance),
            'message' => $canCreate 
                ? 'You can create this receivable transaction.'
                : 'Cannot create receivable: Your net balance is insufficient. You need at least ' . 
                  number_format($totalReceivables + $newReceivableAmount, 2) . ' but only have ' . 
                  number_format($netBalance, 2) . ' available.'
        ];
    }

    /**
     * Check if user can create a new payable transaction
     * Rule: Payables are money borrowed (coming IN), so no balance restriction needed
     */
    public function canCreatePayable(User $user, float $amount = 0): array
    {
        // Payables are money borrowed from others (money coming IN)
        // No need to check current balance since this increases your net balance
        return [
            'can_create' => true,
            'net_balance' => 0, // Not relevant for payable creation
            'total_receivables' => 0, // Not relevant for payable creation
            'new_amount' => $amount,
            'required_balance' => 0, // No balance required to borrow money
            'shortfall' => 0, // No shortfall when borrowing
            'message' => 'You can create this payable transaction. Payables represent money you are borrowing.'
        ];
    }

    /**
     * Check if user can settle a payable transaction
     * Rule: Net balance must be greater than or equal to receivables
     */
    public function canSettlePayable(User $user, float $settlementAmount = 0): array
    {
        $summary = $this->transactionService->getFinancialSummary($user);
        
        $netBalance = $summary['net_balance'];
        $totalReceivables = $summary['total_receivables'];
        
        // Check if net balance is sufficient
        $canSettle = $netBalance >= $totalReceivables;
        
        return [
            'can_settle' => $canSettle,
            'net_balance' => $netBalance,
            'total_receivables' => $totalReceivables,
            'settlement_amount' => $settlementAmount,
            'required_balance' => $totalReceivables,
            'shortfall' => max(0, $totalReceivables - $netBalance),
            'message' => $canSettle 
                ? 'You can settle this payable transaction.'
                : 'Cannot settle payable: Your net balance is insufficient. You need at least ' . 
                  number_format($totalReceivables, 2) . ' but only have ' . 
                  number_format($netBalance, 2) . ' available.'
        ];
    }

    /**
     * Get comprehensive financial constraint status for a user
     */
    public function getFinancialConstraintStatus(User $user): array
    {
        $summary = $this->transactionService->getFinancialSummary($user);
        
        $netBalance = $summary['net_balance'];
        $totalReceivables = $summary['total_receivables'];
        $totalPayables = $summary['total_payables'];
        
        $canCreateReceivable = $netBalance >= $totalReceivables;
        $canCreatePayable = $netBalance >= $totalReceivables;
        $canSettlePayable = $netBalance >= $totalReceivables;
        
        return [
            'net_balance' => $netBalance,
            'total_receivables' => $totalReceivables,
            'total_payables' => $totalPayables,
            'available_for_lending' => max(0, $netBalance - $totalReceivables),
            'constraints' => [
                'can_create_receivable' => $canCreateReceivable,
                'can_create_payable' => $canCreatePayable,
                'can_settle_payable' => $canSettlePayable,
            ],
            'warnings' => [
                'insufficient_balance' => !$canCreateReceivable,
                'high_receivables_risk' => $totalReceivables > $netBalance * 0.8, // Warning if receivables > 80% of net balance
            ],
            'recommendations' => $this->getRecommendations($netBalance, $totalReceivables, $totalPayables)
        ];
    }

    /**
     * Get financial recommendations based on current status
     */
    private function getRecommendations(float $netBalance, float $totalReceivables, float $totalPayables): array
    {
        $recommendations = [];
        
        if ($netBalance < $totalReceivables) {
            $recommendations[] = 'Your net balance is below your receivables. Consider collecting outstanding debts before lending more money.';
        }
        
        if ($totalReceivables > $netBalance * 0.8) {
            $recommendations[] = 'Your receivables are high relative to your net balance. Consider reducing lending to maintain financial stability.';
        }
        
        if ($totalPayables > $netBalance * 0.5) {
            $recommendations[] = 'Your payables are significant. Consider paying off debts to improve your financial position.';
        }
        
        if (empty($recommendations)) {
            $recommendations[] = 'Your financial position is healthy. You can safely create new transactions.';
        }
        
        return $recommendations;
    }
}
