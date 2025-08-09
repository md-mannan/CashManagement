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

        // Get current and previous month trends
        $trends = $this->transactionService->getTransactionTrends(
            $user,
            $currentMonth,
            Carbon::now()->endOfMonth()
        );

        // Monthly chart data (last 6 months)
        $monthlyData = $this->transactionService->getMonthlyChartData($user);

        // Category breakdown for current month
        $categoryData = $this->transactionService->getCategoryBreakdown($user, $currentMonth);

        // Upcoming transactions
        $upcomingTransactions = $this->transactionService->getUpcomingTransactions($user);

        return Inertia::render('dashboard', [
            'recentTransactions' => $recentTransactions,
            'currentSummary' => $trends['current'],
            'changes' => $trends['changes'],
            'monthlyData' => $monthlyData,
            'categoryData' => $categoryData,
            'upcomingTransactions' => $upcomingTransactions,
        ]);
    }
}
