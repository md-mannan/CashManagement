<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SystemAuditController extends Controller
{
    public function index(Request $request)
    {
        // Get system health metrics
        $systemHealth = $this->getSystemHealth();

        // Get security audit data
        $securityAudit = $this->getSecurityAudit();

        // Get performance metrics
        $performanceMetrics = $this->getPerformanceMetrics();

        // Get user activity summary
        $userActivity = $this->getUserActivitySummary();

        // Get system configuration audit
        $configAudit = $this->getConfigurationAudit();

        // Get recent activities for the audit log
        $recentActivities = $this->getRecentActivities();

        return Inertia::render('admin/system-audit', [
            'systemHealth' => $systemHealth,
            'securityAudit' => $securityAudit,
            'performanceMetrics' => $performanceMetrics,
            'userActivity' => $userActivity,
            'configAudit' => $configAudit,
            'recentActivities' => $recentActivities,
        ]);
    }

    private function getSystemHealth()
    {
        return [
            'database' => [
                'status' => $this->checkDatabaseHealth(),
                'connections' => DB::connection()->getPdo() ? 'Connected' : 'Disconnected',
                'tables' => $this->getDatabaseTableInfo(),
            ],
            'storage' => [
                'disk_usage' => $this->getDiskUsage(),
                'log_size' => $this->getLogFileSizes(),
            ],
            'cache' => [
                'status' => Cache::get('system_health_check') ? 'Working' : 'Not Working',
                'driver' => config('cache.default'),
            ],
            'queue' => [
                'status' => $this->checkQueueStatus(),
                'failed_jobs' => DB::table('failed_jobs')->count(),
            ],
        ];
    }

    private function getSecurityAudit()
    {
        $users = User::all();

        return [
            'user_security' => [
                'total_users' => $users->count(),
                'active_users' => $users->where('is_active', true)->count(),
                'inactive_users' => $users->where('is_active', false)->count(),
                'users_without_email_verification' => $users->where('email_verified_at', null)->count(),
                'recent_logins' => ActivityLog::where('action', 'user_login')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count(),
                'failed_login_attempts' => ActivityLog::where('action', 'failed_login')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count(),
            ],
            'permission_audit' => [
                'super_admins' => $users->where('role', 'super_admin')->count(),
                'admins' => $users->where('role', 'admin')->count(),
                'regular_users' => $users->where('role', 'user')->count(),
                'users_with_permissions' => $users->filter(function ($user) {
                    return !empty($user->permissions);
                })->count(),
            ],
            'activity_monitoring' => [
                'suspicious_activities' => $this->detectSuspiciousActivities(),
                'unusual_access_patterns' => $this->detectUnusualAccessPatterns(),
            ],
        ];
    }

    private function getPerformanceMetrics()
    {
        return [
            'database_performance' => [
                'slow_queries' => $this->getSlowQueries(),
                'table_sizes' => $this->getTableSizes(),
                'index_usage' => $this->getIndexUsage(),
            ],
            'application_performance' => [
                'response_times' => $this->getAverageResponseTimes(),
                'memory_usage' => memory_get_usage(true),
                'peak_memory' => memory_get_peak_usage(true),
            ],
            'cache_performance' => [
                'hit_rate' => $this->getCacheHitRate(),
                'miss_rate' => $this->getCacheMissRate(),
            ],
        ];
    }

    private function getUserActivitySummary()
    {
        $lastWeek = now()->subWeek();
        $lastMonth = now()->subMonth();

        return [
            'recent_activity' => [
                'last_24_hours' => ActivityLog::where('created_at', '>=', now()->subDay())->count(),
                'last_week' => ActivityLog::where('created_at', '>=', $lastWeek)->count(),
                'last_month' => ActivityLog::where('created_at', '>=', $lastMonth)->count(),
            ],
            'top_actions' => ActivityLog::select('action', DB::raw('count(*) as count'))
                ->where('created_at', '>=', $lastMonth)
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'top_users' => ActivityLog::select('user_id', DB::raw('count(*) as count'))
                ->with('user:id,name,email')
                ->where('created_at', '>=', $lastMonth)
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'activity_trends' => $this->getActivityTrends(),
        ];
    }

    private function getConfigurationAudit()
    {
        return [
            'app_config' => [
                'environment' => config('app.env'),
                'debug_mode' => config('app.debug'),
                'timezone' => config('app.timezone'),
                'locale' => config('app.locale'),
            ],
            'security_config' => [
                'session_lifetime' => config('session.lifetime'),
                'password_timeout' => config('auth.password_timeout'),
                'throttle_attempts' => config('auth.throttle_attempts'),
            ],
            'database_config' => [
                'connection' => config('database.default'),
                'strict_mode' => config('database.connections.mysql.strict', false),
            ],
        ];
    }

    private function checkDatabaseHealth()
    {
        try {
            DB::connection()->getPdo();
            return 'Healthy';
        } catch (\Exception $e) {
            return 'Unhealthy: ' . $e->getMessage();
        }
    }

    private function getDatabaseTableInfo()
    {
        try {
            $tables = DB::select('SHOW TABLES');
            return count($tables);
        } catch (\Exception $e) {
            return 'Error: ' . $e->getMessage();
        }
    }

    private function getDiskUsage()
    {
        $path = storage_path();
        $total = disk_total_space($path);
        $free = disk_free_space($path);
        $used = $total - $free;

        return [
            'total' => $this->formatBytes($total),
            'used' => $this->formatBytes($used),
            'free' => $this->formatBytes($free),
            'percentage' => round(($used / $total) * 100, 2),
        ];
    }

    private function getLogFileSizes()
    {
        $logPath = storage_path('logs');
        $totalSize = 0;

        if (File::exists($logPath)) {
            $files = File::files($logPath);
            foreach ($files as $file) {
                $totalSize += $file->getSize();
            }
        }

        return $this->formatBytes($totalSize);
    }

    private function checkQueueStatus()
    {
        try {
            // Simple queue health check
            Cache::put('system_health_check', true, 60);
            return 'Working';
        } catch (\Exception $e) {
            return 'Not Working: ' . $e->getMessage();
        }
    }

    private function detectSuspiciousActivities()
    {
        $suspiciousActivities = [];

        // Check for multiple failed login attempts
        $failedLogins = ActivityLog::where('action', 'failed_login')
            ->where('created_at', '>=', now()->subHour())
            ->groupBy('ip_address')
            ->havingRaw('count(*) > 5')
            ->get();

        if ($failedLogins->count() > 0) {
            $suspiciousActivities[] = [
                'type' => 'Multiple Failed Logins',
                'count' => $failedLogins->count(),
                'description' => 'Multiple failed login attempts detected from same IP addresses',
            ];
        }

        // Check for unusual activity patterns
        $unusualActivity = ActivityLog::where('created_at', '>=', now()->subHour())
            ->groupBy('user_id')
            ->havingRaw('count(*) > 100')
            ->get();

        if ($unusualActivity->count() > 0) {
            $suspiciousActivities[] = [
                'type' => 'Unusual Activity Volume',
                'count' => $unusualActivity->count(),
                'description' => 'Users with unusually high activity volume detected',
            ];
        }

        return $suspiciousActivities;
    }

    private function detectUnusualAccessPatterns()
    {
        $patterns = [];

        // Check for access from unusual locations (if we had location data)
        // For now, just check for multiple users from same IP
        $sameIpUsers = ActivityLog::where('created_at', '>=', now()->subDay())
            ->groupBy('ip_address')
            ->havingRaw('count(DISTINCT user_id) > 3')
            ->get();

        if ($sameIpUsers->count() > 0) {
            $patterns[] = [
                'type' => 'Multiple Users Same IP',
                'count' => $sameIpUsers->count(),
                'description' => 'Multiple users accessing from same IP address',
            ];
        }

        return $patterns;
    }

    private function getSlowQueries()
    {
        // This would require enabling slow query log in MySQL
        // For now, return a placeholder
        return 'Slow query logging not enabled';
    }

    private function getTableSizes()
    {
        try {
            $sizes = [];
            $tables = ['users', 'transactions', 'activity_logs', 'categories'];

            foreach ($tables as $table) {
                $size = DB::select("SELECT
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size_MB'
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                    AND table_name = ?", [$table]);

                $sizes[$table] = $size[0]->Size_MB ?? 0;
            }

            return $sizes;
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function getIndexUsage()
    {
        // This would require MySQL performance schema
        // For now, return a placeholder
        return 'Index usage statistics not available';
    }

    private function getAverageResponseTimes()
    {
        // This would require custom logging of response times
        // For now, return a placeholder
        return 'Response time logging not enabled';
    }

    private function getCacheHitRate()
    {
        // This would require custom cache statistics
        // For now, return a placeholder
        return 'Cache statistics not available';
    }

    private function getCacheMissRate()
    {
        // This would require custom cache statistics
        // For now, return a placeholder
        return 'Cache statistics not available';
    }

    private function getActivityTrends()
    {
        $trends = [];

        // Get daily activity for last 7 days
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = ActivityLog::whereDate('created_at', $date)->count();

            $trends[] = [
                'date' => $date->format('Y-m-d'),
                'count' => $count,
            ];
        }

        return $trends;
    }

    /**
     * Get recent activities for the audit log
     */
    private function getRecentActivities()
    {
        return ActivityLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'user' => $activity->user ? $activity->user->name : 'System',
                    'target' => $activity->target ?? 'System',
                    'created_at' => $activity->created_at->toISOString(),
                    'ip_address' => $activity->ip_address ?? 'N/A',
                ];
            });
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    public function export(Request $request)
    {
        $auditData = [
            'system_health' => $this->getSystemHealth(),
            'security_audit' => $this->getSecurityAudit(),
            'performance_metrics' => $this->getPerformanceMetrics(),
            'user_activity' => $this->getUserActivitySummary(),
            'config_audit' => $this->getConfigurationAudit(),
        ];

        $filename = 'system_audit_' . now()->format('Y-m-d_H-i-s') . '.json';

        return response()->json($auditData)
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
