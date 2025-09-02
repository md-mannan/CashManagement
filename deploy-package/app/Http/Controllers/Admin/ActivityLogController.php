<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with(['user'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('action', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function ($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%')
                               ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $activityLogs = $query->paginate(20);

        // Get summary statistics
        $totalLogs = ActivityLog::count();
        $todayLogs = ActivityLog::whereDate('created_at', today())->count();
        $thisWeekLogs = ActivityLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $thisMonthLogs = ActivityLog::whereMonth('created_at', now()->month)->count();

        // Get top actions
        $topActions = ActivityLog::select('action', DB::raw('count(*) as count'))
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Get top users by activity
        $topUsers = ActivityLog::select('user_id', DB::raw('count(*) as count'))
            ->with('user:id,name,email')
            ->groupBy('user_id')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('admin/activity-logs', [
            'activityLogs' => $activityLogs,
            'filters' => $request->only(['user_id', 'action', 'start_date', 'end_date', 'search']),
            'statistics' => [
                'totalLogs' => $totalLogs,
                'todayLogs' => $todayLogs,
                'thisWeekLogs' => $thisWeekLogs,
                'thisMonthLogs' => $thisMonthLogs,
            ],
            'topActions' => $topActions,
            'topUsers' => $topUsers,
        ]);
    }

    public function show(ActivityLog $activityLog)
    {
        $activityLog->load('user');

        return Inertia::render('admin/activity-log-view', [
            'activityLog' => $activityLog,
        ]);
    }

    public function export(Request $request)
    {
        $query = ActivityLog::with(['user'])
            ->orderBy('created_at', 'desc');

        // Apply same filters as index
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $activityLogs = $query->get();

        // Generate CSV
        $filename = 'activity_logs_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($activityLogs) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, ['ID', 'User', 'Action', 'Description', 'Target Type', 'Target ID', 'IP Address', 'User Agent', 'Created At']);

            foreach ($activityLogs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->user ? $log->user->name . ' (' . $log->user->email . ')' : 'N/A',
                    $log->action,
                    $log->description,
                    $log->target_type,
                    $log->target_id,
                    $log->ip_address,
                    $log->user_agent,
                    $log->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function clear(Request $request)
    {
        $request->validate([
            'older_than_days' => 'required|integer|min:1|max:365',
        ]);

        $cutoffDate = now()->subDays($request->older_than_days);
        $deletedCount = ActivityLog::where('created_at', '<', $cutoffDate)->delete();

        // Log this action
        activity()
            ->performedOn(new ActivityLog())
            ->log('cleared_old_activity_logs')
            ->withProperties([
                'older_than_days' => $request->older_than_days,
                'deleted_count' => $deletedCount,
                'cutoff_date' => $cutoffDate->toDateString(),
            ]);

        return back()->with('success', "Successfully cleared {$deletedCount} old activity logs.");
    }
}
