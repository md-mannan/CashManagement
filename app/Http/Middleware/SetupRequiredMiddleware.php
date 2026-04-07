<?php

namespace App\Http\Middleware;

use App\Services\SetupService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetupRequiredMiddleware
{
    public function __construct(private readonly SetupService $setupService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->setupService->isCompleted()) {
            return $next($request);
        }

        $path = '/'.ltrim($request->path(), '/');

        // Allow setup routes and health checks and assets
        if (
            str_starts_with($path, '/setup') ||
            $path === '/health' ||
            $path === '/up' ||
            str_starts_with($path, '/build/') ||
            str_starts_with($path, '/storage/') ||
            str_starts_with($path, '/favicon') ||
            str_starts_with($path, '/apple-touch-icon')
        ) {
            return $next($request);
        }

        return redirect('/setup');
    }
}

