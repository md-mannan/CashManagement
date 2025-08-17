<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Dynamic Environment Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration dynamically adjusts based on the detected environment.
    | It automatically configures database, broadcasting, caching, and other
    | services based on the hosting environment and available resources.
    |
    */

    'auto_detect' => env('AUTO_DETECT_ENVIRONMENT', true),

    'environments' => [
        'local' => [
            'indicators' => [
                'domain_patterns' => ['localhost', '127.0.0.1', '.local', '.test'],
                'server_names' => ['localhost', 'local'],
                'app_env' => 'local',
            ],
            'config' => [
                'app' => [
                    'debug' => true,
                    'log_level' => 'debug',
                ],
                'database' => [
                    'default' => 'sqlite',
                    'connections' => [
                        'sqlite' => [
                            'database' => database_path('database.sqlite'),
                        ],
                    ],
                ],
                'broadcasting' => [
                    'default' => 'reverb',
                ],
                'cache' => [
                    'default' => 'file',
                ],
                'session' => [
                    'driver' => 'file',
                ],
                'queue' => [
                    'default' => 'sync',
                ],
                'mail' => [
                    'default' => 'log',
                ],
            ],
        ],

        'shared_hosting' => [
            'indicators' => [
                'hosting_patterns' => ['cpanel', 'plesk', 'directadmin'],
                'php_sapi' => ['apache2handler', 'cgi-fcgi'],
                'limited_resources' => true,
            ],
            'config' => [
                'app' => [
                    'debug' => false,
                    'log_level' => 'error',
                ],
                'database' => [
                    'default' => 'mysql',
                ],
                'broadcasting' => [
                    'default' => 'reverb', // Try Reverb first, fallback to Pusher if needed
                ],
                'cache' => [
                    'default' => 'database', // File cache might have permission issues
                ],
                'session' => [
                    'driver' => 'database',
                ],
                'queue' => [
                    'default' => 'database', // Background processes limited
                ],
                'mail' => [
                    'default' => 'smtp',
                ],
            ],
        ],

        'vps' => [
            'indicators' => [
                'has_root_access' => true,
                'can_run_processes' => true,
                'php_sapi' => ['fpm-fcgi', 'cli'],
            ],
            'config' => [
                'app' => [
                    'debug' => false,
                    'log_level' => 'info',
                ],
                'database' => [
                    'default' => 'mysql',
                ],
                'broadcasting' => [
                    'default' => 'reverb', // Can run Reverb server
                ],
                'cache' => [
                    'default' => 'redis',
                ],
                'session' => [
                    'driver' => 'redis',
                ],
                'queue' => [
                    'default' => 'redis',
                ],
                'mail' => [
                    'default' => 'smtp',
                ],
            ],
        ],

        'cloud' => [
            'indicators' => [
                'cloud_providers' => ['aws', 'gcp', 'azure', 'digitalocean', 'linode'],
                'container_env' => true,
            ],
            'config' => [
                'app' => [
                    'debug' => false,
                    'log_level' => 'warning',
                ],
                'database' => [
                    'default' => 'mysql',
                ],
                'broadcasting' => [
                    'default' => 'reverb', // Use Reverb for cloud environments too
                ],
                'cache' => [
                    'default' => 'redis',
                ],
                'session' => [
                    'driver' => 'redis',
                ],
                'queue' => [
                    'default' => 'sqs', // Cloud queue service
                ],
                'mail' => [
                    'default' => 'ses', // Cloud email service
                ],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Service Configurations
    |--------------------------------------------------------------------------
    |
    | Dynamic configurations for different services based on environment
    |
    */

    'services' => [
        'reverb' => [
            'fallback_to_pusher' => false, // Don't fallback to Pusher automatically
            'auto_generate_keys' => true,
            'production_port' => 443,
            'development_port' => 8080,
            'shared_hosting_support' => true, // Enable Reverb for shared hosting
            'custom_port_detection' => true, // Try to detect available ports
        ],

        'database' => [
            'auto_migrate' => env('AUTO_MIGRATE', false),
            'auto_seed' => env('AUTO_SEED', false),
            'connection_timeout' => 60,
        ],

        'cache' => [
            'prefix' => env('CACHE_PREFIX', 'cashmanagement'),
            'ttl' => [
                'short' => 300,   // 5 minutes
                'medium' => 3600, // 1 hour
                'long' => 86400,  // 24 hours
            ],
        ],

        'security' => [
            'force_https' => env('FORCE_HTTPS', null), // null = auto-detect
            'hsts_max_age' => 31536000,
            'content_security_policy' => true,
        ],
    ],
];
