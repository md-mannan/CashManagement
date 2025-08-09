<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TransactionService
{
    /**
     * Calculate financial summary for a user
     */
    public function getFinancialSummary(User $user, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $query = $user->transactions();

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        $transactions = $query->get();

        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpenses = $transactions->where('type', 'expense')->sum('amount');
        $totalReceivables = $transactions->where('type', 'receivable')->sum('amount');
        $totalPayables = $transactions->where('type', 'payable')->sum('amount');

        // Calculate original entered amounts in secondary currency
        $secondaryAmounts = $this->calculateSecondaryAmountSums($transactions, $user);

        return [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'total_receivables' => $totalReceivables,
            'total_payables' => $totalPayables,
            'net_balance' => ($totalIncome + $totalReceivables) - ($totalExpenses + $totalPayables),
            'pending_receivables' => $transactions->where('type', 'receivable')->where('status', 'pending')->sum('amount'),
            'pending_payables' => $transactions->where('type', 'payable')->where('status', 'pending')->sum('amount'),
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
        ];

        foreach ($transactions as $transaction) {
            $originalSecondaryAmount = 0;

            // If transaction was entered in secondary currency, use the original amount
            if ($transaction->metadata &&
                isset($transaction->metadata['secondary_currency']) &&
                isset($transaction->metadata['secondary_amount']) &&
                $transaction->metadata['secondary_currency'] === $user->secondary_currency) {

                $originalSecondaryAmount = $transaction->metadata['secondary_amount'];
            } else {
                // Transaction was entered in primary currency, convert using current rate
                $originalSecondaryAmount = $transaction->amount / ($user->exchange_rate ?: 1);
            }

            // Add to appropriate total
            switch ($transaction->type) {
                case 'income':
                    $totals['total_income'] += $originalSecondaryAmount;
                    break;
                case 'expense':
                    $totals['total_expenses'] += $originalSecondaryAmount;
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
     * Get monthly chart data for dashboard
     */
    public function getMonthlyChartData(User $user, int $months = 6): array
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

        for ($i = $months - 1; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $transactions = $user->transactions()
                ->dateRange($startOfMonth, $endOfMonth)
                ->get();

            $data['labels'][] = $month->format('M Y');
            $data['datasets'][0]['data'][] = $transactions->where('type', 'income')->sum('amount');
            $data['datasets'][1]['data'][] = $transactions->where('type', 'expense')->sum('amount');
            $data['datasets'][2]['data'][] = $transactions->where('type', 'receivable')->sum('amount');
            $data['datasets'][3]['data'][] = $transactions->where('type', 'payable')->sum('amount');
        }

        return $data;
    }

    /**
     * Get yearly chart data for dashboard
     */
    public function getYearlyChartData(User $user, int $years = 5): array
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

        for ($i = $years - 1; $i >= 0; $i--) {
            $year = Carbon::now()->subYears($i);
            $startOfYear = $year->copy()->startOfYear();
            $endOfYear = $year->copy()->endOfYear();

            $transactions = $user->transactions()
                ->dateRange($startOfYear, $endOfYear)
                ->get();

            $data['labels'][] = $year->format('Y');
            $data['datasets'][0]['data'][] = $transactions->where('type', 'income')->sum('amount');
            $data['datasets'][1]['data'][] = $transactions->where('type', 'expense')->sum('amount');
            $data['datasets'][2]['data'][] = $transactions->where('type', 'receivable')->sum('amount');
            $data['datasets'][3]['data'][] = $transactions->where('type', 'payable')->sum('amount');
        }

        return $data;
    }

    /**
     * Get category breakdown for pie chart
     */
    public function getCategoryBreakdown(User $user, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $query = $user->transactions()->with('category');

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
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
    public function getYearlyCategoryBreakdown(User $user, ?int $year = null): array
    {
        $targetYear = $year ?? Carbon::now()->year;
        $startOfYear = Carbon::create($targetYear)->startOfYear();
        $endOfYear = Carbon::create($targetYear)->endOfYear();

        return $this->getCategoryBreakdown($user, $startOfYear, $endOfYear);
    }

    /**
     * Get upcoming transactions (receivables and payables)
     */
    public function getUpcomingTransactions(User $user, int $days = 30): Collection
    {
        return $user->transactions()
            ->with('category')
            ->whereIn('type', ['receivable', 'payable'])
            ->where('status', 'pending')
            ->where('due_date', '<=', Carbon::now()->addDays($days))
            ->orderBy('due_date', 'asc')
            ->get();
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
}
