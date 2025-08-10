<?php

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
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Analytics (accessible by admins and super admins)
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [AdminAnalyticsController::class, 'index'])->name('index');
    });

    // System Settings (accessible by admins and super admins)
    Route::prefix('system-settings')->name('system-settings.')->group(function () {
        Route::get('/', [SystemSettingsController::class, 'index'])->name('index');
        Route::put('/general', [SystemSettingsController::class, 'updateGeneral'])->name('general');
        Route::put('/email', [SystemSettingsController::class, 'updateEmail'])->name('email');
        Route::put('/database', [SystemSettingsController::class, 'updateDatabase'])->name('database');
        Route::put('/security', [SystemSettingsController::class, 'updateSecurity'])->name('security');
    });

    // System Health (accessible by admins and super admins)
    Route::prefix('system-health')->name('system-health.')->group(function () {
        Route::get('/', [SystemHealthController::class, 'index'])->name('index');
    });

    // Super Admin Management (only accessible by super admins) - MUST COME BEFORE USERS ROUTE
    Route::prefix('super-admin')->name('super-admin.')->middleware('super_admin')->group(function () {
        Route::get('/', [SuperAdminController::class, 'index'])->name('index');
        Route::post('/users/{user}/promote', [SuperAdminController::class, 'promoteToSuperAdmin'])->name('promote');
        Route::post('/users/{user}/demote', [SuperAdminController::class, 'demoteFromSuperAdmin'])->name('demote');
        Route::put('/users/{user}/permissions', [SuperAdminController::class, 'updateSuperAdminPermissions'])->name('permissions');
        Route::get('/audit', [SuperAdminController::class, 'systemAudit'])->name('audit');
        Route::get('/audit/{activityLog}', [SuperAdminController::class, 'viewActivityLog'])->name('audit.show');
        Route::get('/system-health', [SuperAdminController::class, 'systemHealth'])->name('system-health');
    });

    // User Management - MOVED AFTER SUPER-ADMIN ROUTES
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

    // Activity Logs (accessible by admins and super admins)
    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', [ActivityLogController::class, 'index'])->name('index');
        Route::get('/{activityLog}', [ActivityLogController::class, 'show'])->name('show');
        Route::get('/export', [ActivityLogController::class, 'export'])->name('export');
        Route::delete('/clear', [ActivityLogController::class, 'clear'])->name('clear');
    });

    // Notifications (accessible by admins and super admins)
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/notifications');
        })->name('index');
    });

    // System Audit (accessible by admins and super admins)
    Route::prefix('system-audit')->name('system-audit.')->group(function () {
        Route::get('/', [SystemAuditController::class, 'index'])->name('index');
        Route::get('/export', [SystemAuditController::class, 'export'])->name('export');
    });

    // Database Management (accessible by admins and super admins)
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
