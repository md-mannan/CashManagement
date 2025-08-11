<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Installer Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the default configuration for the installer.
    | These values will be used during the installation process.
    |
    */

    'defaults' => [
        'app' => [
            'name' => 'Cash Management',
            'timezone' => 'UTC',
            'locale' => 'en',
            'debug' => false,
        ],

        'database' => [
            'connection' => 'sqlite',
            'database' => 'database/database.sqlite',
        ],

        'features' => [
            'notifications' => true,
            'activity_logging' => true,
            'backup' => false,
            'social_login' => false,
        ],

        'currencies' => [
            'default' => 'USD',
            'secondary' => 'EUR',
        ],

        'admin' => [
            'name' => 'Administrator',
            'email' => 'admin@cashmanagement.com',
            'password' => 'admin123',
        ],
    ],

    'requirements' => [
        'php' => [
            'version' => '8.2.0',
            'extensions' => [
                'pdo',
                'pdo_sqlite',
                'mbstring',
                'openssl',
                'json',
                'tokenizer',
                'xml',
                'ctype',
                'bcmath',
            ],
        ],

        'permissions' => [
            'storage/app' => '0755',
            'storage/framework' => '0755',
            'storage/logs' => '0755',
            'bootstrap/cache' => '0755',
        ],
    ],

    'database_types' => [
        'sqlite' => [
            'name' => 'SQLite',
            'description' => 'Lightweight file-based database (recommended for development)',
            'driver' => 'sqlite',
            'fields' => [
                'database' => [
                    'type' => 'text',
                    'label' => 'Database Path',
                    'default' => 'database/database.sqlite',
                    'required' => true,
                ],
            ],
        ],
        'mysql' => [
            'name' => 'MySQL',
            'description' => 'Popular relational database server',
            'driver' => 'mysql',
            'fields' => [
                'host' => [
                    'type' => 'text',
                    'label' => 'Host',
                    'default' => 'localhost',
                    'required' => true,
                ],
                'port' => [
                    'type' => 'number',
                    'label' => 'Port',
                    'default' => '3306',
                    'required' => true,
                ],
                'database' => [
                    'type' => 'text',
                    'label' => 'Database Name',
                    'default' => 'cash_management',
                    'required' => true,
                ],
                'username' => [
                    'type' => 'text',
                    'label' => 'Username',
                    'default' => 'root',
                    'required' => true,
                ],
                'password' => [
                    'type' => 'password',
                    'label' => 'Password',
                    'default' => '',
                    'required' => false,
                ],
            ],
        ],
    ],
];
