<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $destination = $request->user()->firstAccessibleUrlPath();
        $verifiedUrl = $destination.(str_contains($destination, '?') ? '&' : '?').'verified=1';

        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended($verifiedUrl);
        }

        $request->fulfill();

        return redirect()->intended($verifiedUrl);
    }
}
