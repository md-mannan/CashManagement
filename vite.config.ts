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
        }
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
                    vendor: ['react', 'react-dom'],
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
    },
});
