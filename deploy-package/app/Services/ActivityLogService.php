<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    /**
     * Log a user action.
     */
    public static function log(
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?string $description = null,
        ?array $properties = null,
        ?Request $request = null
    ): ActivityLog {
        $request = $request ?? request();

        return ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'description' => $description,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'properties' => $properties,
        ]);
    }

    /**
     * Log a user login.
     */
    public static function logLogin(User $user, Request $request): ActivityLog
    {
        return self::log(
            'user_login',
            User::class,
            $user->id,
            "User {$user->name} logged in successfully",
            [
                'email' => $user->email,
                'role' => $user->role,
                'login_method' => 'email', // or 'social'
            ],
            $request
        );
    }

    /**
     * Log a user logout.
     */
    public static function logLogout(User $user, Request $request): ActivityLog
    {
        return self::log(
            'user_logout',
            User::class,
            $user->id,
            "User {$user->name} logged out",
            [
                'email' => $user->email,
                'role' => $user->role,
            ],
            $request
        );
    }

    /**
     * Log a social media login.
     */
    public static function logSocialLogin(User $user, string $provider, Request $request): ActivityLog
    {
        return self::log(
            'social_login',
            User::class,
            $user->id,
            "User {$user->name} logged in via {$provider}",
            [
                'email' => $user->email,
                'role' => $user->role,
                'provider' => $provider,
            ],
            $request
        );
    }

    /**
     * Log a failed login attempt.
     */
    public static function logFailedLogin(string $email, Request $request, ?string $reason = null): ActivityLog
    {
        return self::log(
            'failed_login_attempt',
            null,
            null,
            "Failed login attempt for email: {$email}",
            [
                'email' => $email,
                'reason' => $reason,
                'ip_address' => $request->ip(),
            ],
            $request
        );
    }

    /**
     * Log a password reset request.
     */
    public static function logPasswordResetRequest(User $user, Request $request): ActivityLog
    {
        return self::log(
            'password_reset_requested',
            User::class,
            $user->id,
            "Password reset requested for user {$user->name}",
            [
                'email' => $user->email,
            ],
            $request
        );
    }

    /**
     * Log a password reset completion.
     */
    public static function logPasswordResetCompleted(User $user, Request $request): ActivityLog
    {
        return self::log(
            'password_reset_completed',
            User::class,
            $user->id,
            "Password reset completed for user {$user->name}",
            [
                'email' => $user->email,
            ],
            $request
        );
    }

    /**
     * Log a user creation.
     */
    public static function logUserCreated(User $user, Request $request): ActivityLog
    {
        return self::log(
            'user_created',
            User::class,
            $user->id,
            "User {$user->name} account created",
            [
                'email' => $user->email,
                'role' => $user->role,
                'created_by' => Auth::id(),
            ],
            $request
        );
    }

    /**
     * Log a user update.
     */
    public static function logUserUpdated(User $user, array $changes, Request $request): ActivityLog
    {
        return self::log(
            'user_updated',
            User::class,
            $user->id,
            "User {$user->name} account updated",
            [
                'email' => $user->email,
                'changes' => $changes,
                'updated_by' => Auth::id(),
            ],
            $request
        );
    }

    /**
     * Log a role change.
     */
    public static function logRoleChanged(User $user, string $oldRole, string $newRole, Request $request): ActivityLog
    {
        return self::log(
            'role_changed',
            User::class,
            $user->id,
            "User {$user->name} role changed from {$oldRole} to {$newRole}",
            [
                'email' => $user->email,
                'old_role' => $oldRole,
                'new_role' => $newRole,
                'changed_by' => Auth::id(),
            ],
            $request
        );
    }

    /**
     * Log a permissions update.
     */
    public static function logPermissionsUpdated(User $user, array $oldPermissions, array $newPermissions, Request $request): ActivityLog
    {
        return self::log(
            'permissions_updated',
            User::class,
            $user->id,
            "User {$user->name} permissions updated",
            [
                'email' => $user->email,
                'old_permissions' => $oldPermissions,
                'new_permissions' => $newPermissions,
                'updated_by' => Auth::id(),
            ],
            $request
        );
    }

    /**
     * Log an admin action.
     */
    public static function logAdminAction(string $action, string $description, Request $request, ?array $properties = null): ActivityLog
    {
        return self::log(
            'admin_action',
            null,
            null,
            $description,
            array_merge($properties ?? [], [
                'admin_user_id' => Auth::id(),
                'admin_user_name' => Auth::user()->name,
            ]),
            $request
        );
    }

    /**
     * Log system maintenance.
     */
    public static function logSystemMaintenance(string $description, Request $request, ?array $properties = null): ActivityLog
    {
        return self::log(
            'system_maintenance',
            null,
            null,
            $description,
            $properties,
            $request
        );
    }

    /**
     * Get recent activities for a specific user.
     */
    public static function getUserActivities(int $userId, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::forUser($userId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent system activities.
     */
    public static function getSystemActivities(int $limit = 100): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get activities by action type.
     */
    public static function getActivitiesByAction(string $action, int $limit = 100): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::ofAction($action)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get activities that require attention.
     */
    public static function getActivitiesRequiringAttention(int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::with('user')
            ->whereIn('action', [
                'user_deleted',
                'account_locked',
                'failed_login_attempt',
                'system_maintenance',
            ])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Clean up old activity logs.
     */
    public static function cleanupOldLogs(int $daysToKeep = 90): int
    {
        $cutoffDate = now()->subDays($daysToKeep);

        return ActivityLog::where('created_at', '<', $cutoffDate)->delete();
    }
}
