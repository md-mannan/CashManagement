// Load polyfills first for older browser support
import './polyfills';

// Initialize feature detection
import './utils/feature-detection';

import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './components/ui/toast';
import { RealTimeNotificationProvider } from './contexts/RealTimeNotificationContext';
import { initializeTheme } from './hooks/use-appearance';
import webSocketService from './services/websocketService';

// Import axios configuration
import './lib/axios';
import { configureEcho } from '@laravel/echo-react';

// Import and make route function globally available
import { route } from './lib/route';

// Make route function globally available
declare global {
    interface Window {
        route: typeof route;
    }
}

if (typeof window !== 'undefined') {
    window.route = route;
}

configureEcho({
    broadcaster: 'reverb',
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize WebSocket service if user is authenticated
        // Temporarily disabled to fix 403 errors
        // if (props.initialPage.props.auth?.user) {
        //     webSocketService.initialize(props.initialPage.props.auth.user);
        // }

        root.render(
            <ToastProvider>
                <RealTimeNotificationProvider 
                    userId={props.initialPage.props.auth?.user?.id || 0} 
                    userRole={props.initialPage.props.auth?.user?.role || 'user'}
                >
                    <App {...props} />
                </RealTimeNotificationProvider>
            </ToastProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
