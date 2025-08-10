<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AdminNotificationService
{
    /**
     * Notify all admins and super admins about user actions
     */
    public static function notifyAdmins(string $action, string $description, array $data = []): void
    {
        try {
            // Get all admin and super admin users
            $admins = User::whereIn('role', ['admin', 'super_admin'])
                ->where('is_active', true)
                ->get();

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
    public static function notifyTransactionAction(string $action, string $userName, string $transactionType, float $amount, string $currency = 'USD'): void
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
            ]
        );
    }

    /**
     * Notify admins about category operations
     */
    public static function notifyCategoryAction(string $action, string $userName, string $categoryName, string $categoryType): void
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
            ]
        );
    }

    /**
     * Notify admins about user account operations
     */
    public static function notifyUserAccountAction(string $action, string $userName, string $details = ''): void
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
            ]
        );
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
