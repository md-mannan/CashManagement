import { isWebSocketEnabled, websocketConfig } from '@/config/websocket';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Laravel Echo
declare global {
    interface Window {
        Echo: Echo;
        Pusher: typeof Pusher;
    }
}

class WebSocketService {
    private echo: Echo | null = null;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    constructor() {
        // Don't initialize immediately - wait for explicit initialization
    }

    public initialize(user?: any) {
        // Only initialize if user is provided or can be determined
        if (user || this.isUserAuthenticated()) {
            console.log('Initializing WebSocket with user:', user);
            this.initializeEcho();
        } else {
            console.log('WebSocket initialization skipped - user not authenticated');
        }
    }

    private isUserAuthenticated(): boolean {
        // Check if user is authenticated by looking for Inertia page data
        try {
            const pageData = (window as any).Laravel?.page;
            return pageData && pageData.props && pageData.props.auth && pageData.props.auth.user && pageData.props.auth.user.id;
        } catch (error) {
            // If we can't determine auth status, assume not authenticated
            return false;
        }
    }

    private initializeEcho() {
        try {
            // Check if WebSocket is enabled
            if (!isWebSocketEnabled()) {
                console.log('WebSocket is disabled');
                this.isConnected = false;
                return;
            }

            // Initialize Pusher
            window.Pusher = Pusher;

            // Initialize Laravel Echo
            this.echo = new Echo({
                broadcaster: 'reverb',
                key: websocketConfig.reverb.key,
                wsHost: websocketConfig.reverb.host,
                wsPort: websocketConfig.reverb.port,
                forceTLS: websocketConfig.reverb.forceTLS,
                enabledTransports: websocketConfig.reverb.enabledTransports,
                disableStats: websocketConfig.reverb.disableStats,
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            });

            this.setupEventListeners();
            this.isConnected = true;
            console.log('WebSocket connection established');
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.isConnected = false;
            this.scheduleReconnect();
        }
    }

    private setupEventListeners() {
        if (!this.echo) return;

        // Handle connection events
        this.echo.connector.pusher.connection.bind('connected', () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.echo.connector.pusher.connection.bind('disconnected', () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
            this.scheduleReconnect();
        });

        this.echo.connector.pusher.connection.bind('error', (error: any) => {
            console.error('WebSocket error:', error);
            this.isConnected = false;
            this.scheduleReconnect();
        });
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        setTimeout(() => {
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.initializeEcho();
        }, delay);
    }

    /**
     * Listen to user-specific notifications
     */
    public listenToUserNotifications(userId: number, callback: (notification: any) => void) {
        if (!this.echo || !this.isConnected) {
            console.log('WebSocket not initialized or disabled');
            return null;
        }

        try {
            return this.echo.private(`user.${userId}`).listen('.notification.sent', callback);
        } catch (error) {
            console.error('Error setting up user notification listener:', error);
            return null;
        }
    }

    /**
     * Listen to admin notifications
     */
    public listenToAdminNotifications(callback: (notification: any) => void) {
        if (!this.echo || !this.isConnected) {
            console.log('WebSocket not initialized or disabled');
            return null;
        }

        try {
            return this.echo.private('admin.notifications').listen('.notification.sent', callback);
        } catch (error) {
            console.error('Error setting up admin notification listener:', error);
            return null;
        }
    }

    /**
     * Listen to super admin notifications
     */
    public listenToSuperAdminNotifications(callback: (notification: any) => void) {
        if (!this.echo || !this.isConnected) {
            console.log('WebSocket not initialized or disabled');
            return null;
        }

        try {
            return this.echo.private('super-admin.notifications').listen('.notification.sent', callback);
        } catch (error) {
            console.error('Error setting up super admin notification listener:', error);
            return null;
        }
    }

    /**
     * Listen to notification read events
     */
    public listenToNotificationRead(callback: (data: any) => void) {
        if (!this.echo || !this.isConnected) {
            console.log('WebSocket not initialized or disabled');
            return null;
        }

        try {
            // Listen to both user and admin channels for read events
            const userChannel = this.echo.private(`user.${this.getCurrentUserId()}`);
            const adminChannel = this.echo.private('admin.notifications');

            userChannel.listen('.notification.read', callback);
            adminChannel.listen('.notification.read', callback);

            return { userChannel, adminChannel };
        } catch (error) {
            console.error('Error setting up notification read listener:', error);
            return null;
        }
    }

    /**
     * Listen to notification deleted events
     */
    public listenToNotificationDeleted(callback: (data: any) => void) {
        if (!this.echo || !this.isConnected) {
            console.log('WebSocket not initialized or disabled');
            return null;
        }

        try {
            // Listen to both user and admin channels for delete events
            const userChannel = this.echo.private(`user.${this.getCurrentUserId()}`);
            const adminChannel = this.echo.private('admin.notifications');

            userChannel.listen('.notification.deleted', callback);
            adminChannel.listen('.notification.deleted', callback);

            return { userChannel, adminChannel };
        } catch (error) {
            console.error('Error setting up notification deleted listener:', error);
            return null;
        }
    }

    /**
     * Get current user ID from the page
     */
    private getCurrentUserId(): number {
        // Try to get user ID from meta tag or global variable
        const userIdMeta = document.querySelector('meta[name="user-id"]')?.getAttribute('content');
        if (userIdMeta) {
            return parseInt(userIdMeta);
        }

        // Fallback: try to get from window object
        const user = (window as any).user;
        if (user && user.id) {
            return user.id;
        }

        return 0;
    }

    /**
     * Disconnect from WebSocket
     */
    public disconnect() {
        if (this.echo) {
            this.echo.disconnect();
            this.echo = null;
            this.isConnected = false;
        }
    }

    /**
     * Check if connected
     */
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    /**
     * Get connection info
     */
    public getConnectionInfo() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
        };
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
