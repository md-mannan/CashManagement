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

        {{-- CSP is handled by .htaccess files for better compatibility --}}

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
        
        {{-- Force production build for cPanel deployment --}}
        @php
            $manifest = public_path('build/.vite/manifest.json');
            if (file_exists($manifest)) {
                $manifestData = json_decode(file_get_contents($manifest), true);
                $appJs = $manifestData['resources/js/app.tsx']['file'] ?? null;
                $appCss = $manifestData['resources/js/app.tsx']['css'][0] ?? null;
            }
        @endphp
        
        @if(isset($appCss))
            <link rel="stylesheet" href="{{ asset('build/' . $appCss) }}">
        @endif
        
        @if(isset($appJs))
            <script type="module" src="{{ asset('build/' . $appJs) }}"></script>
        @else
            {{-- Fallback to @vite directive if manifest not found --}}
            @vite(['resources/js/app.tsx'])
        @endif
        
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
