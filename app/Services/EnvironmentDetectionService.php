<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;

class EnvironmentDetectionService
{
    protected array $detectedEnvironment = [];
    protected string $environmentType = 'production';

    public function __construct()
    {
        $this->detectEnvironment();
    }

    /**
     * Detect the current hosting environment
     */
    public function detectEnvironment(): string
    {
        // Cache the detection result for performance
        $cacheKey = 'environment_detection';
        
        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            $this->environmentType = $cached['type'];
            $this->detectedEnvironment = $cached['details'];
            return $this->environmentType;
        }

        $environments = config('environment.environments', []);
        $detectionScore = [];

        foreach ($environments as $envType => $envConfig) {
            $score = $this->calculateEnvironmentScore($envType, $envConfig['indicators'] ?? []);
            $detectionScore[$envType] = $score;
        }

        // Get the environment with the highest score
        arsort($detectionScore);
        $this->environmentType = array_key_first($detectionScore);

        // Cache the result for 1 hour
        Cache::put($cacheKey, [
            'type' => $this->environmentType,
            'details' => $this->detectedEnvironment
        ], 3600);

        return $this->environmentType;
    }

    /**
     * Calculate score for environment detection
     */
    protected function calculateEnvironmentScore(string $envType, array $indicators): int
    {
        $score = 0;
        $details = [];

        // Check domain patterns
        if (isset($indicators['domain_patterns'])) {
            $currentDomain = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
            foreach ($indicators['domain_patterns'] as $pattern) {
                if (str_contains($currentDomain, $pattern)) {
                    $score += 10;
                    $details['domain_match'] = $pattern;
                    break;
                }
            }
        }

        // Check server names
        if (isset($indicators['server_names'])) {
            $serverName = $_SERVER['SERVER_NAME'] ?? '';
            if (in_array($serverName, $indicators['server_names'])) {
                $score += 8;
                $details['server_name_match'] = $serverName;
            }
        }

        // Check PHP SAPI
        if (isset($indicators['php_sapi'])) {
            $currentSapi = php_sapi_name();
            if (in_array($currentSapi, $indicators['php_sapi'])) {
                $score += 6;
                $details['sapi_match'] = $currentSapi;
            }
        }

        // Check for hosting control panels
        if (isset($indicators['hosting_patterns'])) {
            foreach ($indicators['hosting_patterns'] as $pattern) {
                if ($this->detectHostingControlPanel($pattern)) {
                    $score += 15;
                    $details['hosting_panel'] = $pattern;
                    break;
                }
            }
        }

        // Check for cloud providers
        if (isset($indicators['cloud_providers'])) {
            $cloudProvider = $this->detectCloudProvider();
            if ($cloudProvider && in_array($cloudProvider, $indicators['cloud_providers'])) {
                $score += 12;
                $details['cloud_provider'] = $cloudProvider;
            }
        }

        // Check resource limitations
        if (isset($indicators['limited_resources']) && $indicators['limited_resources']) {
            if ($this->hasLimitedResources()) {
                $score += 5;
                $details['limited_resources'] = true;
            }
        }

        // Check if can run background processes
        if (isset($indicators['can_run_processes'])) {
            if ($this->canRunBackgroundProcesses() === $indicators['can_run_processes']) {
                $score += 8;
                $details['can_run_processes'] = $indicators['can_run_processes'];
            }
        }

        // Check APP_ENV if specified
        if (isset($indicators['app_env'])) {
            if (env('APP_ENV') === $indicators['app_env']) {
                $score += 20; // High priority for explicit environment setting
                $details['explicit_env'] = $indicators['app_env'];
            }
        }

        $this->detectedEnvironment[$envType] = $details;

        return $score;
    }

    /**
     * Detect hosting control panel
     */
    protected function detectHostingControlPanel(string $panel): bool
    {
        $indicators = [
            'cpanel' => [
                '/usr/local/cpanel',
                '/var/cpanel',
                'cpanel' // in server signature
            ],
            'plesk' => [
                '/usr/local/psa',
                '/opt/psa',
                'plesk'
            ],
            'directadmin' => [
                '/usr/local/directadmin',
                'directadmin'
            ]
        ];

        if (!isset($indicators[$panel])) {
            return false;
        }

        foreach ($indicators[$panel] as $indicator) {
            if (str_starts_with($indicator, '/') && is_dir($indicator)) {
                return true;
            }
            
            if (isset($_SERVER['SERVER_SOFTWARE']) && 
                str_contains(strtolower($_SERVER['SERVER_SOFTWARE']), $indicator)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Detect cloud provider
     */
    protected function detectCloudProvider(): ?string
    {
        // Check environment variables
        $envVars = [
            'aws' => ['AWS_EXECUTION_ENV', 'AWS_LAMBDA_FUNCTION_NAME', 'AWS_REGION'],
            'gcp' => ['GOOGLE_CLOUD_PROJECT', 'GAE_APPLICATION', 'GCP_PROJECT'],
            'azure' => ['AZURE_CLIENT_ID', 'WEBSITE_SITE_NAME'],
            'digitalocean' => ['DO_SPACES_KEY', 'DIGITALOCEAN_ACCESS_TOKEN'],
            'linode' => ['LINODE_CLI_TOKEN']
        ];

        foreach ($envVars as $provider => $vars) {
            foreach ($vars as $var) {
                if (env($var)) {
                    return $provider;
                }
            }
        }

        // Check metadata endpoints (be careful with timeouts)
        $metadataChecks = [
            'aws' => 'http://169.254.169.254/latest/meta-data/',
            'gcp' => 'http://metadata.google.internal/computeMetadata/v1/',
            'azure' => 'http://169.254.169.254/metadata/instance'
        ];

        foreach ($metadataChecks as $provider => $url) {
            if ($this->checkMetadataEndpoint($url)) {
                return $provider;
            }
        }

        return null;
    }

    /**
     * Check if metadata endpoint is accessible
     */
    protected function checkMetadataEndpoint(string $url): bool
    {
        $context = stream_context_create([
            'http' => [
                'timeout' => 1, // Very short timeout
                'method' => 'GET'
            ]
        ]);

        $result = @file_get_contents($url, false, $context);
        return $result !== false;
    }

    /**
     * Check if environment has limited resources
     */
    protected function hasLimitedResources(): bool
    {
        // Check memory limit
        $memoryLimit = ini_get('memory_limit');
        if ($memoryLimit && $memoryLimit !== '-1') {
            $memoryBytes = $this->convertToBytes($memoryLimit);
            if ($memoryBytes < 256 * 1024 * 1024) { // Less than 256MB
                return true;
            }
        }

        // Check execution time limit
        $timeLimit = ini_get('max_execution_time');
        if ($timeLimit && $timeLimit < 60) { // Less than 60 seconds
            return true;
        }

        // Check if functions are disabled
        $disabledFunctions = ini_get('disable_functions');
        $criticalFunctions = ['exec', 'shell_exec', 'system', 'proc_open'];
        
        foreach ($criticalFunctions as $func) {
            if (str_contains($disabledFunctions, $func)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if can run background processes
     */
    protected function canRunBackgroundProcesses(): bool
    {
        // Check if critical functions are available
        $requiredFunctions = ['proc_open', 'exec'];
        foreach ($requiredFunctions as $func) {
            if (!function_exists($func)) {
                return false;
            }
        }

        // Check if we can actually execute a simple command
        try {
            $output = [];
            $returnCode = 0;
            exec('echo "test" 2>/dev/null', $output, $returnCode);
            return $returnCode === 0;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Convert memory limit string to bytes
     */
    protected function convertToBytes(string $value): int
    {
        $value = trim($value);
        $unit = strtolower(substr($value, -1));
        $number = (int) substr($value, 0, -1);

        switch ($unit) {
            case 'g':
                return $number * 1024 * 1024 * 1024;
            case 'm':
                return $number * 1024 * 1024;
            case 'k':
                return $number * 1024;
            default:
                return (int) $value;
        }
    }

    /**
     * Apply dynamic configuration based on detected environment
     */
    public function applyDynamicConfiguration(): void
    {
        if (!config('environment.auto_detect', true)) {
            return;
        }

        $environmentType = $this->detectEnvironment();
        $environments = config('environment.environments', []);
        
        if (!isset($environments[$environmentType])) {
            return;
        }

        $envConfig = $environments[$environmentType]['config'] ?? [];

        // Apply configurations dynamically
        foreach ($envConfig as $configKey => $configValue) {
            if (is_array($configValue)) {
                foreach ($configValue as $subKey => $subValue) {
                    Config::set("{$configKey}.{$subKey}", $subValue);
                }
            } else {
                Config::set($configKey, $configValue);
            }
        }

        // Apply service-specific configurations
        $this->applyServiceConfigurations($environmentType);
    }

    /**
     * Apply service-specific configurations
     */
    protected function applyServiceConfigurations(string $environmentType): void
    {
        $services = config('environment.services', []);

        // Configure Reverb/Broadcasting
        if (isset($services['reverb'])) {
            $this->configureReverbService($environmentType, $services['reverb']);
        }

        // Configure Security settings
        if (isset($services['security'])) {
            $this->configureSecuritySettings($environmentType, $services['security']);
        }
    }

    /**
     * Configure Reverb service based on environment
     */
    protected function configureReverbService(string $environmentType, array $reverbConfig): void
    {
        // Always try to use Reverb first, regardless of environment
        Config::set('broadcasting.default', 'reverb');

        // Auto-generate Reverb keys if needed
        if ($reverbConfig['auto_generate_keys'] ?? false) {
            if (!env('REVERB_APP_KEY')) {
                $this->generateReverbKeys();
            }
        }

        // Configure ports based on environment
        if ($environmentType === 'local') {
            Config::set('reverb.servers.reverb.port', $reverbConfig['development_port'] ?? 8080);
            Config::set('reverb.apps.apps.0.options.port', $reverbConfig['development_port'] ?? 8080);
            Config::set('reverb.apps.apps.0.options.scheme', 'http');
            Config::set('reverb.apps.apps.0.options.useTLS', false);
        } else {
            // Production environment configuration
            $port = $reverbConfig['production_port'] ?? 443;
            
            // For shared hosting, try to detect available ports
            if ($environmentType === 'shared_hosting' && ($reverbConfig['custom_port_detection'] ?? false)) {
                $port = $this->detectAvailablePort($environmentType);
            }
            
            Config::set('reverb.servers.reverb.port', $port);
            Config::set('reverb.apps.apps.0.options.port', $port);
            Config::set('reverb.apps.apps.0.options.scheme', 'https');
            Config::set('reverb.apps.apps.0.options.useTLS', true);
        }

        // Configure host based on environment
        $host = $this->getReverbHost($environmentType);
        if ($host) {
            Config::set('reverb.servers.reverb.hostname', $host);
            Config::set('reverb.apps.apps.0.options.host', $host);
        }

        // Shared hosting specific optimizations
        if ($environmentType === 'shared_hosting') {
            $this->configureReverbForSharedHosting();
        }
    }

    /**
     * Configure security settings
     */
    protected function configureSecuritySettings(string $environmentType, array $securityConfig): void
    {
        // Force HTTPS in production environments
        if ($securityConfig['force_https'] === null) {
            $forceHttps = !in_array($environmentType, ['local']);
            Config::set('app.force_https', $forceHttps);
        }
    }

    /**
     * Generate Reverb keys automatically
     */
    protected function generateReverbKeys(): void
    {
        if (!function_exists('random_bytes')) {
            return;
        }

        try {
            $appId = random_int(10000, 99999);
            $appKey = base64_encode(random_bytes(24));
            $appSecret = base64_encode(random_bytes(48));

            // Set in runtime config
            Config::set('reverb.apps.apps.0.app_id', $appId);
            Config::set('reverb.apps.apps.0.key', $appKey);
            Config::set('reverb.apps.apps.0.secret', $appSecret);

        } catch (\Exception $e) {
            // Fallback to simpler generation
            $appId = rand(10000, 99999);
            $appKey = md5(uniqid('reverb_key_', true));
            $appSecret = md5(uniqid('reverb_secret_', true));

            Config::set('reverb.apps.apps.0.app_id', $appId);
            Config::set('reverb.apps.apps.0.key', $appKey);
            Config::set('reverb.apps.apps.0.secret', $appSecret);
        }
    }

    /**
     * Get detected environment type
     */
    public function getEnvironmentType(): string
    {
        return $this->environmentType;
    }

    /**
     * Get detection details
     */
    public function getDetectionDetails(): array
    {
        return $this->detectedEnvironment;
    }

    /**
     * Get configuration recommendations
     */
    public function getConfigurationRecommendations(): array
    {
        $environmentType = $this->getEnvironmentType();
        $environments = config('environment.environments', []);
        
        if (!isset($environments[$environmentType])) {
            return [];
        }

        return [
            'environment' => $environmentType,
            'detected_features' => $this->detectedEnvironment[$environmentType] ?? [],
            'recommended_config' => $environments[$environmentType]['config'] ?? [],
            'description' => $this->getEnvironmentDescription($environmentType)
        ];
    }

    /**
     * Get environment description
     */
    protected function getEnvironmentDescription(string $environmentType): string
    {
        $descriptions = [
            'local' => 'Local development environment with MySQL database and full debugging capabilities',
            'shared_hosting' => 'Shared hosting with Reverb WebSocket support and database optimization',
            'vps' => 'Virtual Private Server with full Reverb control and background process support',
            'cloud' => 'Cloud hosting platform with Reverb WebSockets and managed services'
        ];

        return $descriptions[$environmentType] ?? 'Production environment with Reverb WebSocket configuration';
    }

    /**
     * Detect available port for Reverb in shared hosting
     */
    protected function detectAvailablePort(string $environmentType): int
    {
        // Common ports that might be available on shared hosting
        $possiblePorts = [443, 8080, 8443, 6001, 3000];
        
        // For shared hosting, try to use standard HTTPS port first
        if ($environmentType === 'shared_hosting') {
            return 443; // Most shared hosting supports HTTPS on 443
        }
        
        return 443; // Default to HTTPS port
    }

    /**
     * Get Reverb host configuration
     */
    protected function getReverbHost(string $environmentType): ?string
    {
        // Try to get from environment first
        $envHost = env('REVERB_HOST');
        if ($envHost) {
            return $envHost;
        }

        // Try to detect from server variables
        $serverName = $_SERVER['SERVER_NAME'] ?? $_SERVER['HTTP_HOST'] ?? null;
        
        if ($serverName && $environmentType !== 'local') {
            // Remove port if present
            $host = explode(':', $serverName)[0];
            
            // Don't use IP addresses for production
            if (!filter_var($host, FILTER_VALIDATE_IP)) {
                return $host;
            }
        }

        return null; // Let Laravel use default
    }

    /**
     * Configure Reverb specifically for shared hosting
     */
    protected function configureReverbForSharedHosting(): void
    {
        // Optimize Reverb settings for shared hosting limitations
        Config::set('reverb.servers.reverb.max_request_size', 5000); // Smaller request size
        Config::set('reverb.apps.apps.0.ping_interval', 30); // More frequent pings
        Config::set('reverb.apps.apps.0.activity_timeout', 60); // Longer timeout for stability
        Config::set('reverb.apps.apps.0.max_message_size', 5000); // Smaller message size
        
        // Enable scaling if Redis is available
        if (extension_loaded('redis')) {
            Config::set('reverb.servers.reverb.scaling.enabled', true);
        }
    }
}
