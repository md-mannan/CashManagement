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

        return [
            'total_income' => $transactions->where('type', 'income')->sum('amount'),
            'total_expenses' => $transactions->where('type', 'expense')->sum('amount'),
            'total_receivables' => $transactions->where('type', 'receivable')->sum('amount'),
            'total_payables' => $transactions->where('type', 'payable')->sum('amount'),
            'net_balance' => $transactions->where('type', 'income')->sum('amount') - $transactions->where('type', 'expense')->sum('amount'),
            'pending_receivables' => $transactions->where('type', 'receivable')->where('status', 'pending')->sum('amount'),
            'pending_payables' => $transactions->where('type', 'payable')->where('status', 'pending')->sum('amount'),
        ];
    }

    /**
     * Get monthly chart data for dashboard
     */
    public function getMonthlyChartData(User $user, int $months = 6): array
    {
        $data = [
            'labels' => [],
            'income' => [],
            'expenses' => [],
        ];

        for ($i = $months - 1; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $transactions = $user->transactions()
                ->dateRange($startOfMonth, $endOfMonth)
                ->get();

            $data['labels'][] = $month->format('M Y');
            $data['income'][] = $transactions->where('type', 'income')->sum('amount');
            $data['expenses'][] = $transactions->where('type', 'expense')->sum('amount');
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

        $transactions = $query->whereIn('type', ['income', 'expense'])->get();

        $categoryData = [];

        foreach ($transactions->groupBy('category.name') as $categoryName => $categoryTransactions) {
            $total = $categoryTransactions->sum('amount');
            if ($total > 0) {
                $categoryData[] = [
                    'name' => $categoryName ?? 'Uncategorized',
                    'value' => $total,
                    'type' => $categoryTransactions->first()->type,
                    'color' => $categoryTransactions->first()->category->color ?? '#6B7280',
                ];
            }
        }

        return $categoryData;
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
