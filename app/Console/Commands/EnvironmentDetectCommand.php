<?php

namespace App\Console\Commands;

use App\Services\EnvironmentDetectionService;
use Illuminate\Console\Command;

class EnvironmentDetectCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'env:detect {--json : Output as JSON}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Detect and display the current hosting environment';

    /**
     * Execute the console command.
     */
    public function handle(EnvironmentDetectionService $detector): int
    {
        $environmentType = $detector->getEnvironmentType();
        $details = $detector->getDetectionDetails();
        $recommendations = $detector->getConfigurationRecommendations();

        if ($this->option('json')) {
            $this->line(json_encode([
                'environment' => $environmentType,
                'details' => $details,
                'recommendations' => $recommendations
            ], JSON_PRETTY_PRINT));
            return 0;
        }

        $this->info("🔍 Environment Detection Results");
        $this->line("================================");
        
        $this->newLine();
        $this->line("<fg=green>Detected Environment:</> <fg=yellow>{$environmentType}</>");
        $this->line("<fg=green>Description:</> {$recommendations['description']}");
        
        $this->newLine();
        $this->info("📋 Detection Details:");
        
        if (isset($details[$environmentType]) && !empty($details[$environmentType])) {
            foreach ($details[$environmentType] as $key => $value) {
                $displayKey = str_replace('_', ' ', ucfirst($key));
                $displayValue = is_bool($value) ? ($value ? 'Yes' : 'No') : $value;
                $this->line("  • <fg=cyan>{$displayKey}:</> {$displayValue}");
            }
        } else {
            $this->line("  <fg=yellow>No specific detection details available</>");
        }

        $this->newLine();
        $this->info("⚙️  Recommended Configuration:");
        
        $config = $recommendations['recommended_config'] ?? [];
        if (!empty($config)) {
            foreach ($config as $service => $settings) {
                $this->line("  <fg=magenta>{$service}:</>");
                if (is_array($settings)) {
                    foreach ($settings as $key => $value) {
                        if (is_array($value)) {
                            $this->line("    • {$key}: " . json_encode($value));
                        } else {
                            $displayValue = is_bool($value) ? ($value ? 'true' : 'false') : $value;
                            $this->line("    • {$key}: {$displayValue}");
                        }
                    }
                } else {
                    $displayValue = is_bool($settings) ? ($settings ? 'true' : 'false') : $settings;
                    $this->line("    {$displayValue}");
                }
            }
        } else {
            $this->line("  <fg=yellow>Using default configuration</>");
        }

        $this->newLine();
        $this->info("💡 Tips:");
        $this->displayEnvironmentTips($environmentType);

        return 0;
    }

    /**
     * Display environment-specific tips
     */
    protected function displayEnvironmentTips(string $environmentType): void
    {
        $tips = [
            'local' => [
                'Use `php artisan serve` for development server',
                'MySQL database is configured for local development',
                'Create database: CREATE DATABASE cashmanagement_local;',
                'Reverb WebSockets are enabled for real-time features',
                'Debug mode is enabled - don\'t use in production!'
            ],
            'shared_hosting' => [
                'Reverb WebSockets are configured and optimized for shared hosting',
                'Database sessions are more reliable than file sessions',
                'Database cache is optimized for shared hosting environment',
                'Background processes may be limited - use database queue',
                'Reverb settings are tuned for stability on shared hosting'
            ],
            'vps' => [
                'You can run Reverb server for WebSockets',
                'Redis is recommended for caching and sessions',
                'Set up supervisor for queue workers',
                'Consider using Redis for queue management'
            ],
            'cloud' => [
                'Use managed services (SQS, SES, Redis) when available',
                'Reverb WebSockets with cloud-optimized configuration',
                'Configure auto-scaling for queue workers',
                'Use cloud storage for file uploads'
            ]
        ];

        $environmentTips = $tips[$environmentType] ?? [
            'Review your hosting capabilities',
            'Test all features before going live',
            'Monitor application performance',
            'Set up proper logging and monitoring'
        ];

        foreach ($environmentTips as $tip) {
            $this->line("  • {$tip}");
        }
    }
}
