<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class UserDataAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        // SECURITY: Prevent users from accessing other users' data
        // Even admins cannot access other users' personal data without explicit authorization
        if ($request->has('user_id') && $request->user_id != $user->id) {
            // Log security violation attempt
            \Log::warning('Security violation: User attempted to access another user\'s data', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'requested_user_id' => $request->user_id,
                'route' => $request->route()->getName(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            abort(403, 'Access denied. You can only access your own data.');
        }

        return $next($request);
    }
}
