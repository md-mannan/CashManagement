<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of all notifications for admins
     */
    public function index(Request $request)
    {
        $query = Notification::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by user if specified
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by type if specified
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filter by read status if specified
        if ($request->has('read_status') && $request->read_status !== '') {
            if ($request->read_status === 'unread') {
                $query->unread();
            } elseif ($request->read_status === 'read') {
                $query->read();
            }
        }

        // Filter by importance if specified
        if ($request->has('important') && $request->important !== '') {
            $query->where('is_important', $request->boolean('important'));
        }

        $notifications = $query->paginate(20);

        // Get filter options
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();
        $types = Notification::distinct()->pluck('type')->filter()->values();
        $readStatuses = ['all', 'read', 'unread'];

        return Inertia::render('admin/notifications', [
            'notifications' => $notifications,
            'filters' => [
                'users' => $users,
                'types' => $types,
                'readStatuses' => $readStatuses,
            ],
            'stats' => [
                'total' => Notification::count(),
                'unread' => Notification::unread()->count(),
                'important' => Notification::important()->count(),
                'today' => Notification::whereDate('created_at', today())->count(),
            ],
        ]);
    }

    /**
     * Display the specified notification
     */
    public function show(Notification $notification)
    {
        $notification->load('user');

        return Inertia::render('admin/notification-detail', [
            'notification' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        Notification::unread()->update(['read_at' => now()]);

        return redirect()->back()->with('success', 'All notifications marked as read');
    }

    /**
     * Remove the specified notification
     */
    public function destroy(Notification $notification)
    {
        $notification->delete();

        return redirect()->back()->with('success', 'Notification deleted successfully');
    }
}
