<?php

namespace App\Providers;

use App\Services\EnvironmentDetectionService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Artisan;

class DynamicEnvironmentServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register the environment detection service
        $this->app->singleton(EnvironmentDetectionService::class, function ($app) {
            return new EnvironmentDetectionService();
        });

        // Create alias for easier access
        $this->app->alias(EnvironmentDetectionService::class, 'environment.detector');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Only apply dynamic configuration if not in console (to avoid issues with migrations, etc.)
        if (!$this->app->runningInConsole() || $this->shouldApplyInConsole()) {
            $this->applyDynamicConfiguration();
        }

        // Register artisan commands
        if ($this->app->runningInConsole()) {
            $this->registerCommands();
        }
    }

    /**
     * Apply dynamic configuration based on detected environment
     */
    protected function applyDynamicConfiguration(): void
    {
        try {
            $detector = $this->app->make(EnvironmentDetectionService::class);
            $detector->applyDynamicConfiguration();
            
            // Log the detected environment for debugging
            if (config('app.debug')) {
                $environmentType = $detector->getEnvironmentType();
                $details = $detector->getDetectionDetails();
                
                logger()->info('Dynamic environment detected', [
                    'environment' => $environmentType,
                    'details' => $details
                ]);
            }
        } catch (\Exception $e) {
            // Fail silently in production, log in debug mode
            if (config('app.debug')) {
                logger()->error('Failed to apply dynamic configuration', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }
    }

    /**
     * Check if we should apply dynamic configuration in console
     */
    protected function shouldApplyInConsole(): bool
    {
        // Get the current command
        $command = $_SERVER['argv'][1] ?? '';
        
        // Apply for these commands
        $allowedCommands = [
            'serve',
            'queue:work',
            'queue:listen',
            'reverb:start',
            'schedule:run'
        ];

        return in_array($command, $allowedCommands);
    }

    /**
     * Register artisan commands
     */
    protected function registerCommands(): void
    {
        $this->commands([
            \App\Console\Commands\EnvironmentDetectCommand::class,
            \App\Console\Commands\EnvironmentConfigCommand::class,
        ]);
    }
}
