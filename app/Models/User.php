<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Support\Facades\Storage;
use App\Notifications\ResetPasswordNotification;
use App\Models\ProfilePhoto;

class User extends Authenticatable implements CanResetPasswordContract
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, CanResetPassword;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'profile_photo',
        'password',
        'primary_currency',
        'secondary_currency',
        'primary_symbol',
        'secondary_symbol',
        'exchange_rate',
        'appearance_mode',
        'theme',
        'timezone',
        'locale',
        'date_format',
        'time_format',
        'exchange_rate_api_key',
        'exchange_rate_api_provider',
        'role',
        'permissions',
        'is_active',
        'last_login_at',
        'password_reset_token',
        'password_reset_expires_at',
        'force_password_change',
        'enable_notifications',
        'enable_activity_logging',
        'enable_backup',

    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'avatar',
        'effective_permissions',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'exchange_rate_api_key',
        'password_reset_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'exchange_rate' => 'decimal:4',
            'permissions' => 'array',
            'last_login_at' => 'datetime',
            'password_reset_expires_at' => 'datetime',
        ];
    }

    /**
     * Get the transactions for the user.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get unread notifications count.
     */
    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->unread()->count();
    }



    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    /**
     * Check if user is super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Get the user's profile photo URL.
     */
    public function getAvatarAttribute()
    {
        // Get the current profile photo from ProfilePhoto model
        $currentPhoto = $this->profilePhotos()->where('is_current', true)->first();
        
        if ($currentPhoto) {
            return $currentPhoto->url;
        }
        
        // Fallback to the old profile_photo field if no current photo exists
        if ($this->profile_photo) {
            return Storage::disk('public')->url($this->profile_photo);
        }
        
        return null;
    }

    /**
     * Get the user's profile photos.
     */
    public function profilePhotos(): HasMany
    {
        return $this->hasMany(ProfilePhoto::class);
    }

    /**
     * Get the user's current profile photo.
     */
    public function currentProfilePhoto(): HasMany
    {
        return $this->hasMany(ProfilePhoto::class)->current();
    }

    /**
     * Get the user's profile photo history.
     */
    public function profilePhotoHistory(): HasMany
    {
        return $this->hasMany(ProfilePhoto::class)->history();
    }



    /**
     * Default permission keys stored for a role (and used as the effective set for non–super-admins).
     *
     * @return list<string>
     */
    public static function defaultPermissionsForRole(string $role): array
    {
        $map = config('module_permissions.role_permissions', []);

        return $map[$role] ?? $map['user'] ?? [];
    }

    /**
     * Keys the user effectively has for UI and authorization (derived from role).
     *
     * @return list<string>
     */
    public function effectivePermissions(): array
    {
        if ($this->isSuperAdmin()) {
            return array_keys(config('module_permissions.modules', []));
        }

        $perms = self::defaultPermissionsForRole($this->role ?? 'user');

        if ($perms === ['*'] || (count($perms) === 1 && ($perms[0] ?? null) === '*')) {
            return array_keys(config('module_permissions.modules', []));
        }

        return $perms;
    }

    public function getEffectivePermissionsAttribute(): array
    {
        return $this->effectivePermissions();
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $perms = $this->effectivePermissions();

        if (in_array('*', $perms, true)) {
            return true;
        }

        if (in_array($permission, $perms, true)) {
            return true;
        }

        foreach ($this->equivalentPermissionKeys($permission) as $equivalent) {
            if ($equivalent !== $permission && in_array($equivalent, $perms, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Legacy seeders/UI used alternate keys; treat them as the same capability.
     *
     * @return list<string>
     */
    private function equivalentPermissionKeys(string $permission): array
    {
        $groups = [
            ['manage_system_settings', 'manage_settings'],
            ['view_system_logs', 'view_logs', 'view_activity_logs'],
        ];

        foreach ($groups as $group) {
            if (in_array($permission, $group, true)) {
                return $group;
            }
        }

        return [$permission];
    }

    public function hasAnyPermission(array $permissions): bool
    {
        return collect($permissions)->some(fn($permission) => $this->hasPermission($permission));
    }

    public function hasAllPermissions(array $permissions): bool
    {
        return collect($permissions)->every(fn($permission) => $this->hasPermission($permission));
    }

    /**
     * Check if user can manage users.
     */
    public function canManageUsers(): bool
    {
        return $this->hasPermission('manage_users');
    }

    /**
     * Check if user can manage admins.
     */
    public function canManageAdmins(): bool
    {
        return $this->hasPermission('manage_admins');
    }

    /**
     * Check if user can view analytics.
     */
    public function canViewAnalytics(): bool
    {
        return $this->hasPermission('view_analytics');
    }

    /**
     * Check if user can view all transactions (including other users).
     */
    public function canViewAllTransactions(): bool
    {
        return $this->hasPermission('view_all_transactions');
    }

    /**
     * Check if user can view all user data.
     */
    public function canViewAllUserData(): bool
    {
        return $this->hasPermission('view_all_user_data');
    }

    /**
     * Check if user can access ledger.
     */
    public function canAccessLedger(): bool
    {
        return $this->hasPermission('access_ledger');
    }

    /**
     * Check if user can manage transactions.
     */
    public function canManageTransactions(): bool
    {
        return $this->hasPermission('manage_transactions');
    }

    /**
     * Check if user can manage categories.
     */
    public function canManageCategories(): bool
    {
        return $this->hasPermission('manage_categories');
    }

    /**
     * Check if user can manage system settings.
     */
    public function canManageSystemSettings(): bool
    {
        return $this->hasPermission('manage_system_settings');
    }

    /**
     * Check if user can view system logs.
     */
    public function canViewSystemLogs(): bool
    {
        return $this->hasPermission('view_system_logs');
    }

    /**
     * Check if user can export data.
     */
    public function canExportData(): bool
    {
        return $this->hasPermission('export_data');
    }

    /**
     * Check if user can perform bulk operations.
     */
    public function canPerformBulkOperations(): bool
    {
        return $this->hasPermission('perform_bulk_operations');
    }

    /**
     * Cross-user / system-wide blocks on the main financial dashboard.
     */
    public function hasAggregatedMainDashboard(): bool
    {
        return $this->hasAnyPermission([
            'view_analytics',
            'view_all_user_data',
            'view_all_transactions',
            'admin_dashboard',
        ]);
    }

    /**
     * Whether any admin sidebar link should appear (admin/super_admin role + at least one admin-area permission).
     */
    public function canAccessAdministrationMenu(): bool
    {
        if (! $this->isAdmin()) {
            return false;
        }

        return $this->hasAnyPermission([
            'admin_dashboard',
            'manage_users',
            'manage_role_permissions',
            'view_analytics',
            'manage_transactions',
            'access_ledger',
            'manage_system_settings',
        ]);
    }

    /**
     * Whether any super-admin sidebar link should appear.
     */
    public function canAccessSuperAdministrationMenu(): bool
    {
        if (! $this->isSuperAdmin()) {
            return false;
        }

        return $this->hasAnyPermission([
            'super_admin_panel',
            'system_audit',
            'view_system_logs',
            'system_health',
            'database_management',
            'backup_restore',
        ]);
    }

    /**
     * First URL to send the user after login or when clicking the app logo.
     */
    public function firstAccessibleUrlPath(): string
    {
        if ($this->hasPermission('view_dashboard')) {
            return '/dashboard';
        }
        if ($this->hasPermission('manage_transactions')) {
            return '/transactions';
        }
        if ($this->hasPermission('access_ledger')) {
            return '/ledger';
        }
        if ($this->hasPermission('manage_categories')) {
            return '/categories';
        }

        if ($this->isAdmin()) {
            if ($this->hasPermission('admin_dashboard')) {
                return '/admin/dashboard';
            }
            if ($this->hasPermission('manage_users')) {
                return '/admin/users';
            }
            if ($this->hasPermission('manage_role_permissions')) {
                return '/admin/role-permission';
            }
            if ($this->hasPermission('view_analytics')) {
                return '/admin/analytics';
            }
            if ($this->hasPermission('manage_system_settings')) {
                return '/admin/system-settings';
            }
        }

        if ($this->isSuperAdmin()) {
            if ($this->hasPermission('super_admin_panel')) {
                return '/admin/super-admin';
            }
            if ($this->hasPermission('system_audit')) {
                return '/admin/super-admin/audit';
            }
            if ($this->hasPermission('view_system_logs')) {
                return '/admin/activity-logs';
            }
            if ($this->hasPermission('system_health')) {
                return '/admin/system-health';
            }
            if ($this->hasPermission('database_management')) {
                return '/admin/database';
            }
            if ($this->hasPermission('backup_restore')) {
                return '/admin/backup';
            }
        }

        return '/settings/profile';
    }

    /**
     * Check if user has any admin privileges.
     */
    public function hasAnyAdminPrivileges(): bool
    {
        return $this->canAccessAdministrationMenu()
            || $this->canAccessSuperAdministrationMenu()
            || $this->hasAnyPermission([
                'manage_users',
                'manage_admins',
                'view_analytics',
                'manage_transactions',
                'access_ledger',
                'view_all_user_data',
                'view_all_transactions',
            ]);
    }


}
