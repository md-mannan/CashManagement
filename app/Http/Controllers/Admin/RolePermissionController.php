<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    // Remove duplicate middleware since routes already handle it
    // public function __construct()
    // {
    //     $this->middleware('auth');
    //     $this->middleware(function ($request, $next) {
    //         if (!auth()->user()->canManageAdmins()) {
    //             abort(403, 'You do not have permission to manage admins.');
    //         }
    //         return $next($request);
    //     });
    // }

    public function index()
    {
        $roles = [
            'super_admin' => [
                'name' => 'Super Admin',
                'description' => 'Full system access with ability to manage other super admins',
                'permissions' => User::defaultPermissionsForRole('super_admin'),
                'user_count' => User::where('role', 'super_admin')->count(),
            ],
            'admin' => [
                'name' => 'Admin',
                'description' => 'Administrative access with user and system management',
                'permissions' => User::defaultPermissionsForRole('admin'),
                'user_count' => User::where('role', 'admin')->count(),
            ],
            'user' => [
                'name' => 'User',
                'description' => 'Standard user with basic transaction management',
                'permissions' => User::defaultPermissionsForRole('user'),
                'user_count' => User::where('role', 'user')->count(),
            ],
        ];

        $availablePermissions = config('module_permissions.modules', []);

        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'permissions' => $user->effective_permissions,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at,
                    'last_login_at' => $user->last_login_at,
                    'is_current_user' => $user->id === auth()->id(),
                ];
            });

        return Inertia::render('admin/role-permission', [
            'roles' => $roles,
            'availablePermissions' => $availablePermissions,
            'users' => $users,
        ]);
    }

    public function updateUserRole(Request $request, User $user)
    {
        $request->validate([
            'role' => ['required', 'in:user,admin,super_admin'],
        ]);

        // Prevent self-modification
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot modify your own role.');
        }

        // Check if current user can manage the target role
        if ($request->role === 'super_admin' && !auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can promote users to super admin.');
        }

        $oldRole = $user->role;

        $user->update([
            'role' => $request->role,
            'permissions' => User::defaultPermissionsForRole($request->role),
        ]);

        // Notifications removed

        // Notify admins about the role change (excluding current admin to avoid duplicates)
        AdminNotificationService::notifyUserAccountAction(
            'changed role for',
            $user->name,
            "From {$oldRole} to {$request->role}, Email: {$user->email}",
            auth()->id()
        );

        // Log the action using ActivityLogService
        ActivityLogService::logRoleChanged($user, $oldRole, $request->role, $request);

        // Also log as admin action
        ActivityLogService::logAdminAction(
            'update_user_role',
            "User {$user->name} role changed from {$oldRole} to {$request->role}",
            $request,
            [
                'updated_user_id' => $user->id,
                'updated_user_email' => $user->email,
                'old_role' => $oldRole,
                'new_role' => $request->role,
            ]
        );

        return redirect()->back()->with('success', 'User role updated successfully.');
    }

    public function bulkUpdateRoles(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'role' => 'required|in:user,admin,super_admin',
        ]);

        // Check if current user can manage the target role
        if ($request->role === 'super_admin' && !auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can promote users to super admin.');
        }

        $users = User::whereIn('id', $request->user_ids)->get();
        $updatedCount = 0;

        foreach ($users as $user) {
            // Skip self-modification
            if ($user->id === auth()->id()) {
                continue;
            }

            $oldRole = $user->role;

            $user->update([
                'role' => $request->role,
                'permissions' => User::defaultPermissionsForRole($request->role),
            ]);

            // Notifications removed



            // Log each individual role change
            ActivityLogService::logRoleChanged($user, $oldRole, $request->role, $request);
            $updatedCount++;
        }

        // Notify admins about the bulk role update (excluding current admin to avoid duplicates)
        AdminNotificationService::notifyAdmins(
            'bulk_role_update',
            "Bulk role update: {$updatedCount} users updated to {$request->role} role by " . auth()->user()->name,
            [
                'updated_count' => $updatedCount,
                'new_role' => $request->role,
                'user_ids' => $request->user_ids,
                'admin_name' => auth()->user()->name,
            ],
            auth()->id()
        );

        // Log the bulk action
        ActivityLogService::logAdminAction(
            'bulk_update_roles',
            "Bulk role update: {$updatedCount} users updated to {$request->role}",
            $request,
            [
                'updated_count' => $updatedCount,
                'new_role' => $request->role,
                'user_ids' => $request->user_ids,
            ]
        );

        return redirect()->back()->with('success', "Successfully updated {$updatedCount} users to {$request->role} role.");
    }

    public function exportUsers()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'ID' => $user->id,
                    'Name' => $user->name,
                    'Email' => $user->email,
                    'Role' => $user->role,
                    'Status' => $user->is_active ? 'Active' : 'Inactive',
                    'Created' => $user->created_at->format('Y-m-d H:i:s'),
                    'Last Login' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Never',
                    'Social Accounts' => '',
                    'Permissions' => implode(', ', $user->effective_permissions),
                ];
            });

        $filename = 'users_export_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($users) {
            $file = fopen('php://output', 'w');

            // Add headers
            if ($users->count() > 0) {
                fputcsv($file, array_keys($users->first()));
            }

            // Add data
            foreach ($users as $user) {
                fputcsv($file, $user);
            }

            fclose($file);
        };

        // Log the export action
        ActivityLogService::logAdminAction(
            'export_users',
            'User data exported to CSV',
            request(),
            [
                'export_count' => $users->count(),
                'filename' => $filename,
            ]
        );

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Get a user-friendly message for role changes
     */
    private function getRoleChangeMessage(string $oldRole, string $newRole): string
    {
        $roleNames = [
            'user' => 'Regular User',
            'admin' => 'Administrator',
            'super_admin' => 'Super Administrator'
        ];

        $oldRoleName = $roleNames[$oldRole] ?? $oldRole;
        $newRoleName = $roleNames[$newRole] ?? $newRole;

        if ($newRole === 'super_admin') {
            return "Congratulations! Your role has been elevated to {$newRoleName}. You now have access to all system features and administrative functions.";
        } elseif ($newRole === 'admin') {
            return "Your role has been updated to {$newRoleName}. You now have access to administrative functions and user management.";
        } elseif ($newRole === 'user') {
            return "Your role has been changed to {$newRoleName}. Some administrative features may no longer be available.";
        }

        return "Your role has been changed from {$oldRoleName} to {$newRoleName}.";
    }
}
