<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InstallerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Prevent access to installer if already installed
        if (file_exists(base_path('.env')) && strpos(file_get_contents(base_path('.env')), 'APP_INSTALLED=true') !== false) {
            return redirect('/');
        }

        return $next($request);
    }
}
