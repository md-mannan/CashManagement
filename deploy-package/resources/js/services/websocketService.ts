import { isWebSocketEnabled, websocketConfig } from '@/config/websocket';
import Echo from 'laravel-echo';

// Initialize Laravel Echo
declare global {
    interface Window {
        Echo: any;
    }
}

class WebSocketService {
    private echo: any = null;
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
            this.initializeEcho();
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
                this.isConnected = false;
                return;
            }



            // Initialize Laravel Echo
            this.echo = new Echo({
                broadcaster: 'reverb',
                key: websocketConfig.reverb.key,
                wsHost: websocketConfig.reverb.host,
                wsPort: websocketConfig.reverb.port,
                forceTLS: websocketConfig.reverb.forceTLS,
                enabledTransports: websocketConfig.reverb.enabledTransports as any,
                disableStats: websocketConfig.reverb.disableStats,
                authEndpoint: '/broadcasting/auth',
                auth: {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            } as any);

            this.setupEventListeners();
            this.isConnected = true;
        } catch (error) {
            this.isConnected = false;
            this.scheduleReconnect();
        }
    }

    private setupEventListeners() {
        if (!this.echo) return;

        // Handle connection events
        this.echo.connector.pusher.connection.bind('connected', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.echo.connector.pusher.connection.bind('disconnected', () => {
            this.isConnected = false;
            this.scheduleReconnect();
        });

        this.echo.connector.pusher.connection.bind('error', (error: any) => {
            this.isConnected = false;
            this.scheduleReconnect();
        });
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        setTimeout(() => {
            this.initializeEcho();
        }, delay);
    }

    /**
     * Listen to user-specific notifications
     */
    public listenToUserNotifications(userId: number, callback: (notification: any) => void) {
        if (!this.echo || !this.isConnected) {
            return null;
        }

        try {
            return this.echo.private(`user.${userId}`).listen('.notification.sent', callback);
        } catch (error) {
            return null;
        }
    }

    /**
     * Listen to admin notifications
     */
    public listenToAdminNotifications(callback: (notification: any) => void) {
        if (!this.echo || !this.isConnected) {
            return null;
        }

        try {
            return this.echo.private('admin.notifications').listen('.notification.sent', callback);
        } catch (error) {
            return null;
        }
    }

    /**
     * Listen to super admin notifications
     */
    public listenToSuperAdminNotifications(callback: (notification: any) => void) {
        if (!this.echo || !this.isConnected) {
            return null;
        }

        try {
            return this.echo.private('super-admin.notifications').listen('.notification.sent', callback);
        } catch (error) {
            return null;
        }
    }

    /**
     * Listen to notification read events
     */
    public listenToNotificationRead(callback: (data: any) => void) {
        if (!this.echo || !this.isConnected) {
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
            return null;
        }
    }

    /**
     * Listen to notification deleted events
     */
    public listenToNotificationDeleted(callback: (data: any) => void) {
        if (!this.echo || !this.isConnected) {
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
