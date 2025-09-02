<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'target_type',
        'target_id',
        'description',
        'ip_address',
        'user_agent',
        'properties',
        'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the target model of the action.
     */
    public function target()
    {
        if ($this->target_type && $this->target_id) {
            return $this->target_type::find($this->target_id);
        }
        return null;
    }

    /**
     * Scope to filter by action type.
     */
    public function scopeOfAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to filter by target.
     */
    public function scopeForTarget($query, $targetType, $targetId = null)
    {
        $query->where('target_type', $targetType);
        if ($targetId) {
            $query->where('target_id', $targetId);
        }
        return $query;
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get a human-readable description of the action.
     */
    public function getActionDescriptionAttribute(): string
    {
        $descriptions = [
            'user_login' => 'User logged in',
            'user_logout' => 'User logged out',
            'user_created' => 'User account created',
            'user_updated' => 'User account updated',
            'user_deleted' => 'User account deleted',
            'role_changed' => 'User role changed',
            'permissions_updated' => 'User permissions updated',
            'password_reset_requested' => 'Password reset requested',
            'password_reset_completed' => 'Password reset completed',
            'admin_action' => 'Administrative action performed',
            'system_maintenance' => 'System maintenance performed',
            'social_login' => 'Social media login',
            'failed_login_attempt' => 'Failed login attempt',
            'account_locked' => 'Account locked due to failed attempts',
            'account_unlocked' => 'Account unlocked',
        ];

        return $descriptions[$this->action] ?? ucfirst(str_replace('_', ' ', $this->action));
    }

    /**
     * Get the severity level of the action.
     */
    public function getSeverityAttribute(): string
    {
        $severityLevels = [
            'user_login' => 'info',
            'user_logout' => 'info',
            'user_created' => 'success',
            'user_updated' => 'info',
            'user_deleted' => 'warning',
            'role_changed' => 'warning',
            'permissions_updated' => 'warning',
            'password_reset_requested' => 'info',
            'password_reset_completed' => 'success',
            'admin_action' => 'info',
            'system_maintenance' => 'info',
            'social_login' => 'info',
            'failed_login_attempt' => 'warning',
            'account_locked' => 'danger',
            'account_unlocked' => 'success',
        ];

        return $severityLevels[$this->action] ?? 'info';
    }

    /**
     * Check if the action requires immediate attention.
     */
    public function getRequiresAttentionAttribute(): bool
    {
        $attentionRequired = [
            'user_deleted',
            'account_locked',
            'failed_login_attempt',
            'system_maintenance',
        ];

        return in_array($this->action, $attentionRequired);
    }
}
