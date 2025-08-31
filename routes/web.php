<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Broadcast;
use Inertia\Inertia;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\SuperAdminController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\SystemAuditController;
use App\Http\Controllers\Admin\DatabaseManagementController;
use App\Http\Controllers\Admin\BackupRestoreController;
use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\SystemSettingsController;
use App\Http\Controllers\Admin\SystemHealthController;
use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\CurrencyController;
use App\Http\Controllers\Settings\ExchangeRateController as SettingsExchangeRateController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Api\ExchangeRateController as ApiExchangeRateController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Middleware\ValidatePostSize;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// Public landing page - accessible to all users
Route::get('/welcome', function () {
    return Inertia::render('Welcome');
})->name('welcome');

// Public features page
Route::get('/features', function () {
    return Inertia::render('Features');
})->name('features');

// Public about page
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

// Public health check
Route::get('/health', function () {
    return response()->json(['status' => 'healthy', 'timestamp' => now()]);
})->name('health');

// Home route - Simplified to prevent redirect loops
Route::get('/', function () {
    return redirect()->route('welcome');
})->name('home');

// ============================================================================
// BROADCASTING AUTHENTICATION ROUTES
// ============================================================================

Broadcast::routes(['middleware' => ['web', 'auth']]);

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

Route::middleware('guest')->group(function () {
    // Registration
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store'])->name('register.store');

    // Login
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');

    // Password Reset
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');


});

Route::middleware('auth')->group(function () {
    // Email Verification
    Route::get('verify-email', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // Password Confirmation
    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('password.confirm.store');

    // Logout
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// ============================================================================
// AUTHENTICATED USER ROUTES
// ============================================================================

Route::middleware(['auth', 'verified', 'user.data.access'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Ledger (transactions summary)
    Route::get('ledger', [TransactionController::class, 'ledger'])->name('ledger');

    // Transactions
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::get('/create', [TransactionController::class, 'create'])->name('create');
        Route::post('/', [TransactionController::class, 'store'])->name('store');

        // Add Transaction Type Pages (must come before {transaction} routes)
        Route::get('/add-income', [TransactionController::class, 'addIncome'])->name('add-income');
        Route::get('/add-expense', [TransactionController::class, 'addExpense'])->name('add-expense');
        Route::get('/add-receivable', [TransactionController::class, 'addReceivable'])->name('add-receivable');
        Route::get('/add-payable', [TransactionController::class, 'addPayable'])->name('add-payable');

        // Generic transaction routes (must come after specific routes)
        Route::get('/{transaction}', [TransactionController::class, 'show'])->name('show')->where('transaction', '[0-9]+');
        Route::get('/{transaction}/edit', [TransactionController::class, 'edit'])->name('edit')->where('transaction', '[0-9]+');
        Route::put('/{transaction}', [TransactionController::class, 'update'])->name('update')->where('transaction', '[0-9]+');
        Route::delete('/{transaction}', [TransactionController::class, 'destroy'])->name('destroy')->where('transaction', '[0-9]+');
        
        // Settlement route
        Route::post('/{transaction}/settle', [TransactionController::class, 'settle'])->name('settle')->where('transaction', '[0-9]+');
    });

    // Categories
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Notifications
    Route::get('notifications', function () {
        return Inertia::render('notifications');
    })->name('notifications');

    // Settings
    Route::redirect('settings', '/settings/profile');

    // Profile Settings
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('settings.profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('settings.profile.destroy');
    Route::delete('settings/profile/photo', [ProfileController::class, 'removePhoto'])->name('settings.profile.remove-photo');
    
    // Profile Photo Management
    Route::post('settings/profile/photo', [ProfileController::class, 'uploadPhoto'])->name('settings.profile.upload-photo');
    Route::post('settings/profile/test-upload', [ProfileController::class, 'testUpload'])->name('settings.profile.test-upload');
    Route::patch('settings/profile/photo/{profilePhoto}/current', [ProfileController::class, 'setCurrentPhoto'])->name('settings.profile.set-current-photo');
    Route::delete('settings/profile/photo/{profilePhoto}', [ProfileController::class, 'deletePhoto'])->name('settings.profile.delete-photo');

    // Password Settings
    Route::get('settings/password', [PasswordController::class, 'edit'])->name('settings.password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('settings.password.update');

    // Appearance Settings
    Route::get('settings/appearance', [AppearanceController::class, 'edit'])->name('settings.appearance.edit');
    Route::patch('settings/appearance', [AppearanceController::class, 'update'])->name('settings.appearance.update');
    Route::post('settings/appearance/mode', [AppearanceController::class, 'updateMode'])->name('settings.appearance.mode');
    Route::post('settings/appearance/theme', [AppearanceController::class, 'updateTheme'])->name('settings.appearance.theme');

    // Currency Settings
    Route::get('settings/currency', [CurrencyController::class, 'edit'])->name('settings.currency.edit');
    Route::patch('settings/currency', [CurrencyController::class, 'update'])->name('settings.currency.update');
    Route::get('settings/currency/live-rate', [CurrencyController::class, 'getLiveRate'])->name('settings.currency.live-rate');



    // Exchange Rate Settings
    Route::get('settings/exchange-rate', [SettingsExchangeRateController::class, 'edit'])->name('settings.exchange-rate.edit');
    Route::patch('settings/exchange-rate', [SettingsExchangeRateController::class, 'update'])->name('settings.exchange-rate.update');
    Route::delete('settings/exchange-rate', [SettingsExchangeRateController::class, 'destroy'])->name('settings.exchange-rate.destroy');
    Route::post('settings/exchange-rate/test', [SettingsExchangeRateController::class, 'test'])->name('settings.exchange-rate.test');

    // Notifications are handled via API routes

    // Legacy route redirects for backward compatibility
    Route::get('transaction', function () {
        return redirect()->route('transactions.index');
    })->name('transaction');

    Route::get('add-transaction', function () {
        return redirect()->route('transactions.create');
    })->name('add-transaction');

    Route::get('transaction/{transaction}', [TransactionController::class, 'show'])->name('transaction.view')->where('transaction', '[0-9]+');

    Route::get('transaction/{transaction}/edit', [TransactionController::class, 'edit'])->name('transaction.edit')->where('transaction', '[0-9]+');

    Route::delete('transaction/{transaction}', [TransactionController::class, 'destroy'])->name('transaction.delete')->where('transaction', '[0-9]+');

    // Redirect authenticated users to dashboard
    Route::get('/home', function () {
        return redirect()->route('dashboard');
    })->name('home.authenticated');
});

// Gallery routes with basic auth middleware
Route::middleware('auth')->group(function () {
    Route::get('gallery', [GalleryController::class, 'index'])->name('gallery');
    Route::post('gallery/upload', [GalleryController::class, 'upload'])
        ->name('gallery.upload')
        ->withoutMiddleware(\Illuminate\Http\Middleware\ValidatePostSize::class)
        ->middleware('large.file.upload');
    Route::delete('gallery/{media}', [GalleryController::class, 'destroy'])->name('gallery.delete');
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Analytics
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [AdminAnalyticsController::class, 'index'])->name('index');
    });

    // System Settings
    Route::prefix('system-settings')->name('system-settings.')->group(function () {
        Route::get('/', [SystemSettingsController::class, 'index'])->name('index');
        Route::put('/general', [SystemSettingsController::class, 'updateGeneral'])->name('general');
        Route::put('/email', [SystemSettingsController::class, 'updateEmail'])->name('email');
        Route::put('/database', [SystemSettingsController::class, 'updateDatabase'])->name('database');
        Route::put('/security', [SystemSettingsController::class, 'updateSecurity'])->name('security');
    });

    // System Health
    Route::prefix('system-health')->name('system-health.')->group(function () {
        Route::get('/', [SystemHealthController::class, 'index'])->name('index');
    });

    // Super Admin Management (only accessible by super admins)
    Route::prefix('super-admin')->name('super-admin.')->middleware('super_admin')->group(function () {
        Route::get('/', [SuperAdminController::class, 'index'])->name('index');
        Route::post('/users/{user}/promote', [SuperAdminController::class, 'promoteToSuperAdmin'])->name('promote');
        Route::post('/users/{user}/demote', [SuperAdminController::class, 'demoteFromSuperAdmin'])->name('demote');
        Route::put('/users/{user}/permissions', [SuperAdminController::class, 'updateSuperAdminPermissions'])->name('permissions');
        Route::get('/audit', [SuperAdminController::class, 'systemAudit'])->name('audit');
        Route::get('/audit/{activityLog}', [SuperAdminController::class, 'viewActivityLog'])->name('audit.show');
        Route::get('/system-health', [SuperAdminController::class, 'systemHealth'])->name('system-health');
    });

    // User Management
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show');
        Route::post('/', [UserManagementController::class, 'store'])->name('store');
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
        Route::post('/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('reset-password');
    });

    // Role & Permission Management
    Route::prefix('role-permission')->name('role-permission.')->group(function () {
        Route::get('/', [RolePermissionController::class, 'index'])->name('index');
        Route::put('/users/{user}/role', [RolePermissionController::class, 'updateUserRole'])->name('users.role');
        Route::put('/users/{user}/permissions', [RolePermissionController::class, 'updateUserPermissions'])->name('users.permissions');
        Route::post('/bulk-update', [RolePermissionController::class, 'bulkUpdateRoles'])->name('bulk-update');
        Route::get('/export', [RolePermissionController::class, 'exportUsers'])->name('export');
    });

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('index');
        Route::get('/{notification}', [\App\Http\Controllers\Admin\NotificationController::class, 'show'])->name('show');
        Route::delete('/{notification}', [\App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('destroy');
        Route::post('/mark-all-as-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    });

    // Activity Logs
    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', [ActivityLogController::class, 'index'])->name('index');
        Route::get('/{activityLog}', [ActivityLogController::class, 'show'])->name('show');
        Route::get('/export', [ActivityLogController::class, 'export'])->name('export');
        Route::delete('/clear', [ActivityLogController::class, 'clear'])->name('clear');
    });

    // System Audit
    Route::prefix('system-audit')->name('system-audit.')->group(function () {
        Route::get('/', [SystemAuditController::class, 'index'])->name('index');
        Route::get('/export', [SystemAuditController::class, 'export'])->name('export');
    });

    // Database Management
    Route::prefix('database')->name('database.')->group(function () {
        Route::get('/', [DatabaseManagementController::class, 'index'])->name('index');
        Route::post('/optimize', [DatabaseManagementController::class, 'optimize'])->name('optimize');
        Route::post('/repair', [DatabaseManagementController::class, 'repair'])->name('repair');
        Route::get('/status', [DatabaseManagementController::class, 'status'])->name('status');
    });

    // Backup & Restore (only accessible by super admins)
    Route::prefix('backup')->name('backup.')->middleware('super_admin')->group(function () {
        Route::get('/', [BackupRestoreController::class, 'index'])->name('index');
        Route::post('/create', [BackupRestoreController::class, 'create'])->name('create');
        Route::post('/restore', [BackupRestoreController::class, 'restore'])->name('restore');
        Route::delete('/{backup}', [BackupRestoreController::class, 'destroy'])->name('destroy');
        Route::get('/download/{backup}', [BackupRestoreController::class, 'download'])->name('download');
    });
});

// ============================================================================
// API ROUTES
// ============================================================================

Route::prefix('api')->name('api.')->group(function () {
    // Exchange Rate API Routes
    Route::prefix('exchange-rates')->name('exchange-rates.')->group(function () {
        // Public routes (no authentication required)
        Route::get('/', [ApiExchangeRateController::class, 'getCurrentRates'])->name('current');
        Route::get('/rate', [ApiExchangeRateController::class, 'getRate'])->name('rate');
        Route::get('/currencies', [ApiExchangeRateController::class, 'getSupportedCurrencies'])->name('currencies');
        Route::post('/convert', [ApiExchangeRateController::class, 'convertAmount'])->name('convert');

        // Authenticated routes
        Route::middleware('auth')->group(function () {
            Route::post('/sync', [ApiExchangeRateController::class, 'syncRates'])->name('sync');
            Route::delete('/old-rates', [ApiExchangeRateController::class, 'clearOldRates'])->name('clear-old');
            Route::get('/database-status', [ApiExchangeRateController::class, 'getDatabaseStatus'])->name('database-status');
        });
    });

    // Notification API Routes
    Route::prefix('notifications')->name('notifications.')->middleware('auth')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-as-read');
        Route::post('/clear-all', [NotificationController::class, 'clearAll'])->name('clear-all');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    });

    // User API (authenticated)
    Route::get('/user', function (Illuminate\Http\Request $request) {
        return $request->user();
    })->middleware('auth')->name('user');
});

// ============================================================================
// FALLBACK ROUTE
// ============================================================================

Route::fallback(function () {
    return redirect()->route('home');
});
