<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/user-management', [
            'users' => $users,
            'roles' => ['user', 'admin', 'super_admin'],
            'permissions' => [
                'manage_users' => 'Manage Users',
                'manage_admins' => 'Manage Admins',
                'view_analytics' => 'View Analytics',
                'manage_transactions' => 'Manage Transactions',
                'manage_categories' => 'Manage Categories',
                'manage_settings' => 'Manage Settings',
            ],
        ]);
    }

    public function show(User $user)
    {
        $user->load(['transactions' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return Inertia::render('admin/user-profile', [
            'user' => $user,
            'roles' => ['user', 'admin', 'super_admin'],
            'permissions' => [
                'manage_users' => 'Manage Users',
                'manage_admins' => 'Manage Admins',
                'view_analytics' => 'View Analytics',
                'manage_transactions' => 'Manage Transactions',
                'manage_categories' => 'Manage Categories',
                'manage_settings' => 'Manage Settings',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['user', 'admin', 'super_admin'])],
            'permissions' => 'array',
            'is_active' => 'boolean',
        ]);

        // Check if current user can create users with this role
        if ($request->role === 'super_admin' && !auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can create super admin users.');
        }

        if ($request->role === 'admin' && !auth()->user()->canManageAdmins()) {
            abort(403, 'You do not have permission to create admin users.');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'permissions' => $request->permissions ?? [],
            'is_active' => $request->is_active ?? true,
        ]);

        // Notifications removed

        // Notify admins about user creation (with error handling)
        try {
            AdminNotificationService::notifyUserAccountAction(
                'created',
                $user->name,
                "Role: {$request->role}, Email: {$user->email}",
                auth()->id()
            );
        } catch (\Exception $e) {
            \Log::error('Failed to notify admins about user creation', ['error' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['user', 'admin', 'super_admin'])],
            'permissions' => 'array',
            'is_active' => 'boolean',
        ]);

        // Prevent users from changing their own role to lower level
        if ($user->id === auth()->id() && $request->role !== $user->role) {
            abort(403, 'You cannot change your own role.');
        }

        // Check permissions for role changes
        if ($request->role === 'super_admin' && !auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can promote users to super admin.');
        }

        if ($request->role === 'admin' && !auth()->user()->canManageAdmins()) {
            abort(403, 'You do not have permission to promote users to admin.');
        }

        // Store the old role to check if it changed
        $oldRole = $user->role;

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'permissions' => $request->permissions ?? [],
            'is_active' => $request->is_active ?? true,
        ]);

        // Role changed
        if ($oldRole !== $request->role) {
            // Notifications removed
            // Notify admins about role change (excluding current admin to avoid duplicates)
            AdminNotificationService::notifyUserAccountAction(
                'changed role',
                $user->name,
                "From {$oldRole} to {$request->role}",
                auth()->id()
            );
        } else {
            // Only notify about general update if role didn't change (excluding current admin)
            AdminNotificationService::notifyUserAccountAction(
                'updated',
                $user->name,
                "Email: {$user->email}, Role: {$user->role}",
                auth()->id()
            );
        }

        return redirect()->back()->with('success', 'User updated successfully.');
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

    public function destroy(User $user)
    {
        // Prevent users from deleting themselves
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot delete your own account.');
        }

        // Check permissions for deletion
        if ($user->role === 'super_admin' && !auth()->user()->isSuperAdmin()) {
            abort(403, 'Only super admins can delete super admin users.');
        }

        if ($user->role === 'admin' && !auth()->user()->canManageAdmins()) {
            abort(403, 'You do not have permission to delete admin users.');
        }

        $user->delete();

        // Notify admins about user deletion (with error handling)
        try {
            AdminNotificationService::notifyUserAccountAction(
                'deleted',
                $user->name,
                "Email: {$user->email}, Role: {$user->role}",
                auth()->id()
            );
        } catch (\Exception $e) {
            \Log::error('Failed to notify admins about user deletion', ['error' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    public function toggleStatus(User $user)
    {
        // Prevent users from deactivating themselves
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot deactivate your own account.');
        }

        $oldStatus = $user->is_active;
        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        // Send notification about status change
        $statusMessage = $user->is_active
            ? "Your account has been activated. You can now access the system."
            : "Your account has been deactivated. Please contact an administrator for assistance.";

        // Notifications removed

        // Notify admins about status change (excluding current admin to avoid duplicates)
        AdminNotificationService::notifyUserAccountAction(
            $status,
            $user->name,
            "Email: {$user->email}, Role: {$user->role}",
            auth()->id()
        );

        return redirect()->back()->with('success', "User {$status} successfully.");
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
            'force_password_change' => true,
        ]);

        // Notifications removed

        // Notify admins about password reset (excluding current admin to avoid duplicates)
        AdminNotificationService::notifyUserAccountAction(
            'reset password for',
            $user->name,
            "Email: {$user->email}, Role: {$user->role}",
            auth()->id()
        );

        return redirect()->back()->with('success', 'User password reset successfully.');
    }
}
