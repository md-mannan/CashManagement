<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProfilePhoto;
use Illuminate\Support\Facades\Storage;

class CheckProfilePhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'profile-photos:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check profile photos in database and storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking profile photos...');
        $this->newLine();

        $photos = ProfilePhoto::with('user')->get();

        if ($photos->isEmpty()) {
            $this->info('No profile photos found in database.');
            return 0;
        }

        $this->info("Found {$photos->count()} profile photo(s) in database:");
        $this->newLine();

        $table = [];
        foreach ($photos as $photo) {
            $fileExists = Storage::disk('public')->exists($photo->file_path);
            $status = $fileExists ? '✅ Exists' : '❌ Missing';
            
            $table[] = [
                $photo->id,
                $photo->user->email ?? 'Unknown',
                $photo->file_path,
                $photo->file_name,
                $photo->is_current ? 'Yes' : 'No',
                $status,
            ];
        }

        $this->table([
            'ID',
            'User Email',
            'File Path',
            'File Name',
            'Is Current',
            'File Status'
        ], $table);

        $missingFiles = $photos->filter(function ($photo) {
            return !Storage::disk('public')->exists($photo->file_path);
        });

        if ($missingFiles->isNotEmpty()) {
            $this->newLine();
            $this->warn("Found {$missingFiles->count()} profile photo(s) with missing files:");
            
            foreach ($missingFiles as $photo) {
                $this->line("  - ID {$photo->id}: {$photo->file_path}");
            }
        }

        return 0;
    }
}
