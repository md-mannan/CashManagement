<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class DatabaseManagementController extends Controller
{
    public function index()
    {
        $databaseStatus = $this->getDatabaseStatus();
        $tables = $this->getTables();
        $performanceMetrics = $this->getPerformanceMetrics();

        return Inertia::render('admin/database', [
            'databaseStatus' => $databaseStatus,
            'tables' => $tables,
            'performanceMetrics' => $performanceMetrics,
        ]);
    }

    private function getDatabaseStatus()
    {
        try {
            $connection = DB::connection();
            $pdo = $connection->getPdo();

            // Get database size
            $databaseSize = $this->getDatabaseSize();

            // Get table count
            $tableCount = count(DB::select('SHOW TABLES'));

            return [
                'connection' => config('database.default'),
                'version' => $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION),
                'uptime' => $this->getDatabaseUptime(),
                'threads' => $this->getActiveThreads(),
                'queries_per_second' => $this->getQueriesPerSecond(),
                'slow_queries' => $this->getSlowQueries(),
                'connections' => $this->getActiveConnections(),
                'max_connections' => $this->getMaxConnections(),
                'total_size' => $databaseSize,
                'table_count' => $tableCount,
            ];
        } catch (\Exception $e) {
            return [
                'connection' => 'Error',
                'version' => 'Unknown',
                'uptime' => 'Unknown',
                'threads' => 0,
                'queries_per_second' => 0,
                'slow_queries' => 0,
                'connections' => 0,
                'max_connections' => 0,
                'total_size' => '0 MB',
                'table_count' => 0,
            ];
        }
    }

    private function getTables()
    {
        try {
            $tables = [];
            $allTables = DB::select('SHOW TABLES');

            foreach ($allTables as $tableObj) {
                $tableName = array_values((array) $tableObj)[0];

                // Get table size
                $sizeQuery = DB::select("SELECT
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size_MB',
                    table_rows
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                    AND table_name = ?", [$tableName]);

                $size = $sizeQuery[0] ?? null;

                $tables[] = [
                    'name' => $tableName,
                    'rows' => $size ? $size->table_rows : 0,
                    'data_length' => $size ? $size->Size_MB : 0,
                    'index_length' => 0, // We'll set this to 0 for now
                    'engine' => $this->getTableEngine($tableName),
                    'collation' => $this->getTableCollation($tableName),
                    'size' => $size ? $size->Size_MB . ' MB' : '0 MB',
                ];
            }

            // Sort by size descending
            usort($tables, function($a, $b) {
                return $b['data_length'] <=> $a['data_length'];
            });

            return $tables;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getTableEngine($tableName)
    {
        try {
            $result = DB::select("SHOW TABLE STATUS WHERE Name = ?", [$tableName]);
            return $result[0]->Engine ?? 'Unknown';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    private function getTableCollation($tableName)
    {
        try {
            $result = DB::select("SHOW TABLE STATUS WHERE Name = ?", [$tableName]);
            return $result[0]->Collation ?? 'Unknown';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    private function getPerformanceMetrics()
    {
        try {
            return [
                'query_time' => $this->getAverageQueryTime(),
                'cache_hit_rate' => $this->getCacheHitRate(),
                'slow_query_percentage' => $this->getSlowQueryPercentage(),
            ];
        } catch (\Exception $e) {
            return [
                'query_time' => 0,
                'cache_hit_rate' => 0,
                'slow_query_percentage' => 0,
            ];
        }
    }

    private function getBackupInfo()
    {
        $backupPath = storage_path('backups');
        $backups = [];

        if (File::exists($backupPath)) {
            $files = File::files($backupPath);
            foreach ($files as $file) {
                if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                    $backups[] = [
                        'name' => $file->getFilename(),
                        'size' => $this->formatBytes($file->getSize()),
                        'modified' => $file->getMTime(),
                        'path' => $file->getPathname(),
                    ];
                }
            }
        }

        // Sort by modification time (newest first)
        usort($backups, function($a, $b) {
            return $b['modified'] <=> $a['modified'];
        });

        return [
            'backup_path' => $backupPath,
            'backups' => $backups,
            'total_backups' => count($backups),
            'total_size' => $this->formatBytes(array_sum(array_column($backups, 'size'))),
        ];
    }

    public function optimize()
    {
        try {
            $tables = DB::select('SHOW TABLES');
            $optimizedTables = [];

            foreach ($tables as $tableObj) {
                $tableName = array_values((array) $tableObj)[0];

                try {
                    DB::statement("OPTIMIZE TABLE `{$tableName}`");
                    $optimizedTables[] = [
                        'table' => $tableName,
                        'status' => 'Optimized',
                    ];
                } catch (\Exception $e) {
                    $optimizedTables[] = [
                        'table' => $tableName,
                        'status' => 'Error: ' . $e->getMessage(),
                    ];
                }
            }

            // Log the optimization
            Log::info('Database optimization performed', [
                'user_id' => auth()->id(),
                'tables_optimized' => count($optimizedTables),
                'timestamp' => now(),
            ]);

            return redirect()->route('admin.database.index')->with('success', 'Database optimization completed successfully. ' . count($optimizedTables) . ' tables optimized.');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database optimization failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function repair()
    {
        try {
            $tables = DB::select('SHOW TABLES');
            $repairedTables = [];

            foreach ($tables as $tableObj) {
                $tableName = array_values((array) $tableObj)[0];

                try {
                    DB::statement("REPAIR TABLE `{$tableName}`");
                    $repairedTables[] = [
                        'table' => $tableName,
                        'status' => 'Repaired',
                    ];
                } catch (\Exception $e) {
                    $repairedTables[] = [
                        'table' => $tableName,
                        'status' => 'Error: ' . $e->getMessage(),
                    ];
                }
            }

            // Log the repair
            Log::info('Database repair performed', [
                'user_id' => auth()->id(),
                'tables_repaired' => count($repairedTables),
                'timestamp' => now(),
            ]);

            return redirect()->route('admin.database.index')->with('success', 'Database repair completed successfully. ' . count($repairedTables) . ' tables repaired.');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database repair failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function status()
    {
        try {
            $status = [
                'database' => $this->getDatabaseInfo(),
                'tables' => $this->getTableInfo(),
                'performance' => $this->getPerformanceInfo(),
                'backups' => $this->getBackupInfo(),
                'timestamp' => now()->toISOString(),
            ];

            return response()->json($status);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString(),
            ], 500);
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        if ($bytes <= 0) return '0 B';

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
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

        return '0 MB';
    }

    private function getDatabaseUptime()
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Uptime'");
            if (!empty($result)) {
                $seconds = $result[0]->Value;
                $days = floor($seconds / 86400);
                $hours = floor(($seconds % 86400) / 3600);
                $minutes = floor(($seconds % 3600) / 60);

                if ($days > 0) {
                    return "{$days}d {$hours}h {$minutes}m";
                } elseif ($hours > 0) {
                    return "{$hours}h {$minutes}m";
                } else {
                    return "{$minutes}m";
                }
            }
        } catch (\Exception $e) {
            // Log error if needed
        }

        return 'Unknown';
    }

    private function getActiveThreads()
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Threads_connected'");
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getQueriesPerSecond()
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Questions'");
            return rand(10, 100); // Mock data for now
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getSlowQueries()
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Slow_queries'");
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getActiveConnections()
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Threads_connected'");
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getMaxConnections()
    {
        try {
            $result = DB::select("SHOW VARIABLES LIKE 'max_connections'");
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getAverageQueryTime()
    {
        try {
            return rand(50, 150); // Mock data for now
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getCacheHitRate()
    {
        try {
            return rand(85, 98); // Mock data for now
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getSlowQueryPercentage()
    {
        try {
            return rand(1, 5); // Mock data for now
        } catch (\Exception $e) {
            return 0;
        }
    }
}
