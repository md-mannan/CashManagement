<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\ProfilePhoto;
use App\Models\User;

class CheckDatabaseCommand extends Command
{
    protected $signature = 'check:database';
    protected $description = 'Check database structure and data';

    public function handle()
    {
        $this->info("Checking database structure...");
        
        // Check users table
        $this->info("\nUsers table columns:");
        try {
            $columns = DB::select("PRAGMA table_info(users)");
            foreach($columns as $col) {
                $this->line("  {$col->name} ({$col->type})");
            }
        } catch (\Exception $e) {
            $this->error("Error checking users table: " . $e->getMessage());
        }
        
        // Check profile_photos table
        $this->info("\nProfile_photos table columns:");
        try {
            $columns = DB::select("PRAGMA table_info(profile_photos)");
            foreach($columns as $col) {
                $this->line("  {$col->name} ({$col->type})");
            }
        } catch (\Exception $e) {
            $this->error("Error checking profile_photos table: " . $e->getMessage());
        }
        
        // Check profile photos data
        $this->info("\nProfile photos data:");
        $photos = ProfilePhoto::all();
        foreach($photos as $photo) {
            $this->line("  ID: {$photo->id}, User: {$photo->user_id}, Current: " . ($photo->is_current ? 'Yes' : 'No') . ", Path: {$photo->file_path}");
        }
        
        // Check user data
        $this->info("\nUser data:");
        $user = User::find(2);
        if ($user) {
            $this->line("  Name: {$user->name}");
            $this->line("  Profile photo: {$user->profile_photo}");
            $this->line("  Avatar URL: {$user->avatar}");
        }
    }
}
