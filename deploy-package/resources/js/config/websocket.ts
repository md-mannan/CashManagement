// WebSocket Configuration for Laravel Reverb
export const websocketConfig = {
    // Reverb server configuration
    reverb: {
        key: import.meta.env.VITE_REVERB_APP_KEY || 'your-reverb-key',
        host: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
        port: import.meta.env.VITE_REVERB_PORT || 8080,
        scheme: import.meta.env.VITE_REVERB_SCHEME || 'ws',
        forceTLS: import.meta.env.VITE_REVERB_FORCE_TLS === 'true',
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
    },

    // Connection settings
    connection: {
        maxReconnectAttempts: 5,
        reconnectDelay: 1000,
        heartbeatInterval: 30000,
    },

    // Channel prefixes
    channels: {
        user: 'user',
        admin: 'admin',
        superAdmin: 'super-admin',
    },

    // Event names
    events: {
        notificationSent: 'notification.sent',
        notificationRead: 'notification.read',
        notificationDeleted: 'notification.deleted',
    },
};

// Helper function to get WebSocket URL
export function getWebSocketUrl(): string {
    const { scheme, host, port } = websocketConfig.reverb;
    return `${scheme}://${host}:${port}`;
}

// Helper function to check if WebSocket is enabled
export function isWebSocketEnabled(): boolean {
    // Default to true if not specified, but allow disabling via environment variable
    return import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false';
}
