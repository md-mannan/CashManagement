<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class InstallationService
{
    public function isInstalled(): bool
    {
        try {
            if (!$this->hasDatabaseConnection()) {
                return false;
            }
            if (!$this->hasMigrationsRun()) {
                return false;
            }
            if (!$this->hasAdminUser()) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function hasDatabaseConnection(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function hasMigrationsRun(): bool
    {
        try {
            return Schema::hasTable('migrations') && DB::table('migrations')->count() > 0;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function hasAdminUser(): bool
    {
        try {
            return User::where('role', 'super_admin')->exists();
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getInstallationStatus(): array
    {
        return [
            'is_installed' => $this->isInstalled(),
            'database_connected' => $this->hasDatabaseConnection(),
            'migrations_run' => $this->hasMigrationsRun(),
            'admin_user_exists' => $this->hasAdminUser(),
            'can_proceed' => $this->canProceedWithInstallation(),
        ];
    }

    public function canProceedWithInstallation(): bool
    {
        return $this->hasDatabaseConnection();
    }

    public function getDefaultConfig(): array
    {
        $config = config('installer.defaults');
        $config['app']['url'] = request()->getSchemeAndHttpHost();
        return $config;
    }

    public function getInstallerConfig(): array
    {
        return config('installer');
    }
}
