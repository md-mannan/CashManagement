<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\ActivityLog;

class SuperAdminController extends Controller
{
    // Remove duplicate middleware since routes already handle it
    // public function __construct()
    // {
    //     $this->middleware('auth');
    //     $this->middleware(function ($request, $next) {
    //         if (!auth()->user()->isSuperAdmin()) {
    //             abort(403, 'Only super admins can access this area.');
    //         }
    //         return $next($request);
    //     });
    // }

    public function index()
    {
        $superAdmins = User::where('role', 'super_admin')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'permissions' => $user->effective_permissions,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at,
                    'last_login_at' => $user->last_login_at,
                    'is_current_user' => $user->id === auth()->id(),
                ];
            });

        $systemStats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_super_admins' => User::where('role', 'super_admin')->count(),
            'active_users' => User::where('is_active', true)->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'users_this_month' => User::whereMonth('created_at', now()->month)->count(),
            'users_last_month' => User::whereMonth('created_at', now()->subMonth()->month)->count(),
        ];

        return Inertia::render('admin/super-admin', [
            'superAdmins' => $superAdmins,
            'systemStats' => $systemStats,
        ]);
    }

    public function promoteToSuperAdmin(Request $request, User $user)
    {
        // Prevent self-promotion
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot promote yourself to super admin.');
        }

        // Check if user is already a super admin
        if ($user->isSuperAdmin()) {
            abort(400, 'User is already a super admin.');
        }

        $oldRole = $user->role;

        $user->update([
            'role' => 'super_admin',
            'permissions' => User::defaultPermissionsForRole('super_admin'),
        ]);

        // Log the action using ActivityLogService (with error handling)
        try {
            ActivityLogService::logRoleChanged($user, $oldRole, 'super_admin', $request);
        } catch (\Exception $e) {
            // Log error but don't fail the operation
            \Log::error('Failed to log role change', ['error' => $e->getMessage()]);
        }

        // Also log as admin action (with error handling)
        try {
            ActivityLogService::logAdminAction(
                'promote_to_super_admin',
                "User {$user->name} promoted to super admin",
                $request,
                [
                    'promoted_user_id' => $user->id,
                    'promoted_user_email' => $user->email,
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Failed to log admin action', ['error' => $e->getMessage()]);
        }

        // Notify admins about the promotion (with error handling)
        try {
            AdminNotificationService::notifyUserAccountAction(
                'promoted to super admin',
                $user->name,
                "Email: {$user->email}, Promoted by: " . auth()->user()->name,
                auth()->id()
            );
        } catch (\Exception $e) {
            \Log::error('Failed to notify admins', ['error' => $e->getMessage()]);
        }

        // Notify the promoted user (with error handling)
        try {
            AdminNotificationService::notifyUserAboutAdminAction(
                $user->id,
                'promoted to super admin',
                auth()->user()->name,
                "You now have access to all system features and administrative functions"
            );
        } catch (\Exception $e) {
            \Log::error('Failed to notify user', ['error' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'User promoted to super admin successfully.');
    }

    public function demoteFromSuperAdmin(Request $request, User $user)
    {
        $request->validate([
            'new_role' => ['required', Rule::in(['user', 'admin'])],
        ]);

        // Prevent self-demotion
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot demote yourself from super admin.');
        }

        // Check if user is actually a super admin
        if (!$user->isSuperAdmin()) {
            abort(400, 'User is not a super admin.');
        }

        $oldRole = $user->role;

        $user->update([
            'role' => $request->new_role,
            'permissions' => User::defaultPermissionsForRole($request->new_role),
        ]);

        // Log the action using ActivityLogService (with error handling)
        try {
            ActivityLogService::logRoleChanged($user, $oldRole, $request->new_role, $request);
        } catch (\Exception $e) {
            \Log::error('Failed to log role change', ['error' => $e->getMessage()]);
        }

        // Also log as admin action (with error handling)
        try {
            ActivityLogService::logAdminAction(
                'demote_from_super_admin',
                "User {$user->name} demoted from super admin to {$request->new_role}",
                $request,
                [
                    'demoted_user_id' => $user->id,
                    'demoted_user_email' => $user->email,
                    'new_role' => $request->new_role,
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Failed to log admin action', ['error' => $e->getMessage()]);
        }

        // Notify admins about the demotion (with error handling)
        try {
            AdminNotificationService::notifyUserAccountAction(
                'demoted from super admin',
                $user->name,
                "Email: {$user->email}, New role: {$request->new_role}, Demoted by: " . auth()->user()->name,
                auth()->id()
            );
        } catch (\Exception $e) {
            \Log::error('Failed to notify admins', ['error' => $e->getMessage()]);
        }

        // Notify the demoted user (with error handling)
        try {
            AdminNotificationService::notifyUserAboutAdminAction(
                $user->id,
                'demoted from super admin',
                auth()->user()->name,
                "Your role has been changed to {$request->new_role}. Some administrative features may no longer be available."
            );
        } catch (\Exception $e) {
            \Log::error('Failed to notify user', ['error' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'Super admin demoted successfully.');
    }

    public function systemAudit()
    {
        try {
            Log::info('SuperAdminController: Starting systemAudit method');

            // Get recent system activities using ActivityLogService (with error handling)
            $recentActivities = collect();
            try {
                $recentActivities = ActivityLogService::getSystemActivities(100)
                    ->map(function ($activity) {
                        return [
                            'id' => $activity->id,
                            'action' => $activity->action,
                            'user' => $activity->user ? $activity->user->name : 'System',
                            'target' => $activity->target_type ? class_basename($activity->target_type) : 'System',
                            'created_at' => $activity->created_at,
                            'ip_address' => $activity->ip_address,
                            'description' => $activity->description,
                            'severity' => $activity->severity,
                            'requires_attention' => $activity->requires_attention,
                        ];
                    });
            } catch (\Exception $e) {
                Log::error('Failed to get system activities', ['error' => $e->getMessage()]);
                $recentActivities = collect();
            }

            Log::info('SuperAdminController: Recent activities collected', ['count' => $recentActivities->count()]);

            // Get activities requiring attention (with error handling)
            $attentionActivities = collect();
            try {
                $attentionActivities = ActivityLogService::getActivitiesRequiringAttention(20);
            } catch (\Exception $e) {
                Log::error('Failed to get attention activities', ['error' => $e->getMessage()]);
                $attentionActivities = collect();
            }

            Log::info('SuperAdminController: Attention activities collected', ['count' => $attentionActivities->count()]);

            // Get system statistics
            $auditStats = [
                'total_activities' => \App\Models\ActivityLog::count(),
                'activities_today' => \App\Models\ActivityLog::whereDate('created_at', today())->count(),
                'activities_this_week' => \App\Models\ActivityLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'activities_this_month' => \App\Models\ActivityLog::whereMonth('created_at', now()->month)->count(),
                'attention_required' => $attentionActivities->count(),
            ];

            Log::info('SuperAdminController: Audit stats collected', ['stats' => $auditStats]);

            return Inertia::render('admin/system-audit', [
                'recentActivities' => $recentActivities,
                'attentionActivities' => $attentionActivities,
                'auditStats' => $auditStats,
            ]);
        } catch (\Exception $e) {
            Log::error('SuperAdminController: Error in systemAudit method', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return error response
            return Inertia::render('admin/system-audit', [
                'recentActivities' => collect([]),
                'attentionActivities' => collect([]),
                'auditStats' => [
                    'total_activities' => 0,
                    'activities_today' => 0,
                    'activities_this_week' => 0,
                    'activities_this_month' => 0,
                    'attention_required' => 0,
                ],
                'error' => 'Failed to load audit data: ' . $e->getMessage(),
            ]);
        }
    }

    public function systemHealth()
    {
        try {
            Log::info('SuperAdminController: Starting systemHealth method');

            // Get system health metrics
            $systemHealth = [
                'database' => $this->getDatabaseHealth(),
                'cache' => $this->getCacheHealth(),
                'storage' => $this->getStorageHealth(),
                'performance' => $this->getPerformanceMetrics(),
                'security' => $this->getSecurityStatus(),
            ];

            Log::info('SuperAdminController: System health data collected', ['data' => $systemHealth]);

            return Inertia::render('admin/system-health', [
                'systemHealth' => $systemHealth,
            ]);
        } catch (\Exception $e) {
            Log::error('SuperAdminController: Error in systemHealth method', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return error response
            return Inertia::render('admin/system-health', [
                'systemHealth' => null,
                'error' => 'Failed to load system health data: ' . $e->getMessage(),
            ]);
        }
    }

    public function viewActivityLog(ActivityLog $activityLog)
    {
        try {
            Log::info('SuperAdminController: Starting viewActivityLog method', ['activityLogId' => $activityLog->id]);

            // Load the user relationship
            $activityLog->load('user');

            Log::info('SuperAdminController: Activity log loaded successfully', ['data' => $activityLog->toArray()]);

            return Inertia::render('admin/activity-log-view', [
                'activityLog' => $activityLog,
            ]);
        } catch (\Exception $e) {
            Log::error('SuperAdminController: Error in viewActivityLog method', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return error response
            return Inertia::render('admin/activity-log-view', [
                'activityLog' => null,
                'error' => 'Failed to load activity log: ' . $e->getMessage(),
            ]);
        }
    }

    private function getDatabaseHealth()
    {
        try {
            $dbConnection = \DB::connection()->getPdo();
            $dbVersion = $dbConnection->getAttribute(\PDO::ATTR_SERVER_VERSION);

            // Check if we can perform basic operations
            $testQuery = \DB::select('SELECT 1 as test');

            return [
                'status' => 'healthy',
                'version' => $dbVersion,
                'connection' => 'active',
                'last_check' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'connection' => 'failed',
                'last_check' => now()->toISOString(),
            ];
        }
    }

    private function getCacheHealth()
    {
        try {
            $cache = \Cache::store();
            $testKey = 'health_check_' . time();
            $cache->put($testKey, 'test', 60);
            $testValue = $cache->get($testKey);
            $cache->forget($testKey);

            return [
                'status' => 'healthy',
                'driver' => config('cache.default'),
                'connection' => 'active',
                'last_check' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'driver' => config('cache.default'),
                'connection' => 'failed',
                'last_check' => now()->toISOString(),
            ];
        }
    }

    private function getStorageHealth()
    {
        try {
            $disk = \Storage::disk('local');
            $testFile = 'health_check_' . time() . '.txt';
            $disk->put($testFile, 'test');
            $exists = $disk->exists($testFile);
            $disk->delete($testFile);

            $totalSpace = disk_total_space(storage_path());
            $freeSpace = disk_free_space(storage_path());
            $usedSpace = $totalSpace - $freeSpace;
            $usagePercentage = ($usedSpace / $totalSpace) * 100;

            return [
                'status' => 'healthy',
                'total_space' => $this->formatBytes($totalSpace),
                'free_space' => $this->formatBytes($freeSpace),
                'used_space' => $this->formatBytes($usedSpace),
                'usage_percentage' => round($usagePercentage, 2),
                'last_check' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'last_check' => now()->toISOString(),
            ];
        }
    }

    private function getPerformanceMetrics()
    {
        return [
            'memory_usage' => $this->formatBytes(memory_get_usage(true)),
            'peak_memory' => $this->formatBytes(memory_get_peak_usage(true)),
            'execution_time' => round(microtime(true) - LARAVEL_START, 4) . 's',
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'last_check' => now()->toISOString(),
        ];
    }

    private function getSecurityStatus()
    {
        return [
            'app_debug' => config('app.debug'),
            'app_environment' => config('app.env'),
            'session_secure' => config('session.secure'),
            'session_http_only' => config('session.http_only'),
            'session_same_site' => config('session.same_site'),
            'last_check' => now()->toISOString(),
        ];
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
