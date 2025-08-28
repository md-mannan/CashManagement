<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TransactionService
{
    /**
     * Calculate financial summary for a user or all users (if user is null)
     */
    public function getFinancialSummary(?User $user = null, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        if ($user) {
            $query = $user->transactions();
        } else {
            // Admin view - all transactions
            $query = Transaction::query();
        }

        if ($startDate && $endDate) {
            if ($user) {
                $query->dateRange($startDate, $endDate);
            } else {
                $query->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
            }
        }

        $transactions = $query->with('relatedTransaction')->get();

        // Calculate basic transaction totals
        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpenses = $transactions->where('type', 'expense')->sum('amount');
        
        // Calculate payable/receivable totals (excluding settlements)
        $totalReceivables = $transactions->where('type', 'receivable')
            ->whereNull('related_transaction_id') // Exclude settlement transactions
            ->sum('amount');
        $totalPayables = $transactions->where('type', 'payable')
            ->whereNull('related_transaction_id') // Exclude settlement transactions
            ->sum('amount');
        
        // Calculate settlement totals - separate receivable and payable settlements
        // We need to use separate queries since whereHas doesn't work on Collections
        $receivableSettlements = 0;
        $payableSettlements = 0;
        
        // Get settlement transactions and check their related transactions
        $settlementTransactions = $transactions->where('type', 'settlement');
        foreach ($settlementTransactions as $settlement) {
            if ($settlement->relatedTransaction) {
                if ($settlement->relatedTransaction->type === 'receivable') {
                    $receivableSettlements += $settlement->amount;
                } elseif ($settlement->relatedTransaction->type === 'payable') {
                    $payableSettlements += $settlement->amount;
                }
            }
        }
            
        $totalSettlements = $receivableSettlements + $payableSettlements;
        
        // Calculate REMAINING payable/receivable amounts (after settlements)
        $remainingPayables = $totalPayables - $payableSettlements;
        $remainingReceivables = $totalReceivables - $receivableSettlements;
        
        // Only payable settlements are expenses - receivable settlements are NOT expenses
        // Receivable settlements increase net balance directly (money returned to you)
        $totalExpensesWithPayableSettlements = $totalExpenses + $payableSettlements;
        
        // Calculate net balance with correct business logic:
        // Income + Total Payables - Payable Settlements - REMAINING Receivables + Receivable Settlements
        // Note: 
        // - REMAINING Receivables DECREASE net balance (money you've still lent out)
        // - Receivable Settlements INCREASE net balance directly (money returned to you)
        // Note: Payables are money you owe to others, not money you have available
        // Net Balance = Income - Expenses - Total Receivables + Receivable Settlements
        // (Total Receivables = money you've lent out, Receivable Settlements = money returned)
        $netBalance = $totalIncome - $totalExpenses - $totalReceivables + $receivableSettlements;
        
        // Temporary debug logging to check values
        \Log::info('Net Balance Calculation Debug', [
            'totalIncome' => $totalIncome,
            'totalExpenses' => $totalExpenses,
            'totalReceivables' => $totalReceivables,
            'receivableSettlements' => $receivableSettlements,
            'calculatedNetBalance' => $netBalance,
            'formula' => "{$totalIncome} - {$totalExpenses} - {$totalReceivables} + {$receivableSettlements} = {$netBalance}"
        ]);



        // Calculate original entered amounts in secondary currency (only for single user view)
        $secondaryAmounts = $user ? $this->calculateSecondaryAmountSums($transactions, $user) : [];

        return [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'total_expenses_with_payable_settlements' => $totalExpensesWithPayableSettlements,
            'total_receivables' => $totalReceivables,
            'total_payables' => $totalPayables,
            'remaining_receivables' => $remainingReceivables,
            'remaining_payables' => $remainingPayables,
            'total_settlements' => $totalSettlements,
            'receivable_settlements' => $receivableSettlements,
            'payable_settlements' => $payableSettlements,
            'net_balance' => $netBalance,
            'pending_receivables' => $transactions->where('type', 'receivable')
                ->whereNull('related_transaction_id')
                ->where('status', 'pending')->sum('amount'),
            'pending_payables' => $transactions->where('type', 'payable')
                ->whereNull('related_transaction_id')
                ->where('status', 'pending')->sum('amount'),
            // Add secondary currency amounts (original entered amounts)
            'secondary_amounts' => $secondaryAmounts,
        ];
    }

    /**
     * Calculate sums of original entered amounts in secondary currency
     */
    private function calculateSecondaryAmountSums($transactions, User $user): array
    {
        $totals = [
            'total_income' => 0,
            'total_expenses' => 0,
            'total_receivables' => 0,
            'total_payables' => 0,
            'receivable_settlements' => 0,
            'payable_settlements' => 0,
        ];

        foreach ($transactions as $transaction) {
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
                    $totals['total_income'] += $originalSecondaryAmount;
                    break;
                case 'expense':
                    $totals['total_expenses'] += $originalSecondaryAmount;
                    break;
                case 'settlement':
                    // Check if this is a receivable or payable settlement
                    if ($transaction->relatedTransaction && $transaction->relatedTransaction->type === 'receivable') {
                        // Receivable settlement - money returned to you (NOT an expense)
                        $totals['receivable_settlements'] += $originalSecondaryAmount;
                    } else {
                        // Payable settlement - money you paid (IS an expense)
                        $totals['payable_settlements'] += $originalSecondaryAmount;
                    }
                    break;
                case 'receivable':
                    $totals['total_receivables'] += $originalSecondaryAmount;
                    break;
                case 'payable':
                    $totals['total_payables'] += $originalSecondaryAmount;
                    break;
            }
        }

        return $totals;
    }

    /**
     * Get monthly chart data for dashboard - shows all months with transaction data
     */
    public function getMonthlyChartData(?User $user = null): array
    {
        $data = [
            'labels' => [],
            'datasets' => [
                [
                    'label' => 'Income',
                    'data' => [],
                    'borderColor' => 'rgb(34, 197, 94)',
                    'backgroundColor' => 'rgba(34, 197, 94, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Expense',
                    'data' => [],
                    'borderColor' => 'rgb(239, 68, 68)',
                    'backgroundColor' => 'rgba(239, 68, 68, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Receivable',
                    'data' => [],
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Payable',
                    'data' => [],
                    'borderColor' => 'rgb(249, 115, 22)',
                    'backgroundColor' => 'rgba(249, 115, 22, 0.8)',
                    'type' => 'bar',
                ],
                // Settlements are now included in expenses, so no separate dataset needed
                // [
                //     'label' => 'Settlements',
                //     'data' => [],
                //     'borderColor' => 'rgb(139, 92, 246)',
                //     'backgroundColor' => 'rgba(139, 92, 246, 0.8)',
                //     'type' => 'bar',
                // ],
            ],
        ];

        // Get all unique year-month combinations from transactions
        if ($user) {
            $monthlyPeriods = $user->transactions()
                ->selectRaw('YEAR(date) as year, MONTH(date) as month')
                ->groupBy('year', 'month')
                ->orderBy('year', 'asc')
                ->orderBy('month', 'asc')
                ->get();
        } else {
            // Admin view - all transactions
            $monthlyPeriods = Transaction::selectRaw('YEAR(date) as year, MONTH(date) as month')
                ->groupBy('year', 'month')
                ->orderBy('year', 'asc')
                ->orderBy('month', 'asc')
                ->get();
        }

        // If no transactions found, return empty data
        if ($monthlyPeriods->isEmpty()) {
            return $data;
        }

        foreach ($monthlyPeriods as $period) {
            $startOfMonth = Carbon::create($period->year, $period->month, 1)->startOfMonth();
            $endOfMonth = $startOfMonth->copy()->endOfMonth();

            // Get all transactions for this month
            if ($user) {
                $transactions = $user->transactions()
                    ->whereBetween('date', [$startOfMonth->format('Y-m-d'), $endOfMonth->format('Y-m-d')])
                    ->get();
            } else {
                $transactions = Transaction::whereBetween('date', [$startOfMonth->format('Y-m-d'), $endOfMonth->format('Y-m-d')])
                    ->get();
            }

            $data['labels'][] = $startOfMonth->format('M Y');
            $data['datasets'][0]['data'][] = (float) $transactions->where('type', 'income')->sum('amount');
            // Include settlements in expenses since they are expense transactions (money spent to pay off debt)
            $monthlyExpenses = $transactions->where('type', 'expense')->sum('amount');
            $monthlySettlements = $transactions->where('type', 'settlement')->sum('amount');
            $data['datasets'][1]['data'][] = (float) ($monthlyExpenses + $monthlySettlements);
            $data['datasets'][2]['data'][] = (float) $transactions->where('type', 'receivable')
                ->whereNull('related_transaction_id')->sum('amount');
            $data['datasets'][3]['data'][] = (float) $transactions->where('type', 'payable')
                ->whereNull('related_transaction_id')->sum('amount');
            // Remove settlements as separate dataset since they're now included in expenses
            // $data['datasets'][4]['data'][] = (float) $transactions->where('type', 'settlement')->sum('amount');
        }

        return $data;
    }

    /**
     * Get yearly chart data for dashboard - shows all years with transaction data
     */
    public function getYearlyChartData(?User $user = null): array
    {
        $data = [
            'labels' => [],
            'datasets' => [
                [
                    'label' => 'Income',
                    'data' => [],
                    'borderColor' => 'rgb(34, 197, 94)',
                    'backgroundColor' => 'rgba(34, 197, 94, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Expense',
                    'data' => [],
                    'borderColor' => 'rgb(239, 68, 68)',
                    'backgroundColor' => 'rgba(239, 68, 68, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Receivable',
                    'data' => [],
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Payable',
                    'data' => [],
                    'borderColor' => 'rgb(249, 115, 22)',
                    'backgroundColor' => 'rgba(249, 115, 22, 0.8)',
                    'type' => 'bar',
                ],
            ],
        ];

        // Get all unique years from transactions
        if ($user) {
            $yearlyPeriods = $user->transactions()
                ->selectRaw('YEAR(date) as year')
                ->groupBy('year')
                ->orderBy('year', 'asc')
                ->get();
        } else {
            // Admin view - all transactions
            $yearlyPeriods = Transaction::selectRaw('YEAR(date) as year')
                ->groupBy('year')
                ->orderBy('year', 'asc')
                ->get();
        }

        // If no transactions found, return empty data
        if ($yearlyPeriods->isEmpty()) {
            return $data;
        }

        foreach ($yearlyPeriods as $period) {
            $startOfYear = Carbon::create($period->year, 1, 1)->startOfYear();
            $endOfYear = $startOfYear->copy()->endOfYear();

            // Get all transactions for this year
            if ($user) {
                $transactions = $user->transactions()
                    ->whereBetween('date', [$startOfYear->format('Y-m-d'), $endOfYear->format('Y-m-d')])
                    ->get();
            } else {
                $transactions = Transaction::whereBetween('date', [$startOfYear->format('Y-m-d'), $endOfYear->format('Y-m-d')])
                    ->get();
            }

            $data['labels'][] = $period->year;
            $data['datasets'][0]['data'][] = (float) $transactions->where('type', 'income')->sum('amount');
            // Include settlements in expenses since they are expense transactions (money spent to pay off debt)
            $yearlyExpenses = $transactions->where('type', 'expense')->sum('amount');
            $yearlySettlements = $transactions->where('type', 'settlement')->sum('amount');
            $data['datasets'][1]['data'][] = (float) ($yearlyExpenses + $yearlySettlements);
            $data['datasets'][2]['data'][] = (float) $transactions->where('type', 'receivable')->sum('amount');
            $data['datasets'][3]['data'][] = (float) $transactions->where('type', 'payable')->sum('amount');
        }

        return $data;
    }

    /**
     * Get category breakdown for pie chart
     */
    public function getCategoryBreakdown(?User $user = null, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        if ($user) {
            $query = $user->transactions()->with('category');
        } else {
            // Admin view - all transactions
            $query = Transaction::with('category');
        }

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        }

        $transactions = $query->get();

        // Group by transaction type first
        $typeData = [
            'income' => $transactions->where('type', 'income')->sum('amount'),
            'expense' => $transactions->where('type', 'expense')->sum('amount'),
            'receivable' => $transactions->where('type', 'receivable')->sum('amount'),
            'payable' => $transactions->where('type', 'payable')->sum('amount'),
        ];

        // Filter out zero values
        $typeData = array_filter($typeData, fn($value) => $value > 0);

        if (empty($typeData)) {
            return [
                'labels' => [],
                'datasets' => [
                    [
                        'data' => [],
                        'backgroundColor' => [],
                        'borderColor' => [],
                        'borderWidth' => 4,
                        'hoverBorderWidth' => 6,
                        'hoverOffset' => 20,
                    ],
                ],
            ];
        }

        // Define colors for each transaction type
        $colorMap = [
            'income' => [
                'background' => 'rgba(34, 197, 94, 1)',
                'border' => 'rgb(34, 197, 94)',
            ],
            'expense' => [
                'background' => 'rgba(239, 68, 68, 1)',
                'border' => 'rgb(239, 68, 68)',
            ],
            'receivable' => [
                'background' => 'rgba(59, 130, 246, 1)',
                'border' => 'rgb(59, 130, 246)',
            ],
            'payable' => [
                'background' => 'rgba(249, 115, 22, 1)',
                'border' => 'rgb(249, 115, 22)',
            ],
        ];

        // Generate colors based on actual data
        $backgroundColors = [];
        $borderColors = [];

        foreach (array_keys($typeData) as $type) {
            $backgroundColors[] = $colorMap[$type]['background'];
            $borderColors[] = $colorMap[$type]['border'];
        }

        return [
            'labels' => array_map('ucfirst', array_keys($typeData)),
            'datasets' => [
                [
                    'data' => array_values($typeData),
                    'backgroundColor' => $backgroundColors,
                    'borderColor' => $borderColors,
                    'borderWidth' => 4,
                    'hoverBorderWidth' => 6,
                    'hoverOffset' => 20,
                ],
            ],
        ];
    }

    /**
     * Get yearly category breakdown for pie chart
     */
    public function getYearlyCategoryBreakdown(?User $user = null, ?int $year = null): array
    {
        $targetYear = $year ?? Carbon::now()->year;
        $startOfYear = Carbon::create($targetYear)->startOfYear();
        $endOfYear = Carbon::create($targetYear)->endOfYear();

        return $this->getCategoryBreakdown($user, $startOfYear, $endOfYear);
    }



    /**
     * Calculate percentage change between two values
     */
    public function calculatePercentageChange(float $oldValue, float $newValue): float
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }

        return round((($newValue - $oldValue) / $oldValue) * 100, 2);
    }

    /**
     * Get transaction trends (comparison with previous period)
     */
    public function getTransactionTrends(User $user, Carbon $startDate, Carbon $endDate): array
    {
        $currentPeriod = $user->transactions()
            ->dateRange($startDate, $endDate)
            ->get();

        $periodLength = $startDate->diffInDays($endDate);
        $previousStart = $startDate->copy()->subDays($periodLength + 1);
        $previousEnd = $startDate->copy()->subDay();

        $previousPeriod = $user->transactions()
            ->dateRange($previousStart, $previousEnd)
            ->get();

        $currentSummary = [
            'income' => $currentPeriod->where('type', 'income')->sum('amount'),
            'expenses' => $currentPeriod->where('type', 'expense')->sum('amount'),
            'receivables' => $currentPeriod->where('type', 'receivable')->sum('amount'),
            'payables' => $currentPeriod->where('type', 'payable')->sum('amount'),
        ];

        $previousSummary = [
            'income' => $previousPeriod->where('type', 'income')->sum('amount'),
            'expenses' => $previousPeriod->where('type', 'expense')->sum('amount'),
            'receivables' => $previousPeriod->where('type', 'receivable')->sum('amount'),
            'payables' => $previousPeriod->where('type', 'payable')->sum('amount'),
        ];

        return [
            'current' => $currentSummary,
            'previous' => $previousSummary,
            'changes' => [
                'income' => $this->calculatePercentageChange($previousSummary['income'], $currentSummary['income']),
                'expenses' => $this->calculatePercentageChange($previousSummary['expenses'], $currentSummary['expenses']),
                'receivables' => $this->calculatePercentageChange($previousSummary['receivables'], $currentSummary['receivables']),
                'payables' => $this->calculatePercentageChange($previousSummary['payables'], $currentSummary['payables']),
            ],
        ];
    }

    /**
     * Convert amount to user's preferred currency
     */
    public function convertCurrency(float $amount, string $fromCurrency, User $user): array
    {
        $primaryCurrency = $user->primary_currency ?? 'USD';
        $secondaryCurrency = $user->secondary_currency ?? 'EUR';
        $exchangeRate = $user->exchange_rate ?? 1.0;

        $result = [
            'original' => [
                'amount' => $amount,
                'currency' => $fromCurrency,
            ],
            'primary' => [
                'amount' => $amount, // Default to same amount
                'currency' => $primaryCurrency,
            ],
            'secondary' => [
                'amount' => $amount * $exchangeRate,
                'currency' => $secondaryCurrency,
            ],
        ];

        // If the original currency is not the primary currency, convert it
        if ($fromCurrency !== $primaryCurrency) {
            // This is a simplified conversion - in a real app, you'd use a proper exchange rate API
            $result['primary']['amount'] = $amount; // You'd apply proper conversion here
        }

        return $result;
    }

    /**
     * Get system-wide financial summary (for admins)
     */
    public function getSystemFinancialSummary(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        return $this->getFinancialSummary(null, $startDate, $endDate);
    }

    /**
     * Get system-wide monthly chart data (for admins)
     */
    public function getSystemMonthlyChartData(): array
    {
        return $this->getMonthlyChartData(null);
    }

    /**
     * Get system-wide yearly chart data (for admins)
     */
    public function getSystemYearlyChartData(): array
    {
        return $this->getYearlyChartData(null);
    }

    /**
     * Get system-wide category breakdown (for admins)
     */
    public function getSystemCategoryBreakdown(?Carbon $startDate = null): array
    {
        return $this->getCategoryBreakdown(null, $startDate);
    }

    /**
     * Get system-wide yearly category breakdown (for admins)
     */
    public function getSystemYearlyCategoryBreakdown(?int $year = null): array
    {
        return $this->getYearlyCategoryBreakdown(null, $year);
    }

    /**
     * Get system-wide upcoming transactions (for admins)
     */
    public function getSystemUpcomingTransactions(int $days = 30): Collection
    {
        return $this->getUpcomingTransactions(null, $days);
    }
}
