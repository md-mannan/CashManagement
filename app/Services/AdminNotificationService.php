<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class AdminNotificationService
{
    /**
     * Notifications feature removed.
     *
     * This service is kept as a no-op to avoid breaking existing call sites.
     */

    /**
     * Notify all admins and super admins about user actions
     */
    public static function notifyAdmins(string $action, string $description, array $data = [], ?int $excludeUserId = null): void
    {
        // no-op
        Log::debug('Notifications disabled: notifyAdmins skipped', [
            'action' => $action,
            'excluded_user_id' => $excludeUserId,
        ]);
    }

    /**
     * Notify admins about transaction operations
     */
    public static function notifyTransactionAction(string $action, string $userName, string $transactionType, float $amount, string $currency = 'USD', ?int $excludeUserId = null): void
    {
        // no-op
        Log::debug('Notifications disabled: notifyTransactionAction skipped', [
            'action' => $action,
            'user_name' => $userName,
            'transaction_type' => $transactionType,
            'amount' => $amount,
            'currency' => $currency,
            'excluded_user_id' => $excludeUserId,
        ]);
    }

    /**
     * Notify a specific user about their transaction changes
     */
    public static function notifyUserAboutTransactionAction(int $userId, string $action, string $transactionType, float $amount, string $currency = 'USD', string $adminName = null): void
    {
        // no-op
        Log::debug('Notifications disabled: notifyUserAboutTransactionAction skipped', [
            'user_id' => $userId,
            'action' => $action,
            'transaction_type' => $transactionType,
            'amount' => $amount,
            'currency' => $currency,
            'admin_name' => $adminName,
        ]);
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
        // no-op
        Log::debug('Notifications disabled: notifyUserAboutCategoryAction skipped', [
            'user_id' => $userId,
            'action' => $action,
            'category_name' => $categoryName,
            'category_type' => $categoryType,
            'admin_name' => $adminName,
        ]);
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
        // no-op
        Log::debug('Notifications disabled: notifyUserAboutAdminAction skipped', [
            'user_id' => $userId,
            'action' => $action,
            'admin_name' => $adminName,
            'details' => $details,
        ]);
    }

    /**
     * Notify admins about login/logout activities
     */
    public static function notifyUserActivity(string $action, string $userName, string $ipAddress = null): void
    {
        // no-op
        Log::debug('Notifications disabled: notifyUserActivity skipped', [
            'action' => $action,
            'user_name' => $userName,
            'ip_address' => $ipAddress,
        ]);
    }
}
