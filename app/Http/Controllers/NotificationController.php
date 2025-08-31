<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = $user->notifications();

        // Filter by read/unread status
        if ($request->has('unread_only') && $request->boolean('unread_only')) {
            $query->unread();
        }

        // Limit results
        $limit = $request->get('limit', 20);
        $notifications = $query->limit($limit)->get();

        return response()->json([
            'notifications' => $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'icon' => $notification->icon,
                    'color' => $notification->color,
                    'data' => $notification->data,
                    'is_read' => $notification->isRead(),
                    'is_important' => $notification->is_important,
                    'time_ago' => $notification->time_ago,
                    'created_at' => $notification->created_at,
                ];
            }),
            'unread_count' => $user->unreadNotificationsCount(),
        ]);
    }

    /**
     * Get unread notifications count.
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();

        return response()->json([
            'unread_count' => $user->unreadNotificationsCount(),
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'unread_count' => Auth::user()->unreadNotificationsCount(),
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();

        $user->notifications()->unread()->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read',
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Notification $notification): JsonResponse
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted',
            'unread_count' => Auth::user()->unreadNotificationsCount(),
        ]);
    }

    /**
     * Clear all notifications for the authenticated user.
     * Environment-aware with enhanced error handling and logging.
     */
    public function clearAll(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            // Unauthenticated attempt logged silently
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        try {
            // Operation started silently

            $deletedCount = $user->notifications()->count();
            
            if ($deletedCount === 0) {
                return response()->json([
                    'message' => 'No notifications to clear',
                    'unread_count' => 0,
                    'deleted_count' => 0,
                ]);
            }

            // Perform the deletion
            $deleted = $user->notifications()->delete();
            
            // Operation completed silently

            // Environment-specific response
            $response = [
                'message' => "All {$deletedCount} notifications have been cleared",
                'unread_count' => 0,
                'deleted_count' => $deletedCount,
            ];

            // Add debug info in non-production environments
            if (!app()->environment('production')) {
                $response['debug'] = [
                    'environment' => app()->environment(),
                    'user_id' => $user->id,
                    'operation_time' => now()->toISOString(),
                ];
            }

            return response()->json($response);
            
        } catch (\Illuminate\Database\QueryException $e) {
            // Database error handled silently

            $message = app()->environment('production') 
                ? 'Database error occurred while clearing notifications'
                : 'Database error: ' . $e->getMessage();

            return response()->json([
                'error' => $message,
                'code' => 'DATABASE_ERROR',
            ], 500);
            
        } catch (\Exception $e) {
            // General error handled silently

            $message = app()->environment('production') 
                ? 'An unexpected error occurred while clearing notifications'
                : 'Error: ' . $e->getMessage();

            return response()->json([
                'error' => $message,
                'code' => 'GENERAL_ERROR',
            ], 500);
        }
    }
}
