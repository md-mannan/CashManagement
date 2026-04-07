// Load polyfills first for older browser support
import './polyfills';

// Initialize feature detection
import './utils/feature-detection';

import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './components/ui/toast';
import { initializeTheme } from './hooks/use-appearance';

// Import axios configuration
import './lib/axios';

import { route } from './lib/route';

declare global {
    interface Window {
        route: typeof route;
    }
}

if (typeof window !== 'undefined') {
    window.route = route;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ToastProvider>
                <App {...props} />
            </ToastProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
