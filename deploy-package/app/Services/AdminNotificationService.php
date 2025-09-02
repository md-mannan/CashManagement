<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Events\NotificationSent;
use Illuminate\Support\Facades\Log;

class AdminNotificationService
{
    /**
     * Notify all admins and super admins about user actions
     */
    public static function notifyAdmins(string $action, string $description, array $data = [], ?int $excludeUserId = null): void
    {
        try {
            // Get all admin and super admin users
            $query = User::whereIn('role', ['admin', 'super_admin'])
                ->where('is_active', true);
            
            // Exclude specific user if provided (to avoid duplicate notifications)
            if ($excludeUserId) {
                $query->where('id', '!=', $excludeUserId);
            }
            
            $admins = $query->get();

            foreach ($admins as $admin) {
                Notification::createForUser(
                    $admin->id,
                    $action,
                    'User Activity Alert',
                    $description,
                    [
                        'icon' => 'Activity',
                        'color' => 'blue',
                        'is_important' => false,
                        'data' => $data,
                    ]
                );
            }

            Log::info("Admin notifications sent for action: {$action}", [
                'action' => $action,
                'admin_count' => $admins->count(),
                'excluded_user_id' => $excludeUserId,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send admin notifications for action: {$action}", [
                'error' => $e->getMessage(),
                'action' => $action,
                'data' => $data,
            ]);
        }
    }

    /**
     * Notify admins about transaction operations
     */
    public static function notifyTransactionAction(string $action, string $userName, string $transactionType, float $amount, string $currency = 'USD', ?int $excludeUserId = null): void
    {
        $description = "User {$userName} {$action} a {$transactionType} transaction of {$currency} {$amount}";

        self::notifyAdmins(
            "transaction_{$action}",
            $description,
            [
                'action' => $action,
                'user_name' => $userName,
                'transaction_type' => $transactionType,
                'amount' => $amount,
                'currency' => $currency,
            ],
            $excludeUserId
        );
    }

    /**
     * Notify a specific user about their transaction changes
     */
    public static function notifyUserAboutTransactionAction(int $userId, string $action, string $transactionType, float $amount, string $currency = 'USD', string $adminName = null): void
    {
        try {
            $description = "Your {$transactionType} transaction of {$currency} {$amount} was {$action}";
            if ($adminName) {
                $description .= " by admin {$adminName}";
            }

            Notification::createForUser(
                $userId,
                "transaction_{$action}",
                'Transaction Update',
                $description,
                [
                    'icon' => 'DollarSign',
                    'color' => 'green',
                    'is_important' => true,
                    'data' => [
                        'action' => $action,
                        'transaction_type' => $transactionType,
                        'amount' => $amount,
                        'currency' => $currency,
                        'admin_name' => $adminName,
                        'timestamp' => now()->toISOString(),
                    ],
                ]
            );

            Log::info("User transaction notification sent: {$action}", [
                'user_id' => $userId,
                'action' => $action,
                'transaction_type' => $transactionType,
                'amount' => $amount,
                'currency' => $currency,
                'admin_name' => $adminName,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send user transaction notification: {$action}", [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'action' => $action,
                'transaction_type' => $transactionType,
                'amount' => $amount,
                'currency' => $currency,
                'admin_name' => $adminName,
            ]);
        }
    }

    /**
     * Notify admins about category operations
     */
    public static function notifyCategoryAction(string $action, string $userName, string $categoryName, string $categoryType, ?int $excludeUserId = null): void
    {
        $description = "User {$userName} {$action} a {$categoryType} category: {$categoryName}";

        self::notifyAdmins(
            "category_{$action}",
            $description,
            [
                'action' => $action,
                'user_name' => $userName,
                'category_name' => $categoryName,
                'category_type' => $categoryType,
            ],
            $excludeUserId
        );
    }

    /**
     * Notify a specific user about their category changes
     */
    public static function notifyUserAboutCategoryAction(int $userId, string $action, string $categoryName, string $categoryType, string $adminName = null): void
    {
        try {
            $description = "Your {$categoryType} category '{$categoryName}' was {$action}";
            if ($adminName) {
                $description .= " by admin {$adminName}";
            }

            Notification::createForUser(
                $userId,
                "category_{$action}",
                'Category Update',
                $description,
                [
                    'icon' => 'Folder',
                    'color' => 'blue',
                    'is_important' => false,
                    'data' => [
                        'action' => $action,
                        'category_name' => $categoryName,
                        'category_type' => $categoryType,
                        'admin_name' => $adminName,
                        'timestamp' => now()->toISOString(),
                    ],
                ]
            );

            Log::info("User category notification sent: {$action}", [
                'user_id' => $userId,
                'action' => $action,
                'category_name' => $categoryName,
                'category_type' => $categoryType,
                'admin_name' => $adminName,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send user category notification: {$action}", [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'action' => $action,
                'category_name' => $categoryName,
                'category_type' => $categoryType,
                'admin_name' => $adminName,
            ]);
        }
    }

    /**
     * Notify admins about user account operations
     */
    public static function notifyUserAccountAction(string $action, string $userName, string $details = '', ?int $excludeUserId = null): void
    {
        $description = "User {$userName} {$action}";
        if ($details) {
            $description .= ": {$details}";
        }

        self::notifyAdmins(
            "user_account_{$action}",
            $description,
            [
                'action' => $action,
                'user_name' => $userName,
                'details' => $details,
            ],
            $excludeUserId
        );
    }

    /**
     * Notify a specific user when their data is changed by an admin
     */
    public static function notifyUserAboutAdminAction(int $userId, string $action, string $adminName, string $details = ''): void
    {
        try {
            $description = "Admin {$adminName} {$action} your account";
            if ($details) {
                $description .= ": {$details}";
            }

            Notification::createForUser(
                $userId,
                "admin_action_{$action}",
                'Account Update Notification',
                $description,
                [
                    'icon' => 'Shield',
                    'color' => 'blue',
                    'is_important' => true,
                    'data' => [
                        'action' => $action,
                        'admin_name' => $adminName,
                        'details' => $details,
                        'timestamp' => now()->toISOString(),
                    ],
                ]
            );

            Log::info("User notification sent for admin action: {$action}", [
                'user_id' => $userId,
                'action' => $action,
                'admin_name' => $adminName,
                'details' => $details,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send user notification for admin action: {$action}", [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'action' => $action,
                'admin_name' => $adminName,
                'details' => $details,
            ]);
        }
    }

    /**
     * Notify admins about login/logout activities
     */
    public static function notifyUserActivity(string $action, string $userName, string $ipAddress = null): void
    {
        $description = "User {$userName} {$action}";
        if ($ipAddress) {
            $description .= " from IP: {$ipAddress}";
        }

        self::notifyAdmins(
            "user_activity_{$action}",
            $description,
            [
                'action' => $action,
                'user_name' => $userName,
                'ip_address' => $ipAddress,
            ]
        );
    }
}
