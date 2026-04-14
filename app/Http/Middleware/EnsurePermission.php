<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    /**
     * Require at least one permission from the comma-separated list (OR).
     *
     * @param  string  ...$permissions  Dot notation: middleware registers as 'permission:foo' or 'permission:foo,bar'
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $keys = [];
        foreach ($permissions as $segment) {
            foreach (explode(',', $segment) as $key) {
                $k = trim($key);
                if ($k !== '') {
                    $keys[] = $k;
                }
            }
        }

        foreach ($keys as $key) {
            if ($user->hasPermission($key)) {
                return $next($request);
            }
        }

        if ($request->expectsJson()) {
            abort(403, 'You do not have permission to access this module.');
        }

        return redirect()
            ->route('settings.profile.edit')
            ->with('error', 'You do not have permission to access that area.');
    }
}
