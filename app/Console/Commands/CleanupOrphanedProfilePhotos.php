<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProfilePhoto;
use Illuminate\Support\Facades\Storage;

class CleanupOrphanedProfilePhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'profile-photos:cleanup {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up orphaned profile photo records that reference non-existent files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        if ($isDryRun) {
            $this->info('DRY RUN MODE - No changes will be made');
        }

        $this->info('Scanning for orphaned profile photo records...');

        $orphanedPhotos = [];
        $totalPhotos = ProfilePhoto::count();
        $processed = 0;

        $bar = $this->output->createProgressBar($totalPhotos);
        $bar->start();

        ProfilePhoto::chunk(100, function ($photos) use (&$orphanedPhotos, &$processed, $bar) {
            foreach ($photos as $photo) {
                $processed++;
                
                // Check if the file exists in storage
                if (!Storage::disk('public')->exists($photo->file_path)) {
                    $orphanedPhotos[] = $photo;
                }
                
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine(2);

        if (empty($orphanedPhotos)) {
            $this->info('✅ No orphaned profile photo records found!');
            return 0;
        }

        $this->warn("Found " . count($orphanedPhotos) . " orphaned profile photo records:");
        $this->newLine();

        $table = [];
        foreach ($orphanedPhotos as $photo) {
            $table[] = [
                $photo->id,
                $photo->user->email ?? 'Unknown User',
                $photo->file_path,
                $photo->file_name,
                $photo->is_current ? 'Yes' : 'No',
                $photo->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $this->table([
            'ID',
            'User Email',
            'File Path',
            'File Name',
            'Is Current',
            'Created At'
        ], $table);

        if ($isDryRun) {
            $this->info('This was a dry run. Run without --dry-run to actually delete these records.');
            return 0;
        }

        if (!$this->confirm('Do you want to delete these orphaned records?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $deletedCount = 0;
        $bar = $this->output->createProgressBar(count($orphanedPhotos));
        $bar->start();

        foreach ($orphanedPhotos as $photo) {
            try {
                // If this was the current photo, we need to handle it specially
                if ($photo->is_current) {
                    $user = $photo->user;
                    
                    // Mark all other photos as not current first
                    $user->profilePhotos()->where('id', '!=', $photo->id)->update(['is_current' => false]);
                    
                    // Set the most recent photo as current, or clear user's profile photo if no other photos exist
                    $nextPhoto = $user->profilePhotos()->where('id', '!=', $photo->id)->orderBy('created_at', 'desc')->first();
                    
                    if ($nextPhoto) {
                        $nextPhoto->update(['is_current' => true]);
                        $user->update(['profile_photo' => $nextPhoto->file_path]);
                    } else {
                        // No other photos exist, clear the user's profile photo
                        $user->update(['profile_photo' => null]);
                    }
                }

                $photo->delete();
                $deletedCount++;
            } catch (\Exception $e) {
                $this->error("Failed to delete photo ID {$photo->id}: " . $e->getMessage());
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully deleted {$deletedCount} orphaned profile photo records.");
        
        return 0;
    }
}
