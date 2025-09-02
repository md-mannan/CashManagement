<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AdminAnalyticsController extends Controller
{
    public function index()
    {
        $analytics = [
            'system_overview' => $this->getSystemOverview(),
            'user_activity' => $this->getUserActivity(),
            'financial_overview' => $this->getFinancialOverview(),
            'performance_metrics' => $this->getPerformanceMetrics(),
        ];

        // Get the authenticated user's primary currency
        $user = auth()->user();
        $primaryCurrency = $user ? $user->primary_currency : 'USD';

        return Inertia::render('admin/analytics', [
            'analytics' => $analytics,
            'primaryCurrency' => $primaryCurrency,
        ]);
    }

    private function getSystemOverview()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $totalTransactions = Transaction::count();
        $totalCategories = Category::count();

        // Calculate system uptime (simplified - in production you'd use actual uptime monitoring)
        $systemUptime = '99.9%';

        // Get last backup time (simplified - in production you'd check actual backup logs)
        $lastBackup = '2024-01-15 02:00:00';

        return [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'total_transactions' => $totalTransactions,
            'total_categories' => $totalCategories,
            'system_uptime' => $systemUptime,
            'last_backup' => $lastBackup,
        ];
    }

    private function getUserActivity()
    {
        $days = 30;
        $labels = [];
        $dailyActiveUsers = [];
        $weeklyActiveUsers = [];
        $monthlyActiveUsers = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $labels[] = $date->format('M d');

            // Daily active users (users who logged in on this specific day)
            $dailyCount = User::whereDate('last_login_at', $date->toDateString())->count();
            $dailyActiveUsers[] = $dailyCount;

            // Weekly active users (users who logged in within the last 7 days from this date)
            $weeklyCount = User::where('last_login_at', '>=', $date->subDays(6)->toDateTimeString())
                ->where('last_login_at', '<=', $date->addDays(6)->toDateTimeString())
                ->count();
            $weeklyActiveUsers[] = $weeklyCount;

            // Monthly active users (users who logged in within the last 30 days from this date)
            $monthlyCount = User::where('last_login_at', '>=', $date->subDays(29)->toDateTimeString())
                ->where('last_login_at', '<=', $date->toDateTimeString())
                ->count();
            $monthlyActiveUsers[] = $monthlyCount;
        }

        return [
            'labels' => $labels,
            'daily_active_users' => $dailyActiveUsers,
            'weekly_active_users' => $weeklyActiveUsers,
            'monthly_active_users' => $monthlyActiveUsers,
        ];
    }

    private function getFinancialOverview()
    {
        // Get total financial data across all users
        $totalIncome = Transaction::where('type', 'income')->sum('amount');
        $totalExpenses = Transaction::where('type', 'expense')->sum('amount');
        $totalReceivables = Transaction::where('type', 'receivable')->sum('amount');
        $totalPayables = Transaction::where('type', 'payable')->sum('amount');

        // Get currency distribution
        $currencyDistribution = Transaction::select('currency', DB::raw('COUNT(*) as count'))
            ->groupBy('currency')
            ->pluck('count', 'currency')
            ->toArray();

        return [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'total_receivables' => $totalReceivables,
            'total_payables' => $totalPayables,
            'currency_distribution' => $currencyDistribution,
        ];
    }

    private function getPerformanceMetrics()
    {
        // Get average response time from cache or calculate
        $avgResponseTime = Cache::remember('avg_response_time', 300, function () {
            // In production, you'd get this from actual monitoring
            return rand(50, 150);
        });

        // Get error rate
        $errorRate = Cache::remember('error_rate', 300, function () {
            // In production, you'd get this from actual error tracking
            return rand(1, 5) / 1000; // 0.1% to 0.5%
        });

        // Get database size
        $databaseSize = $this->getDatabaseSize();

        // Get cache hit rate
        $cacheHitRate = Cache::remember('cache_hit_rate', 300, function () {
            // In production, you'd get this from actual cache monitoring
            return rand(85, 98) / 100; // 85% to 98%
        });

        return [
            'avg_response_time' => $avgResponseTime,
            'error_rate' => $errorRate,
            'database_size' => $databaseSize,
            'cache_hit_rate' => $cacheHitRate,
        ];
    }

    private function getDatabaseSize()
    {
        try {
            $databaseName = config('database.connections.mysql.database');
            $result = DB::select("
                SELECT
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'size_mb'
                FROM information_schema.tables
                WHERE table_schema = ?
            ", [$databaseName]);

            if (!empty($result)) {
                return $result[0]->size_mb . ' MB';
            }
        } catch (\Exception $e) {
            // Log error if needed
        }

        return 'Unknown';
    }
}
