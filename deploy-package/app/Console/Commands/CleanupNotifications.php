<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CleanupNotifications extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'notifications:cleanup 
                            {--days=7 : Mark transaction notifications older than X days as read}
                            {--delete-old=30 : Delete notifications older than X days}';

    /**
     * The console command description.
     */
    protected $description = 'Clean up old notifications to reduce clutter';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $deleteOld = (int) $this->option('delete-old');

        $this->info("Cleaning up notifications...");

        // Mark old transaction notifications as read
        $readCount = Notification::whereNull('read_at')
            ->where('type', 'success')
            ->where('title', 'like', '%Transaction%')
            ->where('created_at', '<', Carbon::now()->subDays($days))
            ->update(['read_at' => now()]);

        $this->info("Marked {$readCount} old transaction notifications as read.");

        // Delete very old notifications
        $deleteCount = Notification::where('created_at', '<', Carbon::now()->subDays($deleteOld))
            ->delete();

        $this->info("Deleted {$deleteCount} notifications older than {$deleteOld} days.");

        // Show current stats
        $totalCount = Notification::count();
        $unreadCount = Notification::whereNull('read_at')->count();

        $this->info("Current notification stats:");
        $this->info("- Total notifications: {$totalCount}");
        $this->info("- Unread notifications: {$unreadCount}");

        return 0;
    }
}