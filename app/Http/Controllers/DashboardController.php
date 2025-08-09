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

        // Recent transactions (last 10)
        $recentTransactions = Transaction::with('category')
            ->forUser($user->id)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Debug: Get total transaction count for user
        $totalTransactions = Transaction::forUser($user->id)->count();

        // Get current month financial summary
        $currentSummary = $this->transactionService->getFinancialSummary(
            $user,
            $currentMonth,
            Carbon::now()->endOfMonth()
        );

        // Get previous month for comparison
        $previousMonth = Carbon::now()->subMonth()->startOfMonth();
        $previousSummary = $this->transactionService->getFinancialSummary(
            $user,
            $previousMonth,
            $previousMonth->copy()->endOfMonth()
        );

        // Calculate changes
        $changes = [
            'income_change' => $this->calculatePercentageChange($previousSummary['total_income'], $currentSummary['total_income']),
            'expense_change' => $this->calculatePercentageChange($previousSummary['total_expenses'], $currentSummary['total_expenses']),
            'receivables_change' => $this->calculatePercentageChange($previousSummary['total_receivables'], $currentSummary['total_receivables']),
            'payables_change' => $this->calculatePercentageChange($previousSummary['total_payables'], $currentSummary['total_payables']),
            'balance_change' => $this->calculatePercentageChange($previousSummary['net_balance'], $currentSummary['net_balance']),
        ];

        // Monthly chart data (last 6 months)
        $monthlyData = $this->transactionService->getMonthlyChartData($user);

        // Yearly chart data (last 5 years)
        $yearlyData = $this->transactionService->getYearlyChartData($user);

        // Category breakdown for current month
        $categoryData = $this->transactionService->getCategoryBreakdown($user, $currentMonth);

        // Yearly category breakdown for current year
        $yearlyCategoryData = $this->transactionService->getYearlyCategoryBreakdown($user);

        // Upcoming transactions
        $upcomingTransactions = $this->transactionService->getUpcomingTransactions($user);

        return Inertia::render('dashboard', [
            'recentTransactions' => $recentTransactions,
            'currentSummary' => $currentSummary,
            'changes' => $changes,
            'monthlyData' => $monthlyData,
            'yearlyData' => $yearlyData,
            'categoryData' => $categoryData,
            'yearlyCategoryData' => $yearlyCategoryData,
            'upcomingTransactions' => $upcomingTransactions,
            'debug' => [
                'totalTransactions' => $totalTransactions,
                'currentMonth' => $currentMonth->format('Y-m-d'),
                'monthlyDataSample' => $monthlyData['datasets'][0]['data'] ?? [],
            ],
        ]);
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
