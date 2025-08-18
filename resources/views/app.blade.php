<!DOCTYPE html>
<html lang="en-GB"
    @class([
        'dark' => ($appearance ?? 'system') == 'dark',
        'theme-violet' => ($theme ?? 'neutral') == 'violet'
    ])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @if (app()->environment('local', 'development'))
        {{-- Development: More permissive CSP for Vite dev server --}}
        <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 http://127.0.0.1:5173 ws://localhost:5173 ws://127.0.0.1:5173; connect-src 'self' ws: wss: http: https: http://localhost:5173 http://127.0.0.1:5173 ws://localhost:5173 ws://127.0.0.1:5173; style-src 'self' 'unsafe-inline' http://localhost:5173 http://127.0.0.1:5173;">
        @else
        {{-- Production: Secure CSP but Vite-compatible --}}
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss: https:; worker-src 'self' blob:;">
        @endif

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';
                const theme = '{{ $theme ?? "neutral" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }

                // Apply theme class
                if (theme !== 'neutral') {
                    document.documentElement.classList.add(`theme-${theme}`);
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            html.theme-violet {
                background-color: oklch(0.99 0.005 280);
            }

            html.theme-violet.dark {
                background-color: oklch(0.12 0.02 280);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

        @routes
        
        @if (app()->environment('local', 'development'))
            {{-- Development: Use Vite dev server with hot reload --}}
            @viteReactRefresh
            @vite(['resources/js/app.tsx'])
        @else
            {{-- Production: Use built assets --}}
            @vite(['resources/js/app.tsx'])
        @endif
        
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
