/**
 * Environment Configuration
 * Detects and configures settings based on the current environment
 */

interface EnvironmentConfig {
    isDevelopment: boolean;
    isProduction: boolean;
    apiTimeout: number;
    retryAttempts: number;
    retryDelay: number;
    enableDebugLogs: boolean;
    notificationPollingInterval: number;
    websocketReconnectAttempts: number;
    websocketReconnectDelay: number;
}

/**
 * Detect current environment
 */
function detectEnvironment(): 'development' | 'production' {
    // Check if we're in development mode
    if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('.local') ||
        window.location.hostname.includes('.test') ||
        window.location.port === '3000' ||
        window.location.port === '5173' || // Vite dev server
        import.meta.env?.DEV === true
    ) {
        return 'development';
    }
    
    return 'production';
}

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig(): EnvironmentConfig {
    const env = detectEnvironment();
    const isDevelopment = env === 'development';
    const isProduction = env === 'production';

    if (isDevelopment) {
        return {
            isDevelopment: true,
            isProduction: false,
            apiTimeout: 300000, // 5 minutes for development (for large file uploads)
            retryAttempts: 2, // Fewer retries in development
            retryDelay: 1000, // 1 second delay
            enableDebugLogs: true,
            notificationPollingInterval: 10000, // 10 seconds polling
            websocketReconnectAttempts: 5,
            websocketReconnectDelay: 2000, // 2 seconds
        };
    }

    // Production configuration
    return {
        isDevelopment: false,
        isProduction: true,
        apiTimeout: 300000, // 5 minutes for production (for large file uploads)
        retryAttempts: 3, // More retries in production
        retryDelay: 2000, // 2 seconds delay
        enableDebugLogs: false,
        notificationPollingInterval: 30000, // 30 seconds polling (less frequent)
        websocketReconnectAttempts: 10, // More reconnect attempts
        websocketReconnectDelay: 5000, // 5 seconds
    };
}

/**
 * Log debug messages only in development
 */
function debugLog(message: string, ...args: any[]): void {
    // Debug logging disabled for security
}

/**
 * Log errors (always logged)
 */
function errorLog(_message: string, _error?: any): void {
    // Errors logged silently in production
}

/**
 * Log warnings (always logged)
 */
function warnLog(message: string, ...args: any[]): void {
    console.warn(`[App Warning] ${message}`, ...args);
}

// Export the configuration
export const config = getEnvironmentConfig();
export const environment = detectEnvironment();
export { debugLog, errorLog, warnLog };

// Export types
export type { EnvironmentConfig };
