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

        // Admins and super admins can view all data
        if ($user->isAdmin()) {
            // Recent transactions from all users (last 10)
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

            // System-wide financial summary (all-time data for main cards)
            $currentSummary = $this->transactionService->getSystemFinancialSummary();

            $previousMonth = Carbon::now()->subMonth()->startOfMonth();
            $previousSummary = $this->transactionService->getSystemFinancialSummary(
                $previousMonth,
                $previousMonth->copy()->endOfMonth()
            );
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
            $currentSummary = $this->transactionService->getFinancialSummary($user);

            $previousMonth = Carbon::now()->subMonth()->startOfMonth();
            $previousSummary = $this->transactionService->getFinancialSummary(
                $user,
                $previousMonth,
                $previousMonth->copy()->endOfMonth()
            );
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
        $netBalanceFormula = 'Income - Expenses - Total Receivables + Receivable Settlements';

        // Monthly chart data
        if ($user->isAdmin()) {
            $monthlyData = $this->transactionService->getSystemMonthlyChartData();
            $yearlyData = $this->transactionService->getSystemYearlyChartData();
            $categoryData = $this->transactionService->getSystemCategoryBreakdown($currentMonth);
            $yearlyCategoryData = $this->transactionService->getSystemYearlyCategoryBreakdown();

        } else {
            $monthlyData = $this->transactionService->getMonthlyChartData($user);
            $yearlyData = $this->transactionService->getYearlyChartData($user);
            $categoryData = $this->transactionService->getCategoryBreakdown($user, $currentMonth);
            $yearlyCategoryData = $this->transactionService->getYearlyCategoryBreakdown($user);

        }

        // Add payable/receivable settlement summaries (excluding settlement transactions)
        if ($user->isAdmin()) {
            // Admin sees all transactions
            $payableSummary = Transaction::where('type', 'payable')
                ->whereNull('related_transaction_id') // Exclude settlement transactions
                ->selectRaw('
                    COUNT(*) as total_count,
                    SUM(amount) as total_amount,
                    SUM(COALESCE(settled_amount, 0)) as total_settled,
                    SUM(amount - COALESCE(settled_amount, 0)) as total_outstanding'
                )->first();

            $receivableSummary = Transaction::where('type', 'receivable')
                ->whereNull('related_transaction_id') // Exclude settlement transactions
                ->selectRaw('
                    COUNT(*) as total_count,
                    SUM(amount) as total_amount,
                    SUM(COALESCE(settled_amount, 0)) as total_settled,
                    SUM(amount - COALESCE(settled_amount, 0)) as total_outstanding'
                )->first();
        } else {
            // Regular users see only their own transactions
            $payableSummary = Transaction::where('type', 'payable')
                ->where('user_id', $user->id)
                ->whereNull('related_transaction_id') // Exclude settlement transactions
                ->selectRaw('
                    COUNT(*) as total_count,
                    SUM(amount) as total_amount,
                    SUM(COALESCE(settled_amount, 0)) as total_settled,
                    SUM(amount - COALESCE(settled_amount, 0)) as total_outstanding'
                )->first();

            $receivableSummary = Transaction::where('type', 'receivable')
                ->where('user_id', $user->id)
                ->whereNull('related_transaction_id') // Exclude settlement transactions
                ->selectRaw('
                    COUNT(*) as total_count,
                    SUM(amount) as total_amount,
                    SUM(COALESCE(settled_amount, 0)) as total_settled,
                    SUM(amount - COALESCE(settled_amount, 0)) as total_outstanding'
                )->first();
        }

        return Inertia::render('dashboard', [
            'recentTransactions' => $recentTransactions,
            'currentSummary' => $currentSummary,
            'changes' => $changes,
            'netBalanceFormula' => $netBalanceFormula,
            'monthlyData' => $monthlyData,
            'yearlyData' => $yearlyData,
            'categoryData' => $categoryData,
            'yearlyCategoryData' => $yearlyCategoryData,

            'isAdmin' => $user->isAdmin(),
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
