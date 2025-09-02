<?php

namespace App\Console\Commands;

use App\Services\EnvironmentDetectionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class EnvironmentConfigCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'env:config 
                           {--generate : Generate .env file based on detected environment}
                           {--show : Show current configuration}
                           {--export : Export configuration to file}
                           {--force : Force overwrite existing .env file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage environment configuration based on detected hosting environment';

    /**
     * Execute the console command.
     */
    public function handle(EnvironmentDetectionService $detector): int
    {
        if ($this->option('show')) {
            return $this->showCurrentConfiguration($detector);
        }

        if ($this->option('export')) {
            return $this->exportConfiguration($detector);
        }

        if ($this->option('generate')) {
            return $this->generateEnvironmentFile($detector);
        }

        // Default: show help
        $this->info('Environment Configuration Manager');
        $this->line('Use --generate to create .env file');
        $this->line('Use --show to display current config');
        $this->line('Use --export to export config to file');

        return 0;
    }

    /**
     * Show current configuration
     */
    protected function showCurrentConfiguration(EnvironmentDetectionService $detector): int
    {
        $environmentType = $detector->getEnvironmentType();
        $recommendations = $detector->getConfigurationRecommendations();

        $this->info("Current Environment Configuration");
        $this->line("===============================");
        
        $this->newLine();
        $this->line("<fg=green>Environment:</> {$environmentType}");
        
        $this->newLine();
        $this->info("Current .env values:");
        
        $envVars = [
            'APP_ENV' => env('APP_ENV'),
            'APP_DEBUG' => env('APP_DEBUG') ? 'true' : 'false',
            'DB_CONNECTION' => env('DB_CONNECTION'),
            'BROADCAST_CONNECTION' => env('BROADCAST_CONNECTION'),
            'CACHE_STORE' => env('CACHE_STORE'),
            'SESSION_DRIVER' => env('SESSION_DRIVER'),
            'QUEUE_CONNECTION' => env('QUEUE_CONNECTION'),
        ];

        foreach ($envVars as $key => $value) {
            $this->line("  {$key}={$value}");
        }

        return 0;
    }

    /**
     * Export configuration to file
     */
    protected function exportConfiguration(EnvironmentDetectionService $detector): int
    {
        $environmentType = $detector->getEnvironmentType();
        $recommendations = $detector->getConfigurationRecommendations();
        
        $filename = "env-config-{$environmentType}-" . date('Y-m-d-H-i-s') . '.json';
        
        $exportData = [
            'generated_at' => now()->toISOString(),
            'environment_type' => $environmentType,
            'detection_details' => $detector->getDetectionDetails(),
            'recommendations' => $recommendations,
            'current_env_values' => $this->getCurrentEnvValues()
        ];

        File::put($filename, json_encode($exportData, JSON_PRETTY_PRINT));
        
        $this->info("Configuration exported to: {$filename}");
        
        return 0;
    }

    /**
     * Generate .env file based on detected environment
     */
    protected function generateEnvironmentFile(EnvironmentDetectionService $detector): int
    {
        $envPath = base_path('.env');
        
        if (File::exists($envPath) && !$this->option('force')) {
            if (!$this->confirm('.env file already exists. Do you want to overwrite it?')) {
                $this->info('Operation cancelled.');
                return 1;
            }
        }

        $environmentType = $detector->getEnvironmentType();
        $recommendations = $detector->getConfigurationRecommendations();
        
        $this->info("Generating .env file for environment: {$environmentType}");
        
        $envContent = $this->buildEnvironmentFileContent($environmentType, $recommendations);
        
        File::put($envPath, $envContent);
        
        $this->info("✅ .env file generated successfully!");
        $this->newLine();
        
        $this->warn("⚠️  Important: Please review and update the following values:");
        $this->line("  • Database credentials (DB_*)");
        $this->line("  • Application URL (APP_URL)");
        $this->line("  • Mail configuration (MAIL_*)");
        
        if ($environmentType !== 'local') {
    
            $this->line("  • API keys and secrets");
        }

        $this->newLine();
        $this->info("Run 'php artisan key:generate' if APP_KEY is not set");
        
        return 0;
    }

    /**
     * Build .env file content based on environment
     */
    protected function buildEnvironmentFileContent(string $environmentType, array $recommendations): string
    {
        $config = $recommendations['recommended_config'] ?? [];
        
        $content = [];
        
        // App configuration
        $content[] = "# Application Configuration";
        $content[] = "APP_NAME=\"Cash Management\"";
        $content[] = "APP_ENV=" . ($environmentType === 'local' ? 'local' : 'production');
        $content[] = "APP_KEY=" . (env('APP_KEY') ?: 'base64:' . base64_encode(random_bytes(32)));
        $content[] = "APP_DEBUG=" . (($config['app']['debug'] ?? false) ? 'true' : 'false');
        $content[] = "APP_TIMEZONE=UTC";
        $content[] = "APP_URL=" . ($environmentType === 'local' ? 'http://localhost:8000' : 'https://yourdomain.com');
        $content[] = "";

        // Logging
        $content[] = "# Logging";
        $content[] = "LOG_CHANNEL=stack";
        $content[] = "LOG_STACK=single";
        $content[] = "LOG_LEVEL=" . ($config['app']['log_level'] ?? 'error');
        $content[] = "";

        // Database
        $content[] = "# Database Configuration";
        $dbDefault = $config['database']['default'] ?? 'mysql';
        $content[] = "DB_CONNECTION={$dbDefault}";
        
        if ($environmentType === 'local') {
            $content[] = "DB_HOST=127.0.0.1";
            $content[] = "DB_PORT=3306";
            $content[] = "DB_DATABASE=cashmanagement_local";
            $content[] = "DB_USERNAME=root";
            $content[] = "DB_PASSWORD=";
        } else {
            $content[] = "DB_HOST=127.0.0.1";
            $content[] = "DB_PORT=3306";
            $content[] = "DB_DATABASE=cashmanagement_db";
            $content[] = "DB_USERNAME=your_username";
            $content[] = "DB_PASSWORD=your_password";
        }
        $content[] = "";

        // Broadcasting
        $content[] = "# Broadcasting Configuration";
        $broadcastDefault = $config['broadcasting']['default'] ?? 'null';
        $content[] = "BROADCAST_CONNECTION={$broadcastDefault}";
        $content[] = "";

        // Cache and Session
        $content[] = "# Cache and Session";
        $cacheDefault = $config['cache']['default'] ?? 'file';
        $sessionDefault = $config['session']['driver'] ?? 'file';
        $content[] = "CACHE_STORE={$cacheDefault}";
        $content[] = "SESSION_DRIVER={$sessionDefault}";
        $content[] = "SESSION_LIFETIME=120";
        $content[] = "";

        // Queue
        $content[] = "# Queue Configuration";
        $queueDefault = $config['queue']['default'] ?? 'sync';
        $content[] = "QUEUE_CONNECTION={$queueDefault}";
        $content[] = "";

        // Redis (if needed)
        if (in_array($cacheDefault, ['redis']) || in_array($sessionDefault, ['redis']) || in_array($queueDefault, ['redis'])) {
            $content[] = "# Redis Configuration";
            $content[] = "REDIS_CLIENT=phpredis";
            $content[] = "REDIS_HOST=127.0.0.1";
            $content[] = "REDIS_PASSWORD=null";
            $content[] = "REDIS_PORT=6379";
            $content[] = "";
        }

        // Mail Configuration
        $content[] = "# Mail Configuration";
        if ($environmentType === 'local') {
            $content[] = "MAIL_MAILER=log  # Use 'smtp' for production";
            $content[] = "MAIL_HOST=smtp.gmail.com";
            $content[] = "MAIL_PORT=587";
            $content[] = "MAIL_USERNAME=your-email@gmail.com";
            $content[] = "MAIL_PASSWORD=your-app-password";
            $content[] = "MAIL_ENCRYPTION=tls";
        } else {
            $content[] = "MAIL_MAILER=smtp";
            $content[] = "MAIL_HOST=smtp.gmail.com";
            $content[] = "MAIL_PORT=587";
            $content[] = "MAIL_USERNAME=your-email@gmail.com";
            $content[] = "MAIL_PASSWORD=your-app-password";
            $content[] = "MAIL_ENCRYPTION=tls";
        }
        
        $content[] = "MAIL_FROM_ADDRESS=\"noreply@cashmanagement.com\"";
        $content[] = "MAIL_FROM_NAME=\"Cash Management System\"";
        $content[] = "";

        // WebSocket Configuration - Always configure Reverb as primary
        $content[] = "# Laravel Reverb Configuration (Primary WebSocket Driver)";
        $content[] = "REVERB_APP_ID=" . random_int(100000, 999999);
        $content[] = "REVERB_APP_KEY=" . bin2hex(random_bytes(16));
        $content[] = "REVERB_APP_SECRET=" . bin2hex(random_bytes(32));
        
        if ($environmentType === 'local') {
            $content[] = "REVERB_HOST=\"localhost\"";
            $content[] = "REVERB_PORT=8080";
            $content[] = "REVERB_SCHEME=http";
        } else {
            $content[] = "REVERB_HOST=\"yourdomain.com\"";
            $content[] = "REVERB_PORT=443";
            $content[] = "REVERB_SCHEME=https";
        }
        
        $content[] = "REVERB_SERVER_HOST=0.0.0.0";
        $content[] = "REVERB_SERVER_PORT=" . ($environmentType === 'local' ? '8080' : '8080');
        $content[] = "";
        
        // Add Pusher as fallback option (commented out)
        $content[] = "# Pusher Configuration (Fallback Option - Uncomment if needed)";
        $content[] = "# PUSHER_APP_ID=your_pusher_app_id";
        $content[] = "# PUSHER_APP_KEY=your_pusher_key";
        $content[] = "# PUSHER_APP_SECRET=your_pusher_secret";
        $content[] = "# PUSHER_HOST=";
        $content[] = "# PUSHER_PORT=443";
        $content[] = "# PUSHER_SCHEME=https";
        $content[] = "# PUSHER_APP_CLUSTER=mt1";
        $content[] = "";



        // API Keys
        $content[] = "# External APIs";
        $content[] = "EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key";
        $content[] = "";

        // Frontend Configuration - Always configure for Reverb
        $content[] = "# Frontend Configuration";
        $content[] = "VITE_APP_NAME=\"\${APP_NAME}\"";
        $content[] = "VITE_REVERB_APP_KEY=\"\${REVERB_APP_KEY}\"";
        $content[] = "VITE_REVERB_HOST=\"\${REVERB_HOST}\"";
        $content[] = "VITE_REVERB_PORT=\"\${REVERB_PORT}\"";
        $content[] = "VITE_REVERB_SCHEME=\"\${REVERB_SCHEME}\"";
        $content[] = "";
        $content[] = "# Pusher Frontend Config (Fallback - Uncomment if using Pusher)";
        $content[] = "# VITE_PUSHER_APP_KEY=\"\${PUSHER_APP_KEY}\"";
        $content[] = "# VITE_PUSHER_HOST=\"\${PUSHER_HOST}\"";
        $content[] = "# VITE_PUSHER_PORT=\"\${PUSHER_PORT}\"";
        $content[] = "# VITE_PUSHER_SCHEME=\"\${PUSHER_SCHEME}\"";
        $content[] = "# VITE_PUSHER_APP_CLUSTER=\"\${PUSHER_APP_CLUSTER}\"";

        return implode("\n", $content);
    }

    /**
     * Get current environment values
     */
    protected function getCurrentEnvValues(): array
    {
        return [
            'APP_NAME' => env('APP_NAME'),
            'APP_ENV' => env('APP_ENV'),
            'APP_DEBUG' => env('APP_DEBUG'),
            'APP_URL' => env('APP_URL'),
            'DB_CONNECTION' => env('DB_CONNECTION'),
            'BROADCAST_CONNECTION' => env('BROADCAST_CONNECTION'),
            'CACHE_STORE' => env('CACHE_STORE'),
            'SESSION_DRIVER' => env('SESSION_DRIVER'),
            'QUEUE_CONNECTION' => env('QUEUE_CONNECTION'),
            'MAIL_MAILER' => env('MAIL_MAILER'),
        ];
    }
}
