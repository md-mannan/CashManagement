<?php

/**
 * Canonical module keys and role-based grants. users.permissions stores the snapshot for a role;
 * authorization uses role_permissions in this file.
 */
return [
    'modules' => [
        'view_dashboard' => 'Dashboard',
        'access_ledger' => 'Ledger',
        'manage_transactions' => 'Transactions',
        'view_all_transactions' => "All users' transactions",
        'view_all_user_data' => "All users' data",
        'manage_categories' => 'Categories',
        'view_reports' => 'Reports',
        'view_analytics' => 'Analytics',
        'admin_dashboard' => 'Admin dashboard',
        'manage_users' => 'User management',
        'manage_role_permissions' => 'Role & permissions',
        'manage_admins' => 'Manage administrators',
        'manage_system_settings' => 'System & currency settings',
        'view_system_logs' => 'Logs & activity',
        'export_data' => 'Export data',
        'import_data' => 'Import data',
        'perform_bulk_operations' => 'Bulk operations',
        'system_maintenance' => 'System maintenance',
        'super_admin_panel' => 'Super admin panel',
        'system_audit' => 'System audit',
        'system_health' => 'System health',
        'database_management' => 'Database management',
        'backup_restore' => 'Backup & restore',
    ],

    /**
     * Module keys granted by role (authorization). Super admins bypass checks in code.
     * Stored on users.permissions when creating/updating users for exports; access is derived from role.
     */
    'role_permissions' => [
        'super_admin' => ['*'],
        'admin' => [
            'view_dashboard',
            'access_ledger',
            'manage_transactions',
            'manage_categories',
            'view_reports',
            'admin_dashboard',
            'manage_users',
            'manage_admins',
            'manage_role_permissions',
            'view_analytics',
            'manage_system_settings',
            'view_system_logs',
        ],
        'user' => [
            'view_dashboard',
            'access_ledger',
            'manage_transactions',
            'manage_categories',
            'view_reports',
        ],
    ],
];
