<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class CheckUserProfilePhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:check-profile-photos';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check profile_photo field in users table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking users profile_photo field...');
        $this->newLine();

        $users = User::all(['id', 'email', 'profile_photo']);

        if ($users->isEmpty()) {
            $this->info('No users found.');
            return 0;
        }

        $this->info("Found {$users->count()} user(s):");
        $this->newLine();

        $table = [];
        foreach ($users as $user) {
            $fileExists = $user->profile_photo ? Storage::disk('public')->exists($user->profile_photo) : null;
            $status = $user->profile_photo ? ($fileExists ? '✅ Exists' : '❌ Missing') : 'No Photo';
            
            $table[] = [
                $user->id,
                $user->email,
                $user->profile_photo ?? 'null',
                $status,
            ];
        }

        $this->table([
            'ID',
            'Email',
            'Profile Photo Path',
            'File Status'
        ], $table);

        $usersWithMissingPhotos = $users->filter(function ($user) {
            return $user->profile_photo && !Storage::disk('public')->exists($user->profile_photo);
        });

        if ($usersWithMissingPhotos->isNotEmpty()) {
            $this->newLine();
            $this->warn("Found {$usersWithMissingPhotos->count()} user(s) with missing profile photos:");
            
            foreach ($usersWithMissingPhotos as $user) {
                $this->line("  - User {$user->id} ({$user->email}): {$user->profile_photo}");
            }
            
            $this->newLine();
            $this->info("You can fix this by running: php artisan users:fix-profile-photos");
        }

        return 0;
    }
}
