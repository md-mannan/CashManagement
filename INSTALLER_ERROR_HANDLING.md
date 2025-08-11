# Cash Management Installer Error Handling System

This document describes the comprehensive error handling system for the Cash Management installer, which provides custom error pages with specific reasons and solutions when installation fails.

## Overview

The installer now includes specialized error pages that display when different types of failures occur during the installation process. Each error page provides:

- **Clear error identification** with appropriate icons and colors
- **Detailed error information** including error codes and specific details
- **Step-by-step solutions** tailored to the specific error type
- **Action buttons** for retry, go back, or start over
- **Common troubleshooting steps** and support information

## Error Page Types

### 1. General Error Page (`/install/error`)

**File:** `resources/js/pages/installer/error.tsx`

**Purpose:** Handles general installation errors with customizable error objects.

**Error Types Supported:**

- `requirements` - System requirements not met
- `database` - Database-related issues
- `configuration` - Configuration problems
- `installation` - Installation process failures
- `permission` - File permission issues
- `system` - System-level problems

**Usage Example:**

```tsx
// In your Laravel controller or route
return Inertia::render('installer/error', [
    'error' => [
        'type' => 'database',
        'title' => 'Database Connection Failed',
        'message' => 'Unable to connect to the specified database',
        'details' => ['Connection timeout', 'Invalid credentials'],
        'code' => 'DB_CONN_001',
        'suggestions' => ['Check database server', 'Verify credentials'],
        'canRetry' => true,
        'canGoBack' => true
    ]
]);
```

### 2. Database Error Page (`/install/database-error`)

**File:** `resources/js/pages/installer/database-error.tsx`

**Purpose:** Specialized page for database connection and setup failures.

**Error Types Supported:**

- `connection` - Connection failures
- `permission` - Database permission issues
- `database_not_found` - Database doesn't exist
- `invalid_credentials` - Wrong username/password
- `server_unreachable` - Server not accessible

**Features:**

- Shows current database configuration
- Provides specific MySQL commands for troubleshooting
- Database-specific error solutions

**Usage Example:**

```tsx
return Inertia::render('installer/database-error', [
    'error' => [
        'type' => 'connection',
        'title' => 'Database Connection Failed',
        'message' => 'Unable to establish connection to MySQL server',
        'details' => ['Connection timeout after 30 seconds'],
        'errorCode' => 'SQLSTATE[HY000] [2002] Connection refused',
        'databaseConfig' => [
            'host' => 'localhost',
            'port' => '3306',
            'database' => 'cash_management',
            'username' => 'root'
        ],
        'canRetry' => true
    ]
]);
```

### 3. Requirements Error Page (`/install/requirements-error`)

**File:** `resources/js/pages/installer/requirements-error.tsx`

**Purpose:** Detailed view when system requirements are not met.

**Features:**

- Lists all failed requirements with current vs. required values
- Provides specific solutions for each failure type
- Shows detailed requirements breakdown
- Includes retry functionality

**Usage Example:**

```tsx
return Inertia::render('installer/requirements-error', [
    'requirements' => [
        'php' => [
            'name' => 'PHP Version',
            'required' => '8.1.0',
            'current' => '7.4.0',
            'status' => false
        ],
        'extensions' => [
            'pdo_mysql' => [
                'name' => 'PDO MySQL',
                'required' => 'Enabled',
                'current' => 'Disabled',
                'status' => false
            ]
        ],
        'directories' => [
            'storage' => [
                'name' => 'Storage Directory',
                'required' => 'Writable',
                'current' => 'Not Writable',
                'status' => false
            ]
        ],
        'all_passed' => false
    ]
]);
```

### 4. Installation Error Page (`/install/installation-error`)

**File:** `resources/js/pages/installer/installation-error.tsx`

**Purpose:** Handles failures during the final installation process.

**Error Types Supported:**

- `database_setup` - Database creation/setup failures
- `migration` - Database migration failures
- `seeding` - Data seeding failures
- `file_permissions` - File permission issues
- `configuration` - Configuration problems
- `system` - System-level failures

**Features:**

- Shows error logs when available
- Provides troubleshooting steps
- Links to previous installation steps

## Integration with Existing Installer

### Requirements Page

The requirements page now includes a link to the detailed error report when requirements are not met:

```tsx
{
    !requirements.all_passed && (
        <div className="mt-4">
            <Link href="/install/requirements-error">
                <Button variant="destructive" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    View Detailed Error Report
                </Button>
            </Link>
        </div>
    );
}
```

### Database Page

The database page shows error report links when connection tests fail:

```tsx
{
    !testResult.success && (
        <div className="mt-3 text-center">
            <Link href="/install/database-error">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    View Detailed Error Report
                </Button>
            </Link>
        </div>
    );
}
```

## Laravel Backend Integration

### Error Handling in Controllers

```php
// In your installer controller
public function testDatabase(Request $request)
{
    try {
        // Database connection test logic
        $connection = DB::connection([
            'driver' => 'mysql',
            'host' => $request->host,
            'port' => $request->port,
            'database' => $request->database,
            'username' => $request->username,
            'password' => $request->password,
        ]);

        $connection->getPdo();

        return response()->json([
            'success' => true,
            'message' => 'Database connection successful'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage(),
            'errorType' => $this->determineErrorType($e),
            'details' => $this->getErrorDetails($e),
            'suggestions' => $this->getErrorSuggestions($e)
        ]);
    }
}

private function determineErrorType(\Exception $e): string
{
    $message = strtolower($e->getMessage());

    if (str_contains($message, 'access denied')) {
        return 'invalid_credentials';
    } elseif (str_contains($message, 'unknown database')) {
        return 'database_not_found';
    } elseif (str_contains($message, 'connection refused')) {
        return 'server_unreachable';
    } elseif (str_contains($message, 'access denied for user')) {
        return 'permission';
    }

    return 'connection';
}
```

### Requirements Check

```php
public function checkRequirements()
{
    $requirements = [
        'php' => [
            'name' => 'PHP Version',
            'required' => '8.1.0',
            'current' => PHP_VERSION,
            'status' => version_compare(PHP_VERSION, '8.1.0', '>=')
        ],
        'extensions' => [
            'pdo_mysql' => [
                'name' => 'PDO MySQL',
                'required' => 'Enabled',
                'current' => extension_loaded('pdo_mysql') ? 'Enabled' : 'Disabled',
                'status' => extension_loaded('pdo_mysql')
            ],
            'mbstring' => [
                'name' => 'Mbstring',
                'required' => 'Enabled',
                'current' => extension_loaded('mbstring') ? 'Enabled' : 'Disabled',
                'status' => extension_loaded('mbstring')
            ]
        ],
        'directories' => [
            'storage' => [
                'name' => 'Storage Directory',
                'required' => 'Writable',
                'current' => is_writable(storage_path()) ? 'Writable' : 'Not Writable',
                'status' => is_writable(storage_path())
            ],
            'bootstrap/cache' => [
                'name' => 'Bootstrap Cache',
                'required' => 'Writable',
                'current' => is_writable(bootstrap_path('cache')) ? 'Writable' : 'Not Writable',
                'status' => is_writable(bootstrap_path('cache'))
            ]
        ]
    ];

    $requirements['all_passed'] = collect($requirements)
        ->except('all_passed')
        ->flatMap(fn($group) => collect($group)->pluck('status'))
        ->every(fn($status) => $status);

    return Inertia::render('installer/requirements', compact('requirements'));
}
```

## Error Page Routing

Add these routes to your `routes/installer.php`:

```php
Route::get('/error', function () {
    return Inertia::render('installer/error', [
        'error' => [
            'type' => 'system',
            'title' => 'Installation Error',
            'message' => 'An unexpected error occurred during installation.',
            'canRetry' => true
        ]
    ]);
})->name('installer.error');

Route::get('/database-error', function () {
    return Inertia::render('installer/database-error', [
        'error' => [
            'type' => 'connection',
            'title' => 'Database Connection Failed',
            'message' => 'Unable to connect to the database server.',
            'canRetry' => true
        ]
    ]);
})->name('installer.database-error');

Route::get('/requirements-error', function () {
    // This should be called with actual requirements data
    return redirect()->route('installer.requirements');
})->name('installer.requirements-error');

Route::get('/installation-error', function () {
    return Inertia::render('installer/installation-error', [
        'error' => [
            'type' => 'system',
            'title' => 'Installation Failed',
            'message' => 'The installation process encountered an error.',
            'canRetry' => true
        ]
    ]);
})->name('installer.installation-error');
```

## Customization

### Adding New Error Types

To add new error types, update the TypeScript interfaces in the error page components:

```tsx
interface InstallerErrorProps {
    error: {
        type: 'requirements' | 'database' | 'configuration' | 'installation' | 'permission' | 'system' | 'new_error_type';
        // ... other properties
    };
}
```

### Custom Error Icons and Colors

Each error page includes functions to customize icons and colors based on error type:

```tsx
const getErrorIcon = (type: string) => {
    switch (type) {
        case 'new_error_type':
            return <CustomIcon className="text-custom-color h-16 w-16" />;
        // ... other cases
    }
};
```

### Adding New Solutions

Extend the solution functions to include new error types:

```tsx
const getSpecificSuggestions = (type: string) => {
    switch (type) {
        case 'new_error_type':
            return ['Custom solution 1', 'Custom solution 2'];
        // ... other cases
    }
};
```

## Best Practices

1. **Always provide specific error details** - Generic messages are not helpful
2. **Include actionable solutions** - Users should know exactly what to do
3. **Use appropriate error types** - This helps with styling and user experience
4. **Provide retry mechanisms** - Allow users to attempt fixes and retry
5. **Include support information** - Direct users to documentation or support
6. **Log errors properly** - Ensure errors are logged for debugging
7. **Test error scenarios** - Verify error pages work in all failure cases

## Support and Maintenance

The error handling system is designed to be:

- **Maintainable** - Easy to add new error types and solutions
- **User-friendly** - Clear, actionable error messages
- **Comprehensive** - Covers all common installation failure scenarios
- **Extensible** - Can be easily customized for specific needs

For questions or contributions to the error handling system, please refer to the project documentation or contact the development team.
