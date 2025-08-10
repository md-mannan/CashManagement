<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Transaction;
use App\Models\SocialAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    // Remove duplicate middleware since routes already handle it
    // public function __construct()
    // {
    //     $this->middleware('auth');
    //     $this->middleware('admin');
    // }

    public function index()
    {
        // Get user statistics
        $stats = $this->getUserStats();

        // Get system health information
        $systemHealth = $this->getSystemHealth();

        // Get recent users
        $recentUsers = User::with('socialAccounts')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get recent activity (you can implement an activity log system)
        $recentActivity = $this->getRecentActivity();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'systemHealth' => $systemHealth,
            'recentUsers' => $recentUsers,
            'recentActivity' => $recentActivity,
        ]);
    }

    private function getUserStats()
    {
        $now = now();
        $thisMonth = $now->startOfMonth();
        $lastMonth = $now->copy()->subMonth()->startOfMonth();
        $thisMonthEnd = $now->copy()->endOfMonth();
        $lastMonthEnd = $lastMonth->copy()->endOfMonth();

        // Total users
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = User::where('is_active', false)->count();

        // Admin counts
        $totalAdmins = User::where('role', 'admin')->count();
        $totalSuperAdmins = User::where('role', 'super_admin')->count();

        // Social users
        $socialUsers = SocialAccount::distinct('user_id')->count();

        // New users this month vs last month
        $newUsersThisMonth = User::whereBetween('created_at', [$thisMonth, $thisMonthEnd])->count();
        $newUsersLastMonth = User::whereBetween('created_at', [$lastMonth, $lastMonthEnd])->count();

        // Calculate growth rate
        $userGrowthRate = $lastMonth->diffInDays($thisMonth) > 0
            ? (($newUsersThisMonth - $newUsersLastMonth) / max($newUsersLastMonth, 1)) * 100
            : 0;

        // Login activity
        $lastLoginToday = User::whereDate('last_login_at', $now->toDateString())->count();
        $lastLoginThisWeek = User::whereBetween('last_login_at', [
            $now->startOfWeek(),
            $now->endOfWeek()
        ])->count();

        return [
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'inactiveUsers' => $inactiveUsers,
            'totalAdmins' => $totalAdmins,
            'totalSuperAdmins' => $totalSuperAdmins,
            'socialUsers' => $socialUsers,
            'newUsersThisMonth' => $newUsersThisMonth,
            'newUsersLastMonth' => $newUsersLastMonth,
            'userGrowthRate' => round($userGrowthRate, 1),
            'lastLoginToday' => $lastLoginToday,
            'lastLoginThisWeek' => $lastLoginThisWeek,
        ];
    }

    private function getSystemHealth()
    {
        // Check database connection
        try {
            DB::connection()->getPdo();
            $databaseStatus = 'healthy';
        } catch (\Exception $e) {
            $databaseStatus = 'error';
        }

        // Check cache status
        try {
            Cache::put('health_check', 'ok', 1);
            $cacheStatus = Cache::get('health_check') === 'ok' ? 'healthy' : 'warning';
        } catch (\Exception $e) {
            $cacheStatus = 'error';
        }

        // Check queue status (if using queues)
        try {
            $queueStatus = 'healthy'; // You can implement actual queue health check
        } catch (\Exception $e) {
            $queueStatus = 'warning';
        }

        // Get disk usage (simplified - you might want to implement actual disk monitoring)
        $diskUsage = $this->getDiskUsage();
        $memoryUsage = $this->getMemoryUsage();

        return [
            'databaseStatus' => $databaseStatus,
            'cacheStatus' => $cacheStatus,
            'queueStatus' => $queueStatus,
            'lastBackup' => null, // Implement backup tracking
            'diskUsage' => $diskUsage,
            'memoryUsage' => $memoryUsage,
        ];
    }

    private function getDiskUsage()
    {
        // Simplified disk usage calculation
        // In production, you might want to use actual disk monitoring
        $totalSpace = disk_total_space(storage_path());
        $freeSpace = disk_free_space(storage_path());

        if ($totalSpace > 0) {
            return round((($totalSpace - $freeSpace) / $totalSpace) * 100);
        }

        return 0;
    }

    private function getMemoryUsage()
    {
        // Simplified memory usage calculation
        // In production, you might want to use actual memory monitoring
        if (function_exists('memory_get_usage') && function_exists('memory_get_peak_usage')) {
            $memoryUsage = memory_get_usage(true);
            $memoryLimit = ini_get('memory_limit');

            if ($memoryLimit !== '-1') {
                $memoryLimitBytes = $this->convertToBytes($memoryLimit);
                return round(($memoryUsage / $memoryLimitBytes) * 100);
            }
        }

        return 0;
    }

    private function convertToBytes($size)
    {
        $size = trim($size);
        $last = strtolower($size[strlen($size) - 1]);
        $size = (int) $size;

        switch ($last) {
            case 'g':
                $size *= 1024;
            case 'm':
                $size *= 1024;
            case 'k':
                $size *= 1024;
        }

        return $size;
    }

    private function getRecentActivity()
    {
        // This is a placeholder for activity logging
        // In production, you should implement a proper activity log system
        // You can use packages like spatie/laravel-activitylog

        return [
            [
                'id' => 1,
                'user' => 'System',
                'action' => 'Dashboard accessed',
                'target' => 'Admin Dashboard',
                'created_at' => now()->subMinutes(5)->toISOString(),
                'ip_address' => request()->ip(),
            ],
            [
                'id' => 2,
                'user' => 'Admin User',
                'action' => 'Viewed user management',
                'target' => 'User Management',
                'created_at' => now()->subMinutes(15)->toISOString(),
                'ip_address' => request()->ip(),
            ],
        ];
    }
}
