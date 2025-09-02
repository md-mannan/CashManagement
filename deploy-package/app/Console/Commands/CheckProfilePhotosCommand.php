<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProfilePhoto;
use App\Models\User;

class CheckProfilePhotosCommand extends Command
{
    protected $signature = 'check:profile-photos {user_id?}';
    protected $description = 'Check profile photos for a user';

    public function handle()
    {
        $userId = $this->argument('user_id') ?? 2;
        
        $this->info("Checking profile photos for user ID: {$userId}");
        
        $user = User::find($userId);
        if (!$user) {
            $this->error("User not found!");
            return;
        }
        
        $this->info("User: {$user->name} ({$user->email})");
        $this->info("Profile photo: {$user->profile_photo}");
        $this->info("Avatar URL: {$user->avatar}");
        
        $photos = ProfilePhoto::where('user_id', $userId)->get();
        
        if ($photos->isEmpty()) {
            $this->warn("No profile photos found!");
            return;
        }
        
        $this->info("\nProfile Photos:");
        foreach ($photos as $photo) {
            $status = $photo->is_current ? 'CURRENT' : 'HISTORY';
            $this->line("ID: {$photo->id}, {$status}, Path: {$photo->file_path}, URL: {$photo->url}");
        }
        
        $currentPhoto = $photos->where('user_id', $userId)->where('is_current', true)->first();
        if ($currentPhoto) {
            $this->info("\nCurrent photo: ID {$currentPhoto->id} - {$currentPhoto->url}");
        } else {
            $this->warn("\nNo current photo set!");
        }
    }
}
