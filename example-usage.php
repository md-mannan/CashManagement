<?php

/*
 * Dynamic Environment Configuration - Usage Examples
 * 
 * This file demonstrates how to use the dynamic environment system
 * in your Cash Management application.
 */

// Example 1: Basic Environment Detection
use App\Facades\EnvironmentDetector;

// Get the detected environment type
$environment = EnvironmentDetector::getEnvironmentType();
echo "Detected environment: {$environment}\n";

// Get detailed detection information
$details = EnvironmentDetector::getDetectionDetails();
print_r($details);

// Example 2: Environment-Specific Logic
switch ($environment) {
    case 'local':
        // Development-specific code
        echo "Running in local development mode\n";
        break;
        
    case 'shared_hosting':
        // Shared hosting optimizations
        echo "Optimized for shared hosting\n";
        break;
        
    case 'vps':
        // VPS-specific features
        echo "Full server control available\n";
        break;
        
    case 'cloud':
        // Cloud platform features
        echo "Cloud platform detected\n";
        break;
}

// Example 3: Configuration Recommendations
$recommendations = EnvironmentDetector::getConfigurationRecommendations();
echo "Recommended database: " . $recommendations['recommended_config']['database']['default'] ?? 'default';
echo "Recommended broadcasting: " . $recommendations['recommended_config']['broadcasting']['default'] ?? 'null';

// Example 4: Service-Specific Logic
if ($environment === 'shared_hosting') {
    // Use Pusher instead of Reverb for shared hosting
    config(['broadcasting.default' => 'pusher']);
    echo "Switched to Pusher for WebSockets\n";
} elseif ($environment === 'vps') {
    // Use Reverb for VPS with full control
    config(['broadcasting.default' => 'reverb']);
    echo "Using Reverb WebSocket server\n";
}

// Example 5: Dynamic Cache Configuration
if ($environment === 'vps' || $environment === 'cloud') {
    // Use Redis for better performance
    config(['cache.default' => 'redis']);
    echo "Using Redis for caching\n";
} else {
    // Use database cache for compatibility
    config(['cache.default' => 'database']);
    echo "Using database for caching\n";
}

// Example 6: Queue Configuration
$queueConfig = match ($environment) {
    'local' => 'sync',
    'shared_hosting' => 'database',
    'vps' => 'redis',
    'cloud' => 'sqs',
    default => 'database'
};

config(['queue.default' => $queueConfig]);
echo "Queue driver set to: {$queueConfig}\n";

// Example 7: Security Settings
if ($environment !== 'local') {
    // Force HTTPS in production environments
    config(['app.force_https' => true]);
    echo "HTTPS enforced for production\n";
}

// Example 8: Logging Configuration
$logLevel = match ($environment) {
    'local' => 'debug',
    'shared_hosting' => 'error',
    'vps' => 'info',
    'cloud' => 'warning',
    default => 'error'
};

config(['logging.channels.stack.level' => $logLevel]);
echo "Log level set to: {$logLevel}\n";

/*
 * Artisan Commands Examples:
 * 
 * # Detect current environment
 * php artisan env:detect
 * 
 * # Generate optimized .env file
 * php artisan env:config --generate
 * 
 * # Show current configuration
 * php artisan env:config --show
 * 
 * # Export configuration to file
 * php artisan env:config --export
 * 
 * # Generate with force overwrite
 * php artisan env:config --generate --force
 */

/*
 * Integration in Controllers:
 */
class ExampleController extends Controller
{
    public function index()
    {
        $environment = EnvironmentDetector::getEnvironmentType();
        
        return view('dashboard', [
            'environment' => $environment,
            'features' => $this->getAvailableFeatures($environment)
        ]);
    }
    
    private function getAvailableFeatures(string $environment): array
    {
        return match ($environment) {
            'local' => [
                'realtime_updates' => true,
                'file_uploads' => true,
                'background_jobs' => false,
                'email_sending' => false,
            ],
            'shared_hosting' => [
                'realtime_updates' => true, // via Pusher
                'file_uploads' => true,
                'background_jobs' => false,
                'email_sending' => true,
            ],
            'vps' => [
                'realtime_updates' => true, // via Reverb
                'file_uploads' => true,
                'background_jobs' => true,
                'email_sending' => true,
            ],
            'cloud' => [
                'realtime_updates' => true,
                'file_uploads' => true,
                'background_jobs' => true,
                'email_sending' => true,
            ],
            default => [
                'realtime_updates' => false,
                'file_uploads' => true,
                'background_jobs' => false,
                'email_sending' => true,
            ]
        };
    }
}

/*
 * Middleware Example:
 */
class EnvironmentAwareMiddleware
{
    public function handle($request, Closure $next)
    {
        $environment = EnvironmentDetector::getEnvironmentType();
        
        // Add environment info to view data
        view()->share('app_environment', $environment);
        
        // Environment-specific headers
        if ($environment !== 'local') {
            $response = $next($request);
            return $response->header('X-Environment', $environment);
        }
        
        return $next($request);
    }
}

echo "\nDynamic Environment Configuration System is ready!\n";
echo "Run 'php artisan env:detect' to see your environment details.\n";
