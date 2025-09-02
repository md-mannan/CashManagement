<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Models\User;

class TestMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the mail functionality by sending a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        if (!$email) {
            $email = $this->ask('Enter email address to send test email to:');
        }

        $this->info("Sending test email to: {$email}");
        
        try {
            // Create a test user for the email
            $user = new User();
            $user->name = 'Test User';
            $user->email = $email;
            
            // Send the password reset notification
            $user->sendPasswordResetNotification('test-token-123');
            
            $this->info('✅ Test email sent successfully!');
            $this->info('Check your email inbox (and spam folder) for the test email.');
            
        } catch (\Exception $e) {
            $this->error('❌ Failed to send test email:');
            $this->error($e->getMessage());
            
            $this->info('');
            $this->info('To fix this, make sure you have:');
            $this->info('1. Configured your mail settings in .env file');
            $this->info('2. For Gmail, use an App Password instead of your regular password');
            $this->info('3. Enable "Less secure app access" or use 2FA with App Password');
        }
    }
}
