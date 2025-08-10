<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SystemHealthController extends Controller
{
    public function index()
    {
        try {
            Log::info('SystemHealthController: Starting system health check');

            $systemHealth = [
                'database' => $this->getDatabaseHealth(),
                'cache' => $this->getCacheHealth(),
                'storage' => $this->getStorageHealth(),
                'performance' => $this->getPerformanceMetrics(),
                'security' => $this->getSecurityStatus(),
            ];

            Log::info('SystemHealthController: System health data collected', ['data' => $systemHealth]);

            return Inertia::render('admin/system-health', [
                'systemHealth' => $systemHealth,
            ]);
        } catch (\Exception $e) {
            Log::error('SystemHealthController: Error in index method', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return error response
            return Inertia::render('admin/system-health', [
                'systemHealth' => null,
                'error' => 'Failed to load system health data: ' . $e->getMessage(),
            ]);
        }
    }

    private function getDatabaseHealth()
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $executionTime = microtime(true) - $start;

            return [
                'status' => 'healthy',
                'version' => DB::connection()->getPdo()->getAttribute(\PDO::ATTR_SERVER_VERSION),
                'connection' => config('database.default'),
                'last_check' => now()->toISOString(),
                'execution_time' => round($executionTime * 1000, 2) . 'ms',
            ];
        } catch (\Exception $e) {
            Log::error('SystemHealthController: Database health check failed', ['error' => $e->getMessage()]);
            return [
                'status' => 'unhealthy',
                'connection' => config('database.default'),
                'last_check' => now()->toISOString(),
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getCacheHealth()
    {
        try {
            $start = microtime(true);
            $testKey = 'health_check_' . time();
            Cache::put($testKey, 'test', 60);
            $value = Cache::get($testKey);
            Cache::forget($testKey);
            $executionTime = microtime(true) - $start;

            if ($value === 'test') {
                return [
                    'status' => 'healthy',
                    'driver' => config('cache.default'),
                    'connection' => config('cache.stores.' . config('cache.default') . '.connection', 'default'),
                    'last_check' => now()->toISOString(),
                    'execution_time' => round($executionTime * 1000, 2) . 'ms',
                ];
            } else {
                return [
                    'status' => 'warning',
                    'driver' => config('cache.default'),
                    'connection' => config('cache.stores.' . config('cache.default') . '.connection', 'default'),
                    'last_check' => now()->toISOString(),
                    'error' => 'Cache read/write test failed',
                ];
            }
        } catch (\Exception $e) {
            Log::error('SystemHealthController: Cache health check failed', ['error' => $e->getMessage()]);
            return [
                'status' => 'unhealthy',
                'driver' => config('cache.default'),
                'connection' => config('cache.stores.' . config('cache.default') . '.connection', 'default'),
                'last_check' => now()->toISOString(),
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getStorageHealth()
    {
        try {
            $disk = Storage::disk('local');
            $totalSpace = disk_total_space(storage_path());
            $freeSpace = disk_free_space(storage_path());
            $usedSpace = $totalSpace - $freeSpace;
            $usagePercentage = round(($usedSpace / $totalSpace) * 100, 2);

            $status = 'healthy';
            if ($usagePercentage > 90) {
                $status = 'unhealthy';
            } elseif ($usagePercentage > 80) {
                $status = 'warning';
            }

            return [
                'status' => $status,
                'total_space' => $this->formatBytes($totalSpace),
                'free_space' => $this->formatBytes($freeSpace),
                'used_space' => $this->formatBytes($usedSpace),
                'usage_percentage' => $usagePercentage,
                'last_check' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            Log::error('SystemHealthController: Storage health check failed', ['error' => $e->getMessage()]);
            return [
                'status' => 'unhealthy',
                'last_check' => now()->toISOString(),
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getPerformanceMetrics()
    {
        try {
            return [
                'memory_usage' => $this->formatBytes(memory_get_usage(true)),
                'peak_memory' => $this->formatBytes(memory_get_peak_usage(true)),
                'execution_time' => round((microtime(true) - LARAVEL_START) * 1000, 2) . 'ms',
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'last_check' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            Log::error('SystemHealthController: Performance metrics failed', ['error' => $e->getMessage()]);
            return [
                'memory_usage' => 'Unknown',
                'peak_memory' => 'Unknown',
                'execution_time' => 'Unknown',
                'php_version' => 'Unknown',
                'laravel_version' => 'Unknown',
                'last_check' => now()->toISOString(),
            ];
        }
    }

    private function getSecurityStatus()
    {
        try {
            return [
                'app_debug' => config('app.debug'),
                'app_environment' => config('app.env'),
                'session_secure' => config('session.secure'),
                'session_http_only' => config('session.http_only'),
                'session_same_site' => config('session.same_site'),
                'last_check' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            Log::error('SystemHealthController: Security status failed', ['error' => $e->getMessage()]);
            return [
                'app_debug' => false,
                'app_environment' => 'Unknown',
                'session_secure' => false,
                'session_http_only' => false,
                'session_same_site' => 'Unknown',
                'last_check' => now()->toISOString(),
            ];
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
