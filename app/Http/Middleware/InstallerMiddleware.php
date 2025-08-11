<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\InstallationService;

class InstallerMiddleware
{
    public function __construct(
        private InstallationService $installationService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Prevent access to installer if already installed
        if ($this->installationService->isInstalled()) {
            return redirect('/');
        }

        return $next($request);
    }
}
