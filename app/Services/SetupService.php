<?php

namespace App\Services;

use App\Models\SetupStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use PDO;
use Throwable;

class SetupService
{
    public function isCompleted(): bool
    {
        try {
            if (!Schema::hasTable('setup_statuses')) {
                return false;
            }
            return (bool) SetupStatus::query()->value('is_completed');
        } catch (Throwable) {
            return false;
        }
    }

    public function markCompleted(int $userId): void
    {
        SetupStatus::query()->updateOrCreate(
            ['id' => 1],
            ['is_completed' => true, 'completed_at' => now(), 'completed_by_user_id' => $userId]
        );
    }

    public function validateDbConnection(array $db): array
    {
        $host = $db['host'] ?? '127.0.0.1';
        $port = $db['port'] ?? '3306';
        $database = $db['database'] ?? '';
        $username = $db['username'] ?? '';
        $password = $db['password'] ?? '';

        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$database}";
            new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 3,
            ]);
            return ['ok' => true];
        } catch (Throwable $e) {
            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Update/insert keys into the .env file.
     * Note: This is best-effort; caller should clear config cache after changing.
     */
    public function writeEnv(array $kv): void
    {
        $envPath = base_path('.env');
        if (!File::exists($envPath)) {
            throw new \RuntimeException('.env file not found.');
        }

        $contents = File::get($envPath);
        foreach ($kv as $key => $value) {
            $lineValue = $this->formatEnvValue($value);
            if (preg_match("/^{$key}=.*$/m", $contents)) {
                $contents = preg_replace("/^{$key}=.*$/m", "{$key}={$lineValue}", $contents);
            } else {
                $contents .= (str_ends_with($contents, "\n") ? '' : "\n") . "{$key}={$lineValue}\n";
            }
        }

        File::put($envPath, $contents);
    }

    private function formatEnvValue(mixed $value): string
    {
        if ($value === null) {
            return '';
        }
        $v = (string) $value;
        // Quote if contains spaces or special chars
        if (preg_match('/\s|#|=|"/', $v)) {
            $v = str_replace('"', '\"', $v);
            return '"'.$v.'"';
        }
        return $v;
    }
}

