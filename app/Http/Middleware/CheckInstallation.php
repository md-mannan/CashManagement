<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\InstallationService;

class CheckInstallation
{
    public function __construct(
        private InstallationService $installationService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Skip installation check for installer routes
        if ($request->is('install*')) {
            return $next($request);
        }

        // Check if application is installed
        if (!$this->installationService->isInstalled()) {
            return redirect('/install');
        }

        return $next($request);
    }
}
