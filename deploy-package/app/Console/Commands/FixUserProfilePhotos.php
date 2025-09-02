<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class FixUserProfilePhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:fix-profile-photos {--dry-run : Show what would be fixed without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix user profile photos by ensuring they point to valid files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        if ($isDryRun) {
            $this->info('DRY RUN MODE - No changes will be made');
        }

        $this->info('Checking and fixing user profile photos...');
        $this->newLine();

        $users = User::all(['id', 'email', 'profile_photo']);

        if ($users->isEmpty()) {
            $this->info('No users found.');
            return 0;
        }

        $fixedCount = 0;
        $table = [];

        foreach ($users as $user) {
            $originalPhoto = $user->profile_photo;
            $status = 'No Change';
            $newPhoto = $originalPhoto;

            // Check if the user has a profile_photo that doesn't exist
            if ($user->profile_photo && !Storage::disk('public')->exists($user->profile_photo)) {
                // Try to find a valid current profile photo from ProfilePhoto model
                $currentPhoto = $user->profilePhotos()->where('is_current', true)->first();
                
                if ($currentPhoto && Storage::disk('public')->exists($currentPhoto->file_path)) {
                    $newPhoto = $currentPhoto->file_path;
                    $status = 'Fixed - Updated to current photo';
                } else {
                    // Try to find any valid profile photo
                    $anyPhoto = $user->profilePhotos()->first();
                    if ($anyPhoto && Storage::disk('public')->exists($anyPhoto->file_path)) {
                        $newPhoto = $anyPhoto->file_path;
                        $status = 'Fixed - Updated to available photo';
                    } else {
                        $newPhoto = null;
                        $status = 'Fixed - Cleared invalid reference';
                    }
                }

                if (!$isDryRun && $newPhoto !== $originalPhoto) {
                    $user->update(['profile_photo' => $newPhoto]);
                    $fixedCount++;
                }
            }

            $table[] = [
                $user->id,
                $user->email,
                $originalPhoto ?? 'null',
                $newPhoto ?? 'null',
                $status,
            ];
        }

        $this->table([
            'ID',
            'Email',
            'Original Photo',
            'New Photo',
            'Status'
        ], $table);

        if ($isDryRun) {
            $this->newLine();
            $this->info('This was a dry run. Run without --dry-run to actually fix the issues.');
        } else {
            $this->newLine();
            $this->info("✅ Fixed {$fixedCount} user profile photo(s).");
        }

        return 0;
    }
}
