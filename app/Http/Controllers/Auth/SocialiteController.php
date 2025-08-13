<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect($provider)
    {
        try {
            return Socialite::driver($provider)->redirect();
        } catch (\Exception $e) {
            Log::error("Social authentication redirect failed for provider: {$provider}", [
                'error' => $e->getMessage(),
                'provider' => $provider
            ]);

            return redirect()->route('login')
                ->withErrors(['email' => "Unable to connect to {$provider}. Please try again or use email login."]);
        }
    }

    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();

            // Check if user already exists with this social account
            $socialAccount = SocialAccount::where('provider', $provider)
                ->where('provider_user_id', $socialUser->getId())
                ->first();

            if ($socialAccount) {
                // User exists, log them in
                $user = $socialAccount->user;

                if (!$user->is_active) {
                    return redirect()->route('login')
                        ->withErrors(['email' => 'Your account has been deactivated. Please contact support.']);
                }

                Auth::login($user);

                // Update last login
                $user->update(['last_login_at' => now()]);

                return redirect()->intended('/dashboard');
            }

            // Check if user exists with the same email
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                // User exists but doesn't have this social account
                // Check if account is active
                if (!$user->is_active) {
                    return redirect()->route('login')
                        ->withErrors(['email' => 'Your account has been deactivated. Please contact support.']);
                }

                // Create social account and log them in
                $this->createSocialAccount($user, $provider, $socialUser);
                Auth::login($user);

                // Update last login
                $user->update(['last_login_at' => now()]);

                return redirect()->intended('/dashboard');
            }

            // Create new user and social account
            $user = $this->createUser($socialUser, $provider);
            $this->createSocialAccount($user, $provider, $socialUser);

            Auth::login($user);

            return redirect()->intended('/dashboard');

        } catch (\Exception $e) {
            Log::error("Social authentication callback failed for provider: {$provider}", [
                'error' => $e->getMessage(),
                'provider' => $provider,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('login')
                ->withErrors(['email' => 'Social authentication failed. Please try again or use email login.']);
        }
    }

    private function createUser($socialUser, $provider)
    {
        return User::create([
            'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: 'User',
            'email' => $socialUser->getEmail(),
            'password' => Hash::make(Str::random(16)),
            'email_verified_at' => now(), // Social accounts are pre-verified
            'role' => 'user',
            'permissions' => [],
            'is_active' => true,
            'last_login_at' => now(),
            'primary_currency' => 'USD',
            'primary_symbol' => '$',
            'secondary_currency' => 'EUR',
            'secondary_symbol' => '€',
            'exchange_rate' => 1.0,
            'appearance_mode' => 'system',
            'theme' => 'default',
            'timezone' => 'UTC',
            'locale' => 'en',
            'date_format' => 'd/m/Y',
            'time_format' => 'H:i',
            'enable_notifications' => true,
            'enable_activity_logging' => true,
            'enable_backup' => true,
            'enable_social_login' => true,
        ]);
    }

    private function createSocialAccount($user, $provider, $socialUser)
    {
        return SocialAccount::create([
            'user_id' => $user->id,
            'provider' => $provider,
            'provider_user_id' => $socialUser->getId(),
            'token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken,
            'expires_at' => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
        ]);
    }
}
