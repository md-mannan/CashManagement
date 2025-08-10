<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
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
        'enable_social_login',
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
     * Get the notifications for the user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get unread notifications count.
     */
    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->unread()->count();
    }

    /**
     * Get the social accounts for the user.
     */
    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
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
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return in_array($permission, $this->permissions ?? []);
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
        return $this->hasPermission('manage_users') || $this->isSuperAdmin();
    }

    /**
     * Check if user can manage admins.
     */
    public function canManageAdmins(): bool
    {
        return $this->isSuperAdmin() ||
               ($this->isAdmin() && in_array('manage_admins', $this->permissions ?? []));
    }

    /**
     * Check if user can view analytics.
     */
    public function canViewAnalytics(): bool
    {
        return $this->hasPermission('view_analytics') || $this->isAdmin();
    }

    /**
     * Check if user can view all transactions (including other users).
     */
    public function canViewAllTransactions(): bool
    {
        return $this->hasPermission('view_all_transactions') || $this->isAdmin();
    }

    /**
     * Check if user can view all user data.
     */
    public function canViewAllUserData(): bool
    {
        return $this->hasPermission('view_all_user_data') || $this->isAdmin();
    }

    /**
     * Check if user can access ledger.
     */
    public function canAccessLedger(): bool
    {
        return $this->hasPermission('access_ledger') || $this->isAdmin();
    }

    /**
     * Check if user can manage transactions.
     */
    public function canManageTransactions(): bool
    {
        return $this->hasPermission('manage_transactions') || $this->isAdmin();
    }

    /**
     * Check if user can manage categories.
     */
    public function canManageCategories(): bool
    {
        return $this->hasPermission('manage_categories') || $this->isAdmin();
    }

    /**
     * Check if user can manage system settings.
     */
    public function canManageSystemSettings(): bool
    {
        return $this->hasPermission('manage_system_settings') || $this->isAdmin();
    }

    /**
     * Check if user can view system logs.
     */
    public function canViewSystemLogs(): bool
    {
        return $this->hasPermission('view_system_logs') || $this->isAdmin();
    }

    /**
     * Check if user can export data.
     */
    public function canExportData(): bool
    {
        return $this->hasPermission('export_data') || $this->isAdmin();
    }

    /**
     * Check if user can perform bulk operations.
     */
    public function canPerformBulkOperations(): bool
    {
        return $this->hasPermission('perform_bulk_operations') || $this->isAdmin();
    }

    /**
     * Check if user has any admin privileges.
     */
    public function hasAnyAdminPrivileges(): bool
    {
        return $this->isAdmin() || $this->hasAnyPermission([
            'manage_users',
            'view_analytics',
            'manage_transactions',
            'access_ledger',
            'view_all_user_data'
        ]);
    }


}
