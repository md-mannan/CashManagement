<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use App\Models\User;
use App\Services\InstallationService;

class InstallerController extends Controller
{
    public function __construct(
        private InstallationService $installationService
    ) {}

        public function index()
    {
        $status = $this->installationService->getInstallationStatus();
        $defaultConfig = $this->installationService->getDefaultConfig();
        $installerConfig = $this->installationService->getInstallerConfig();

        return Inertia::render('installer/welcome', [
            'installationStatus' => $status,
            'defaultConfig' => $defaultConfig,
            'installerConfig' => $installerConfig,
        ]);
    }

    public function requirements()
    {
        $requirements = $this->checkRequirements();

        return Inertia::render('installer/requirements', [
            'requirements' => $requirements
        ]);
    }

    public function database()
    {
        return Inertia::render('installer/database');
    }

    public function configuration()
    {
        return Inertia::render('installer/configuration');
    }

    public function testDatabase(Request $request)
    {
        $request->validate([
            'host' => 'required|string',
            'port' => 'required|numeric',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'nullable|string',
        ]);

        try {
            // Test database connection
            $connection = $this->testConnection($request->all());

            if ($connection['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Database connection successful!',
                    'tables' => $connection['tables']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $connection['message']
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function install(Request $request)
    {
        $request->validate([
            'host' => 'required|string',
            'port' => 'required|numeric',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'nullable|string',
            'app_name' => 'required|string|max:255',
            'app_url' => 'required|url',
            'app_timezone' => 'required|string',
            'app_locale' => 'required|string',
            'default_currency' => 'required|string|size:3',
            'default_secondary_currency' => 'required|string|size:3',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255',
            'admin_password' => 'required|string|min:8',
            'admin_password_confirmation' => 'required|same:admin_password',
            'enable_notifications' => 'boolean',
            'enable_activity_logging' => 'boolean',
            'enable_backup' => 'boolean',
            'enable_social_login' => 'boolean',
        ]);

        try {
            // Update database configuration
            $this->updateDatabaseConfig($request->all());

            // Run migrations
            $this->runMigrations();

            // Create admin user
            $this->createAdminUser($request->all());

            // Create .env file with all configuration
            $this->createEnvFile($request->all());

            // Mark as installed
            $this->markAsInstalled();

            // Clear caches
            $this->clearCaches();

            return response()->json([
                'success' => true,
                'message' => 'Installation completed successfully!',
                'redirect_url' => '/install/complete'
            ]);

        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Installation failed: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);

            // Determine error type and provide specific suggestions
            $errorType = 'installation';
            $details = [];
            $suggestions = [];

            if (strpos($e->getMessage(), 'database') !== false || strpos($e->getMessage(), 'SQL') !== false) {
                $errorType = 'database_setup';
                $details = [
                    'Database operation failed',
                    'Check database connection and permissions',
                    'Verify database user has sufficient privileges'
                ];
                $suggestions = [
                    'Verify database connection details',
                    'Ensure database user has CREATE, ALTER, DROP privileges',
                    'Check if database exists and is accessible'
                ];
            } elseif (strpos($e->getMessage(), 'permission') !== false || strpos($e->getMessage(), 'write') !== false) {
                $errorType = 'file_permissions';
                $details = [
                    'File permission error',
                    'Unable to write to required directories',
                    'Check storage and bootstrap/cache permissions'
                ];
                $suggestions = [
                    'Set proper permissions on storage directory: chmod 755 storage',
                    'Set proper permissions on bootstrap/cache: chmod 755 bootstrap/cache',
                    'Check ownership: chown www-data:www-data directory_name'
                ];
            } elseif (strpos($e->getMessage(), 'migration') !== false) {
                $errorType = 'migration';
                $details = [
                    'Database migration failed',
                    'Unable to create or modify database tables',
                    'Check database schema and constraints'
                ];
                $suggestions = [
                    'Verify database connection and permissions',
                    'Check for conflicting table names',
                    'Ensure database user has ALTER and CREATE privileges'
                ];
            } else {
                $details = [
                    'Unexpected error occurred',
                    'Check server logs for more details',
                    'Verify all requirements are met'
                ];
                $suggestions = [
                    'Check server error logs',
                    'Verify PHP extensions and requirements',
                    'Contact support with error details'
                ];
            }

            return response()->json([
                'success' => false,
                'message' => 'Installation failed: ' . $e->getMessage(),
                'errorType' => $errorType,
                'details' => $details,
                'suggestions' => $suggestions,
                'errorCode' => 'INST_' . strtoupper($errorType) . '_001'
            ], 500);
        }
    }

    public function complete()
    {
        if (!$this->isInstalled()) {
            return redirect('/install');
        }

        return Inertia::render('installer/complete');
    }

    public function installationError()
    {
        return Inertia::render('installer/installation-error');
    }

    public function requirementsError()
    {
        return Inertia::render('installer/requirements-error');
    }

    public function databaseError()
    {
        return Inertia::render('installer/database-error');
    }

    private function isInstalled()
    {
        // Check if .env file exists and has APP_INSTALLED=true
        if (!file_exists(base_path('.env'))) {
            return false;
        }

        $envContent = file_get_contents(base_path('.env'));
        return strpos($envContent, 'APP_INSTALLED=true') !== false;
    }

    private function checkRequirements()
    {
        $requirements = [
            'php' => [
                'name' => 'PHP Version',
                'required' => '8.1.0',
                'current' => PHP_VERSION,
                'status' => version_compare(PHP_VERSION, '8.1.0', '>='),
            ],
            'extensions' => [
                'bcmath' => [
                    'name' => 'BCMath Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('bcmath') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('bcmath'),
                ],
                'ctype' => [
                    'name' => 'Ctype Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('ctype') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('ctype'),
                ],
                'fileinfo' => [
                    'name' => 'Fileinfo Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('fileinfo') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('fileinfo'),
                ],
                'json' => [
                    'name' => 'JSON Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('json') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('json'),
                ],
                'mbstring' => [
                    'name' => 'Mbstring Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('mbstring') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('mbstring'),
                ],
                'openssl' => [
                    'name' => 'OpenSSL Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('openssl') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('openssl'),
                ],
                'pdo' => [
                    'name' => 'PDO Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('pdo') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('pdo'),
                ],
                'tokenizer' => [
                    'name' => 'Tokenizer Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('tokenizer') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('tokenizer'),
                ],
                'xml' => [
                    'name' => 'XML Extension',
                    'required' => 'Enabled',
                    'current' => extension_loaded('xml') ? 'Enabled' : 'Disabled',
                    'status' => extension_loaded('xml'),
                ],
            ],
            'directories' => [
                'storage' => [
                    'name' => 'Storage Directory',
                    'required' => 'Writable',
                    'current' => is_writable(storage_path()) ? 'Writable' : 'Not Writable',
                    'status' => is_writable(storage_path()),
                ],
                'bootstrap/cache' => [
                    'name' => 'Bootstrap Cache Directory',
                    'required' => 'Writable',
                    'current' => is_writable(base_path('bootstrap/cache')) ? 'Writable' : 'Not Writable',
                    'status' => is_writable(base_path('bootstrap/cache')),
                ],
                'public' => [
                    'name' => 'Public Directory',
                    'required' => 'Writable',
                    'current' => is_writable(public_path()) ? 'Writable' : 'Not Writable',
                    'status' => is_writable(public_path()),
                ],
            ],
        ];

        $requirements['all_passed'] =
            $requirements['php']['status'] &&
            collect($requirements['extensions'])->every(fn($ext) => $ext['status']) &&
            collect($requirements['directories'])->every(fn($dir) => $dir['status']);

        return $requirements;
    }

    private function testConnection($config)
    {
        try {
            // Test connection with provided credentials
            $connection = new \PDO(
                "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']}",
                $config['username'],
                $config['password']
            );

            // Get existing tables
            $stmt = $connection->query('SHOW TABLES');
            $tables = $stmt->fetchAll(\PDO::FETCH_COLUMN);

            return [
                'success' => true,
                'message' => 'Connection successful',
                'tables' => $tables
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    private function updateDatabaseConfig($config)
    {
        // Update .env file with database configuration
        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        $envContent = preg_replace('/DB_HOST=.*/', "DB_HOST={$config['host']}", $envContent);
        $envContent = preg_replace('/DB_PORT=.*/', "DB_PORT={$config['port']}", $envContent);
        $envContent = preg_replace('/DB_DATABASE=.*/', "DB_DATABASE={$config['database']}", $envContent);
        $envContent = preg_replace('/DB_USERNAME=.*/', "DB_USERNAME={$config['username']}", $envContent);
        $envContent = preg_replace('/DB_PASSWORD=.*/', "DB_PASSWORD={$config['password']}", $envContent);

        file_put_contents($envPath, $envContent);

        // Clear config cache
        Artisan::call('config:clear');
    }

    private function runMigrations()
    {
        // Run migrations
        Artisan::call('migrate:fresh', ['--force' => true]);

        // Run seeders
        Artisan::call('db:seed', ['--force' => true]);
    }

    private function createAdminUser($config)
    {
        // Create super admin user
        User::create([
            'name' => $config['admin_name'],
            'email' => $config['admin_email'],
            'password' => Hash::make($config['admin_password']),
            'role' => 'super_admin',
            'email_verified_at' => now(),
            'primary_currency' => $config['default_currency'],
            'secondary_currency' => $config['default_secondary_currency'],
            'primary_symbol' => '$', // Default, can be overridden
            'secondary_symbol' => '€', // Default, can be overridden
            'exchange_rate' => 1.0, // Default, can be overridden
            'timezone' => $config['app_timezone'],
            'locale' => $config['app_locale'],
            'enable_notifications' => $config['enable_notifications'] ?? false,
            'enable_activity_logging' => $config['enable_activity_logging'] ?? false,
            'enable_backup' => $config['enable_backup'] ?? false,
            'enable_social_login' => $config['enable_social_login'] ?? false,
        ]);
    }

    private function createEnvFile($config)
    {
        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        // Update app configuration
        $envContent = preg_replace('/APP_NAME=.*/', "APP_NAME=\"{$config['app_name']}\"", $envContent);
        $envContent = preg_replace('/APP_URL=.*/', "APP_URL={$config['app_url']}", $envContent);
        $envContent = preg_replace('/APP_TIMEZONE=.*/', "APP_TIMEZONE={$config['app_timezone']}", $envContent);
        $envContent = preg_replace('/APP_LOCALE=.*/', "APP_LOCALE={$config['app_locale']}", $envContent);

        // Add custom configuration if not exists
        if (strpos($envContent, 'DEFAULT_CURRENCY') === false) {
            $envContent .= "\nDEFAULT_CURRENCY={$config['default_currency']}\n";
        } else {
            $envContent = preg_replace('/DEFAULT_CURRENCY=.*/', "DEFAULT_CURRENCY={$config['default_currency']}", $envContent);
        }

        if (strpos($envContent, 'DEFAULT_SECONDARY_CURRENCY') === false) {
            $envContent .= "\nDEFAULT_SECONDARY_CURRENCY={$config['default_secondary_currency']}\n";
        } else {
            $envContent = preg_replace('/DEFAULT_SECONDARY_CURRENCY=.*/', "DEFAULT_SECONDARY_CURRENCY={$config['default_secondary_currency']}", $envContent);
        }

        if (strpos($envContent, 'ENABLE_NOTIFICATIONS') === false) {
            $envContent .= "\nENABLE_NOTIFICATIONS=" . ($config['enable_notifications'] ? 'true' : 'false') . "\n";
        } else {
            $envContent = preg_replace('/ENABLE_NOTIFICATIONS=.*/', "ENABLE_NOTIFICATIONS=" . ($config['enable_notifications'] ? 'true' : 'false'), $envContent);
        }

        if (strpos($envContent, 'ENABLE_ACTIVITY_LOGGING') === false) {
            $envContent .= "\nENABLE_ACTIVITY_LOGGING=" . ($config['enable_activity_logging'] ? 'true' : 'false') . "\n";
        } else {
            $envContent = preg_replace('/ENABLE_ACTIVITY_LOGGING=.*/', "ENABLE_ACTIVITY_LOGGING=" . ($config['enable_activity_logging'] ? 'true' : 'false'), $envContent);
        }

        if (strpos($envContent, 'ENABLE_BACKUP') === false) {
            $envContent .= "\nENABLE_BACKUP=" . ($config['enable_backup'] ? 'true' : 'false') . "\n";
        } else {
            $envContent = preg_replace('/ENABLE_BACKUP=.*/', "ENABLE_BACKUP=" . ($config['enable_backup'] ? 'true' : 'false'), $envContent);
        }

        if (strpos($envContent, 'ENABLE_SOCIAL_LOGIN') === false) {
            $envContent .= "\nENABLE_SOCIAL_LOGIN=" . ($config['enable_social_login'] ? 'true' : 'false') . "\n";
        } else {
            $envContent = preg_replace('/ENABLE_SOCIAL_LOGIN=.*/', "ENABLE_SOCIAL_LOGIN=" . ($config['enable_social_login'] ? 'true' : 'false'), $envContent);
        }

        // Add installation flag
        if (strpos($envContent, 'APP_INSTALLED') === false) {
            $envContent .= "\nAPP_INSTALLED=true\n";
        } else {
            $envContent = preg_replace('/APP_INSTALLED=.*/', 'APP_INSTALLED=true', $envContent);
        }

        file_put_contents($envPath, $envContent);
    }

    private function markAsInstalled()
    {
        // Create a marker file
        file_put_contents(storage_path('installed'), date('Y-m-d H:i:s'));
    }

    private function clearCaches()
    {
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('cache:clear');
        Artisan::call('view:clear');
    }
}
