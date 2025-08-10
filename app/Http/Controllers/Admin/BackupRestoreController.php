<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Carbon\Carbon;

class BackupRestoreController extends Controller
{
    public function index()
    {
        $backups = $this->getBackups();
        $backupStats = $this->getBackupStats();
        $storageInfo = $this->getStorageInfo();

        // Transform data to match frontend component expectations
        $transformedBackups = array_map(function($backup) {
            return [
                'filename' => $backup['name'],
                'size' => $backup['size'],
                'created_at' => $backup['modified_formatted'],
                'type' => $backup['extension'],
                'status' => 'completed', // Default status for existing backups
            ];
        }, $backups);

        $transformedStats = [
            'totalBackups' => $backupStats['total_backups'],
            'totalSize' => $backupStats['total_size'],
            'lastBackup' => $backupStats['newest_backup'] > 0 ? $this->formatTimeAgo($backupStats['newest_backup']) : 'Never',
            'nextScheduledBackup' => 'Not scheduled',
            'storageUsed' => $storageInfo['used_space'],
            'storageLimit' => $storageInfo['total_space'],
        ];

        $backupSettings = [
            'autoBackup' => false, // Default to false
            'backupFrequency' => 'weekly', // Default to weekly
            'retentionDays' => 30, // Default to 30 days
            'compression' => true, // Default to true
            'includeFiles' => false, // Default to false
        ];

        return Inertia::render('admin/backup', [
            'backups' => $transformedBackups,
            'stats' => $transformedStats,
            'backupSettings' => $backupSettings,
        ]);
    }

    private function getBackups()
    {
        $backupPath = storage_path('backups');
        $backups = [];

        if (File::exists($backupPath)) {
            $files = File::files($backupPath);
            foreach ($files as $file) {
                if (in_array(pathinfo($file, PATHINFO_EXTENSION), ['sql', 'gz', 'zip'])) {
                    $backups[] = [
                        'id' => uniqid(),
                        'name' => $file->getFilename(),
                        'size' => $this->formatBytes($file->getSize()),
                        'size_bytes' => $file->getSize(),
                        'modified' => $file->getMTime(),
                        'modified_formatted' => Carbon::createFromTimestamp($file->getMTime())->format('Y-m-d H:i:s'),
                        'path' => $file->getPathname(),
                        'extension' => pathinfo($file, PATHINFO_EXTENSION),
                        'age_days' => Carbon::createFromTimestamp($file->getMTime())->diffInDays(now()),
                    ];
                }
            }
        }

        // Sort by modification time (newest first)
        usort($backups, function($a, $b) {
            return $b['modified'] <=> $a['modified'];
        });

        return $backups;
    }

    private function getBackupStats()
    {
        $backups = $this->getBackups();
        $totalSize = array_sum(array_column($backups, 'size_bytes'));

        return [
            'total_backups' => count($backups),
            'total_size' => $this->formatBytes($totalSize),
            'total_size_bytes' => $totalSize,
            'oldest_backup' => count($backups) > 0 ? min(array_column($backups, 'age_days')) : 0,
            'newest_backup' => count($backups) > 0 ? max(array_column($backups, 'age_days')) : 0,
            'average_size' => count($backups) > 0 ? $this->formatBytes($totalSize / count($backups)) : '0 B',
        ];
    }

    private function getStorageInfo()
    {
        $backupPath = storage_path('backups');

        // Check if backup directory exists, if not create it
        if (!File::exists($backupPath)) {
            try {
                File::makeDirectory($backupPath, 0755, true);
            } catch (\Exception $e) {
                // If we can't create the directory, return fallback values
                return [
                    'total_space' => '0 B',
                    'free_space' => '0 B',
                    'used_space' => '0 B',
                    'usage_percentage' => 0,
                    'backup_path' => $backupPath,
                ];
            }
        }

        // Get disk space information from the parent directory (storage) if backup directory doesn't have space info
        $parentPath = dirname($backupPath); // This will be the storage directory

        try {
            $totalSpace = disk_total_space($parentPath);
            $freeSpace = disk_free_space($parentPath);
            $usedSpace = $totalSpace - $freeSpace;

            return [
                'total_space' => $this->formatBytes($totalSpace),
                'free_space' => $this->formatBytes($freeSpace),
                'used_space' => $this->formatBytes($usedSpace),
                'usage_percentage' => round(($usedSpace / $totalSpace) * 100, 2),
                'backup_path' => $backupPath,
            ];
        } catch (\Exception $e) {
            // Fallback if disk space functions fail
            return [
                'total_space' => 'Unknown',
                'free_space' => 'Unknown',
                'used_space' => 'Unknown',
                'usage_percentage' => 0,
                'backup_path' => $backupPath,
            ];
        }
    }

    public function create(Request $request)
    {
        try {
            $request->validate([
                'backup_type' => 'required|in:full,database,config',
                'compression' => 'required|in:none,gzip,zip',
                'description' => 'nullable|string|max:255',
            ]);

            $backupType = $request->backup_type;
            $compression = $request->compression;
            $description = $request->description;

            $timestamp = now()->format('Y-m-d_H-i-s');
            $backupName = "backup_{$backupType}_{$timestamp}";

            if ($description) {
                $backupName .= "_" . str_replace([' ', '/', '\\'], '_', $description);
            }

            $backupPath = storage_path('backups');
            if (!File::exists($backupPath)) {
                File::makeDirectory($backupPath, 0755, true);
            }

            $result = $this->performBackup($backupType, $backupName, $compression);

            if ($result['success']) {
                // Log the backup creation
                Log::info('Database backup created', [
                    'user_id' => auth()->id(),
                    'backup_type' => $backupType,
                    'backup_name' => $backupName,
                    'compression' => $compression,
                    'description' => $description,
                    'file_size' => $result['file_size'] ?? 'Unknown',
                    'timestamp' => now(),
                ]);

                // Return to the backup page with success message
                return redirect()->route('admin.backup.index')->with('success', 'Backup created successfully!');
            } else {
                // Return to the backup page with error message
                return redirect()->route('admin.backup.index')->with('error', 'Backup creation failed: ' . $result['error']);
            }
        } catch (\Exception $e) {
            Log::error('Backup creation failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);

            // Return to the backup page with error message
            return redirect()->route('admin.backup.index')->with('error', 'Backup creation failed: ' . $e->getMessage());
        }
    }

    private function performBackup($type, $name, $compression)
    {
        try {
            $backupPath = storage_path('backups');
            $tempFile = $backupPath . '/' . $name . '.sql';

            switch ($type) {
                case 'full':
                    $result = $this->createFullBackup($tempFile);
                    break;
                case 'database':
                    $result = $this->createDatabaseBackup($tempFile);
                    break;
                case 'config':
                    $result = $this->createConfigBackup($tempFile);
                    break;
                default:
                    throw new \Exception('Invalid backup type');
            }

            if (!$result['success']) {
                return $result;
            }

            // Apply compression if requested
            $finalFile = $tempFile;
            if ($compression !== 'none') {
                $finalFile = $this->compressFile($tempFile, $compression);
                if (File::exists($tempFile)) {
                    File::delete($tempFile);
                }
            }

            // Get file info
            $fileSize = File::exists($finalFile) ? File::size($finalFile) : 0;

            return [
                'success' => true,
                'backup' => [
                    'name' => basename($finalFile),
                    'size' => $this->formatBytes($fileSize),
                    'path' => $finalFile,
                    'type' => $type,
                    'compression' => $compression,
                    'created_at' => now()->toISOString(),
                ],
                'file_size' => $this->formatBytes($fileSize),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    private function createFullBackup($filePath)
    {
        try {
            // First try using mysqldump
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port');

            $command = "mysqldump --host={$host} --port={$port} --user={$username} --password={$password} --single-transaction --routines --triggers --events {$database} > {$filePath}";

            $result = Process::run($command);

            if ($result->successful()) {
                return ['success' => true];
            } else {
                // If mysqldump fails, try Laravel's database export as fallback
                Log::warning('mysqldump failed, trying Laravel fallback', [
                    'error' => $result->errorOutput(),
                    'command' => $command
                ]);

                return $this->createLaravelBackup($filePath, 'full');
            }
        } catch (\Exception $e) {
            // If any exception occurs, try Laravel's database export as fallback
            Log::warning('mysqldump exception, trying Laravel fallback', [
                'error' => $e->getMessage()
            ]);

            return $this->createLaravelBackup($filePath, 'full');
        }
    }

    private function createDatabaseBackup($filePath)
    {
        try {
            // First try using mysqldump
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port');

            $command = "mysqldump --host={$host} --port={$port} --user={$username} --password={$password} --single-transaction --no-create-db {$database} > {$filePath}";

            $result = Process::run($command);

            if ($result->successful()) {
                return ['success' => true];
            } else {
                // If mysqldump fails, try Laravel's database export as fallback
                Log::warning('mysqldump failed, trying Laravel fallback', [
                    'error' => $result->errorOutput(),
                    'command' => $command
                ]);

                return $this->createLaravelBackup($filePath, 'database');
            }
        } catch (\Exception $e) {
            // If any exception occurs, try Laravel's database export as fallback
            Log::warning('mysqldump exception, trying Laravel fallback', [
                'error' => $e->getMessage()
            ]);

            return $this->createLaravelBackup($filePath, 'database');
        }
    }

    /**
     * Fallback backup method using Laravel's database export
     */
    private function createLaravelBackup($filePath, $type)
    {
        try {
            $content = '';

            if ($type === 'full' || $type === 'database') {
                // Get all tables
                $tables = DB::select('SHOW TABLES');
                $tableNames = array_map(function($table) {
                    return array_values((array) $table)[0];
                }, $tables);

                foreach ($tableNames as $tableName) {
                    // Get table structure
                    $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`")[0];
                    $createTableSql = array_values((array) $createTable)[1];

                    $content .= "-- Table structure for table `{$tableName}`\n";
                    $content .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
                    $content .= $createTableSql . ";\n\n";

                    // Get table data
                    $rows = DB::table($tableName)->get();
                    if ($rows->count() > 0) {
                        $content .= "-- Data for table `{$tableName}`\n";
                        $content .= "INSERT INTO `{$tableName}` VALUES\n";

                        $insertValues = [];
                        foreach ($rows as $row) {
                            $values = array_map(function($value) {
                                if ($value === null) return 'NULL';
                                if (is_string($value)) return "'" . addslashes($value) . "'";
                                return $value;
                            }, (array) $row);

                            $insertValues[] = "(" . implode(', ', $values) . ")";
                        }

                        $content .= implode(",\n", $insertValues) . ";\n\n";
                    }
                }
            }

            // Write to file
            if (File::put($filePath, $content)) {
                return ['success' => true];
            } else {
                return [
                    'success' => false,
                    'error' => 'Failed to write backup file',
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Laravel backup failed: ' . $e->getMessage(),
            ];
        }
    }

    private function createConfigBackup($filePath)
    {
        try {
            $configData = [
                'app' => config('app'),
                'database' => config('database'),
                'mail' => config('mail'),
                'cache' => config('cache'),
                'session' => config('session'),
                'auth' => config('auth'),
            ];

            // Remove sensitive information
            unset($configData['database']['connections']['mysql']['password']);
            unset($configData['mail']['mailers']['smtp']['password']);

            $content = "<?php\n\nreturn " . var_export($configData, true) . ";\n";
            File::put($filePath, $content);

            return ['success' => true];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Config backup error: ' . $e->getMessage(),
            ];
        }
    }

    private function compressFile($filePath, $compression)
    {
        $compressedPath = $filePath;

        switch ($compression) {
            case 'gzip':
                $compressedPath = $filePath . '.gz';
                $gz = gzopen($compressedPath, 'w9');
                gzwrite($gz, file_get_contents($filePath));
                gzclose($gz);
                break;

            case 'zip':
                $compressedPath = $filePath . '.zip';
                $zip = new \ZipArchive();
                if ($zip->open($compressedPath, \ZipArchive::CREATE) === TRUE) {
                    $zip->addFile($filePath, basename($filePath));
                    $zip->close();
                }
                break;
        }

        return $compressedPath;
    }

    public function restore(Request $request)
    {
        try {
            $request->validate([
                'backup_file' => 'required|file|mimes:sql,gz,zip',
            ]);

            $backupFile = $request->file('backup_file');
            $backupPath = storage_path('backups/' . $backupFile->getClientOriginalName());

            // Move the uploaded file to the backups directory
            $backupFile->move(storage_path('backups'), $backupFile->getClientOriginalName());

            if (!File::exists($backupPath)) {
                return redirect()->route('admin.backup.index')->with('error', 'Backup file not found');
            }

            $result = $this->performRestore($backupPath);

            if ($result['success']) {
                // Log the restore operation
                Log::info('Database restore performed', [
                    'user_id' => auth()->id(),
                    'backup_file' => $backupFile->getClientOriginalName(),
                    'timestamp' => now(),
                ]);

                return redirect()->route('admin.backup.index')->with('success', 'Database restored successfully');
            } else {
                return redirect()->route('admin.backup.index')->with('error', 'Restore failed: ' . $result['error']);
            }
        } catch (\Exception $e) {
            Log::error('Database restore failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);

            return redirect()->route('admin.backup.index')->with('error', 'Restore failed: ' . $e->getMessage());
        }
    }

    private function performRestore($backupPath)
    {
        try {
            $extension = pathinfo($backupPath, PATHINFO_EXTENSION);
            $tempFile = $backupPath;

            // Decompress if necessary
            if ($extension === 'gz') {
                $tempFile = $this->decompressGzip($backupPath);
            } elseif ($extension === 'zip') {
                $tempFile = $this->decompressZip($backupPath);
            }

            if (!$tempFile) {
                return [
                    'success' => false,
                    'error' => 'Failed to decompress backup file',
                ];
            }

            // Perform the restore
            $result = $this->executeRestore($tempFile);

            // Clean up temp file if it was created
            if ($tempFile !== $backupPath && File::exists($tempFile)) {
                File::delete($tempFile);
            }

            return $result;
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Restore error: ' . $e->getMessage(),
            ];
        }
    }

    private function decompressGzip($filePath)
    {
        try {
            $tempPath = $filePath . '.tmp';
            $gz = gzopen($filePath, 'r');
            $temp = fopen($tempPath, 'w');

            while (!gzeof($gz)) {
                fwrite($temp, gzread($gz, 4096));
            }

            gzclose($gz);
            fclose($temp);

            return $tempPath;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function decompressZip($filePath)
    {
        try {
            $tempPath = storage_path('backups/temp_restore_' . uniqid() . '.sql');
            $zip = new \ZipArchive();

            if ($zip->open($filePath) === TRUE) {
                $zip->extractTo(dirname($tempPath), basename($tempPath));
                $zip->close();
                return $tempPath;
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function executeRestore($filePath)
    {
        try {
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port');

            $command = "mysql --host={$host} --port={$port} --user={$username} --password={$password} {$database} < {$filePath}";

            $result = Process::run($command);

            if ($result->successful()) {
                return ['success' => true];
            } else {
                return [
                    'success' => false,
                    'error' => 'mysql restore failed: ' . $result->errorOutput(),
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'mysql restore error: ' . $e->getMessage(),
            ];
        }
    }

    public function destroy(Request $request, $backup)
    {
        try {
            $backupPath = storage_path('backups/' . $backup);

            if (!File::exists($backupPath)) {
                return redirect()->route('admin.backup.index')->with('error', 'Backup file not found');
            }

            $fileSize = File::size($backupPath);
            File::delete($backupPath);

            // Log the deletion
            Log::info('Backup file deleted', [
                'user_id' => auth()->id(),
                'backup_file' => $backup,
                'file_size' => $this->formatBytes($fileSize),
                'timestamp' => now(),
            ]);

            return redirect()->route('admin.backup.index')->with('success', 'Backup file deleted successfully');
        } catch (\Exception $e) {
            Log::error('Backup deletion failed', [
                'user_id' => auth()->id(),
                'backup_file' => $backup,
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);

            return redirect()->route('admin.backup.index')->with('error', 'Backup deletion failed: ' . $e->getMessage());
        }
    }

    public function download($backup)
    {
        try {
            $backupPath = storage_path('backups/' . $backup);

            if (!File::exists($backupPath)) {
                abort(404, 'Backup file not found');
            }

            // Log the download
            Log::info('Backup file downloaded', [
                'user_id' => auth()->id(),
                'backup_file' => $backup,
                'timestamp' => now(),
            ]);

            return response()->download($backupPath);
        } catch (\Exception $e) {
            Log::error('Backup download failed', [
                'user_id' => auth()->id(),
                'backup_file' => $backup,
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);

            abort(500, 'Download failed: ' . $e->getMessage());
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

    private function formatTimeAgo($days)
    {
        if ($days <= 0) return 'Just now';

        if ($days < 1) {
            $hours = round($days * 24);
            if ($hours < 1) {
                $minutes = round($days * 24 * 60);
                return $minutes . ' minute' . ($minutes !== 1 ? 's' : '') . ' ago';
            }
            return $hours . ' hour' . ($hours !== 1 ? 's' : '') . ' ago';
        }

        if ($days < 7) {
            $daysRounded = round($days);
            return $daysRounded . ' day' . ($daysRounded !== 1 ? 's' : '') . ' ago';
        }

        if ($days < 30) {
            $weeks = round($days / 7);
            return $weeks . ' week' . ($weeks !== 1 ? 's' : '') . ' ago';
        }

        if ($days < 365) {
            $months = round($days / 30);
            return $months . ' month' . ($months !== 1 ? 's' : '') . ' ago';
        }

        $years = round($days / 365);
        return $years . ' year' . ($years !== 1 ? 's' : '') . ' ago';
    }
}
