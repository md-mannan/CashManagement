<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInstallation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip installation check for installer routes
        if ($request->is('install*')) {
            return $next($request);
        }

        // Check if application is installed
        if (!$this->isInstalled()) {
            return redirect('/install');
        }

        return $next($request);
    }

    /**
     * Check if the application is installed
     */
    private function isInstalled(): bool
    {
        // Check if .env file exists
        if (!file_exists(base_path('.env'))) {
            return false;
        }

        // Check if APP_INSTALLED is set to true
        $envContent = file_get_contents(base_path('.env'));
        return strpos($envContent, 'APP_INSTALLED=true') !== false;
    }
}
