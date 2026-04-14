<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\TransactionService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index()
    {
        $user = Auth::user();
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // System-wide dashboard blocks (requires explicit module permission)
        if ($user->hasAggregatedMainDashboard()) {
            // Super admin can see recent transactions from all users
            $recentTransactions = Transaction::with(['category', 'user'])
                ->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Total transactions from all users
            $totalTransactions = Transaction::count();

            // Get all users for admin dashboard
            $allUsers = \App\Models\User::withCount('transactions')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Super admin sees system-wide financial summary (ALL users' data combined)
            // Use the same structure as normal users for consistency
            $currentSummary = $this->transactionService->getFinancialSummary(null); // null = all users

            $previousMonth = Carbon::now()->subMonth()->startOfMonth();
            $previousSummary = $this->transactionService->getFinancialSummary(null, $previousMonth, $previousMonth->copy()->endOfMonth());
        } else {
            // Regular users see only their own data
            $recentTransactions = Transaction::with('category')
                ->forUser($user->id)
                ->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $totalTransactions = Transaction::forUser($user->id)->count();
            $allUsers = null;

            // User-specific financial summary (all-time data for main cards)
            // Use the same calculation logic as TransactionController for consistency
            $currentSummary = $this->transactionService->getFinancialSummary($user);
            
            $previousMonth = Carbon::now()->subMonth()->startOfMonth();
            $previousSummary = $this->transactionService->getFinancialSummary($user, $previousMonth, $previousMonth->copy()->endOfMonth());
        }

        // Ledger-like net balance (match Ledger/Transactions behavior for legacy/orphan settlement rows).
        // Only compute for non-aggregated dashboards (single user).
        $ledgerLikeNetBalance = null;
        if (! $user->hasAggregatedMainDashboard()) {
            $ledgerLikePayableSettlements = (float) Transaction::query()
                ->where('user_id', $user->id)
                ->where(function ($q) {
                    $q->whereHas('category', function ($c) {
                        $c->where('type', 'settle_payable');
                    })->orWhere(function ($q2) {
                        $q2->where('type', 'settlement')
                            ->whereHas('relatedTransaction', function ($rel) {
                                $rel->where('type', 'payable');
                            });
                    });
                })
                ->sum('amount');

            $ledgerLikeReceivableSettlements = (float) Transaction::query()
                ->where('user_id', $user->id)
                ->where(function ($q) {
                    $q->whereHas('category', function ($c) {
                        $c->where('type', 'settle_receivable');
                    })->orWhere(function ($q2) {
                        $q2->where('type', 'settlement')
                            ->whereHas('relatedTransaction', function ($rel) {
                                $rel->where('type', 'receivable');
                            });
                    });
                })
                ->sum('amount');

            $ledgerLikeNetBalance =
                (float) ($currentSummary['total_income'] ?? 0)
                - (float) ($currentSummary['total_expenses'] ?? 0)
                - (float) ($currentSummary['total_receivables'] ?? 0)
                + (float) ($currentSummary['total_payables'] ?? 0)
                + $ledgerLikeReceivableSettlements
                - $ledgerLikePayableSettlements;
        }

        // Calculate changes
        $changes = [
            'income_change' => $this->calculatePercentageChange($previousSummary['total_income'], $currentSummary['total_income']),
            'expense_change' => $this->calculatePercentageChange($previousSummary['total_expenses'], $currentSummary['total_expenses']),
            'receivables_change' => $this->calculatePercentageChange($previousSummary['total_receivables'], $currentSummary['total_receivables']),
            'payables_change' => $this->calculatePercentageChange($previousSummary['total_payables'], $currentSummary['total_payables']),
            'balance_change' => $this->calculatePercentageChange($previousSummary['net_balance'], $currentSummary['net_balance']),
        ];

        // Add the correct net balance formula for display
        $netBalanceFormula = 'Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements';

        // Chart data: aggregated when user has cross-user analytics permission
        if ($user->hasAggregatedMainDashboard()) {
            // Super admin sees system-wide chart data (ALL users)
            $monthlyData = $this->transactionService->getSystemMonthlyChartData();
            $yearlyData = $this->transactionService->getSystemYearlyChartData();
            $categoryData = $this->transactionService->getSystemCategoryBreakdown($currentMonth);
            $yearlyCategoryData = $this->transactionService->getSystemYearlyCategoryBreakdown();
        } else {
            // Regular users see only their own chart data
            $monthlyData = $this->transactionService->getMonthlyChartData($user);
            $yearlyData = $this->transactionService->getYearlyChartData($user);
            $categoryData = $this->transactionService->getCategoryBreakdown($user, $currentMonth);
            $yearlyCategoryData = $this->transactionService->getYearlyCategoryBreakdown($user);
        }

        // Payable/receivable summaries
        $summaryUserId = $user->hasAggregatedMainDashboard() ? null : $user->id;
        $payableSummary = (object) $this->computePayableReceivableSummary($summaryUserId, 'payable');
        $receivableSummary = (object) $this->computePayableReceivableSummary($summaryUserId, 'receivable');

        return Inertia::render('dashboard', [
            'recentTransactions' => $recentTransactions,
            'currentSummary' => $currentSummary,
            'ledgerLikeNetBalance' => $ledgerLikeNetBalance,
            'changes' => $changes,
            'netBalanceFormula' => $netBalanceFormula,
            'monthlyData' => $monthlyData,
            'yearlyData' => $yearlyData,
            'categoryData' => $categoryData,
            'yearlyCategoryData' => $yearlyCategoryData,

            'showAggregatedDashboard' => $user->hasAggregatedMainDashboard(),
            'allUsers' => $allUsers,
            'payableSummary' => $payableSummary,
            'receivableSummary' => $receivableSummary,
            'debug' => [
                'totalTransactions' => $totalTransactions,
                'currentMonth' => $currentMonth->format('Y-m-d'),
                'monthlyDataSample' => $monthlyData['datasets'][0]['data'] ?? [],
            ],
        ]);
    }

    /**
     * Compute payable/receivable summary using actual settlement rows.
     * This avoids relying on `settled_amount`, which can drift out-of-sync.
     *
     * @return array{total_count:int,total_amount:float,total_settled:float,total_outstanding:float}
     */
    private function computePayableReceivableSummary(?int $userId, string $type): array
    {
        $base = Transaction::query()
            ->where('type', $type)
            ->whereNull('related_transaction_id'); // exclude settlement transactions

        if ($userId !== null) {
            $base->where('user_id', $userId);
        }

        $totalCount = (int) (clone $base)->count();
        $totalAmount = (float) (clone $base)->sum('amount');

        // Settled = sum of settlement transactions whose related transaction is of this type.
        $settledQuery = Transaction::query()
            // Legacy support: settlements are identified by `related_transaction_id` linkage
            // (not strictly by `type`).
            ->where(function ($q) {
                $q->whereNotNull('related_transaction_id')
                    ->orWhere('type', 'settlement')
                    ->orWhereHas('category', function ($c) {
                        $c->whereIn('type', ['settle_payable', 'settle_receivable']);
                    });
            })
            ->whereColumn('id', '!=', 'related_transaction_id')
            ->whereHas('relatedTransaction', function ($q) use ($type, $userId) {
                $q->where('type', $type)->whereNull('related_transaction_id');
                if ($userId !== null) {
                    $q->where('user_id', $userId);
                }
            });

        $totalSettled = (float) $settledQuery->sum('amount');

        // Also include orphan settlement rows categorized as settle_payable/settle_receivable.
        $orphanSettleType = $type === 'payable' ? 'settle_payable' : 'settle_receivable';
        $orphanQuery = Transaction::query()
            ->whereColumn('id', '!=', 'related_transaction_id')
            ->whereHas('category', function ($c) use ($orphanSettleType) {
                $c->where('type', $orphanSettleType);
            })
            ->whereDoesntHave('relatedTransaction');
        if ($userId !== null) {
            $orphanQuery->where('user_id', $userId);
        }
        $totalSettled += (float) $orphanQuery->sum('amount');
        $totalOutstanding = max(0.0, $totalAmount - $totalSettled);

        return [
            'total_count' => $totalCount,
            'total_amount' => $totalAmount,
            'total_settled' => $totalSettled,
            'total_outstanding' => $totalOutstanding,
        ];
    }

    /**
     * Get user financial summary using the same logic as TransactionController
     */
    private function getUserFinancialSummary($user)
    {
        // Get all transactions for summary calculation (without pagination)
        $allTransactions = Transaction::with(['category', 'relatedTransaction'])
            ->forUser($user->id)
            ->orderBy('date', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();
        
        // Calculate summary data from all transactions with correct settlement handling
        $totalIncome = $allTransactions->where('type', 'income')->sum('amount');
        $totalExpenses = $allTransactions->where('type', 'expense')->sum('amount');
        
        // Separate receivable and payable settlements
        $receivableSettlements = 0;
        $payableSettlements = 0;
        
        // Get settlement transactions based on category names (not just type)
        // Use EXACTLY the same logic as TransactionController
        $settlementTransactions = $allTransactions->filter(function ($transaction) {
            $categoryName = strtolower($transaction->category->name);
            return str_contains($categoryName, 'return') || str_contains($categoryName, 'pay') || str_contains($categoryName, 'settle');
        });
        
        foreach ($settlementTransactions as $settlement) {
            $categoryName = strtolower($settlement->category->name);
            
            if (str_contains($categoryName, 'return')) {
                // Receivable settlement (getting money back)
                $receivableSettlements += $settlement->amount;
            } elseif (str_contains($categoryName, 'pay')) {
                // Payable settlement (paying back borrowed money)
                $payableSettlements += $settlement->amount;
            }
        }
            
        $totalSettlements = $receivableSettlements + $payableSettlements;
        
        // Calculate receivables and payables (excluding settlements)
        $totalReceivables = $allTransactions->where('type', 'receivable')->sum('amount');
        $totalPayables = $allTransactions->where('type', 'payable')->sum('amount');
        
        // Calculate remaining amounts (original - settled)
        $remainingReceivables = $totalReceivables - $receivableSettlements;
        $remainingPayables = $totalPayables - $payableSettlements;
        
        // Calculate net balance using the exact formula: (Income + Settle Receivables + Payables) - (Expenses + Receivables + Settle Payables)
        $calculatedNetBalance = ($totalIncome + $receivableSettlements + $totalPayables) - ($totalExpenses + $totalReceivables + $payableSettlements);
        
        // Calculate secondary currency totals from metadata - EXACTLY like TransactionService
        $secondaryAmounts = [
            'total_income' => 0,
            'total_expenses' => 0,
            'total_receivables' => 0,
            'total_payables' => 0,
            'receivable_settlements' => 0,
            'payable_settlements' => 0,
        ];
        
        // Sum secondary currency amounts for each transaction type - EXACTLY like TransactionService
        foreach ($allTransactions as $transaction) {
            $originalSecondaryAmount = 0;

            // Only use secondary amount if it was actually entered in secondary currency
            if ($transaction->metadata &&
                isset($transaction->metadata['secondary_currency']) &&
                isset($transaction->metadata['secondary_amount']) &&
                $transaction->metadata['secondary_currency'] === $user->secondary_currency) {

                $originalSecondaryAmount = $transaction->metadata['secondary_amount'];
            }
            // If transaction was entered in primary currency, don't convert - leave as 0
            // This ensures secondary amounts only show actual secondary currency entries

            // Add to appropriate total
            switch ($transaction->type) {
                case 'income':
                    $secondaryAmounts['total_income'] += $originalSecondaryAmount;
                    break;
                case 'expense':
                    $secondaryAmounts['total_expenses'] += $originalSecondaryAmount;
                    break;
                case 'settlement':
                    // Check if this is a receivable or payable settlement
                    if ($transaction->relatedTransaction && $transaction->relatedTransaction->type === 'receivable') {
                        // Receivable settlement - money returned to you (NOT an expense)
                        $secondaryAmounts['receivable_settlements'] += $originalSecondaryAmount;
                    } else {
                        // Payable settlement - money you paid (IS an expense)
                        $secondaryAmounts['payable_settlements'] += $originalSecondaryAmount;
                    }
                    break;
                case 'receivable':
                    $secondaryAmounts['total_receivables'] += $originalSecondaryAmount;
                    break;
                case 'payable':
                    $secondaryAmounts['total_payables'] += $originalSecondaryAmount;
                    break;
            }
        }
        
        // Calculate secondary currency net balance using the SAME formula as primary
        // Formula: Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements
        $secondaryNetBalance = $secondaryAmounts['total_income'] - $secondaryAmounts['total_expenses'] - $secondaryAmounts['total_receivables'] + $secondaryAmounts['total_payables'] + $secondaryAmounts['receivable_settlements'] - $secondaryAmounts['payable_settlements'];
        
        return [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'total_receivables' => $totalReceivables,
            'total_payables' => $totalPayables,
            'remaining_receivables' => $remainingReceivables,
            'remaining_payables' => $remainingPayables,
            'receivable_settlements' => $receivableSettlements,
            'payable_settlements' => $payableSettlements,
            'total_settlements' => $totalSettlements,
            'net_balance' => $calculatedNetBalance,
            'secondary_amounts' => $secondaryAmounts,
            'secondary_net_balance' => $secondaryNetBalance,
        ];
    }



    /**
     * Calculate percentage change between two values
     */
    private function calculatePercentageChange(float $oldValue, float $newValue): float
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }

        return round((($newValue - $oldValue) / $oldValue) * 100, 2);
    }
}
