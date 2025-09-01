import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            buildDirectory: 'build',
        }),
        react(),
        tailwindcss(),
        // Legacy browser support
        legacy({
            targets: [
                '> 0.5%',
                'last 2 versions',
                'not dead',
                'not ie 11'
            ],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
            renderLegacyChunks: true,
            polyfills: [
                'es.symbol',
                'es.array.filter',
                'es.promise',
                'es.promise.finally',
                'es/map',
                'es/set',
                'es.array.for-each',
                'es.object.define-properties',
                'es.object.define-property',
                'es.object.get-own-property-descriptor',
                'es.object.get-own-property-descriptors',
                'es.object.keys',
                'es.object.to-string',
                'web.dom-collections.for-each',
                'esnext.global-this',
                'esnext.string.match-all'
            ]
        }),
    ],
    esbuild: {
        jsx: 'automatic',
        target: 'es2015', // Support older browsers
        supported: {
            'bigint': false, // Disable BigInt for older browsers
            'top-level-await': false // Disable top-level await
        },
        // Tree shaking optimizations
        treeShaking: true,
        // Remove console logs in production
        drop: ['console', 'debugger'],
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React libraries
                    'react-vendor': ['react', 'react-dom'],
                    // UI libraries
                    'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tooltip', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible', '@radix-ui/react-label', '@radix-ui/react-navigation-menu', '@radix-ui/react-progress', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-toggle', '@radix-ui/react-toggle-group'],
                    // Icons and utilities
                    'icons-vendor': ['lucide-react', '@heroicons/react'],
                    // Inertia and routing
                    'inertia-vendor': ['@inertiajs/react'],
                    // Charts and data visualization
                    'charts-vendor': ['chart.js', 'react-chartjs-2', 'chartjs-plugin-datalabels'],
                    // Excel/PDF libraries
                    'export-vendor': ['xlsx', 'jspdf', 'html2canvas'],
                    // Headless UI
                    'headless-vendor': ['@headlessui/react'],
                    // Utilities
                    'utils-vendor': ['class-variance-authority', 'clsx', 'tailwind-merge', 'tailwindcss-animate'],
                },
                // Use consistent filenames without random hashes
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
        cssCodeSplit: true,
        outDir: 'public/build',
        assetsDir: 'assets',
        manifest: true,
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable source maps for debugging
        sourcemap: false,
        // Optimize dependencies
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
});
