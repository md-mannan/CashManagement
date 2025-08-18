import axios from '@/lib/axios';
import { config, debugLog, errorLog, warnLog } from '@/config/environment';

export interface NotificationData {
    id: number;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    icon?: string;
    color: string;
    data?: any;
    is_read: boolean;
    is_important: boolean;
    time_ago: string;
    created_at: string;
}

export interface NotificationsResponse {
    notifications: NotificationData[];
    unread_count: number;
}

export interface UnreadCountResponse {
    unread_count: number;
}

class NotificationService {
    private baseUrl = '/api/notifications';
    private retryCount = new Map<string, number>();

    /**
     * Get all notifications for the current user
     */
    async getNotifications(unreadOnly = false, limit = 20): Promise<NotificationsResponse> {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    unread_only: unreadOnly,
                    limit,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error in getNotifications:', error);
            throw new Error('Failed to fetch notifications');
        }
    }

    /**
     * Get unread notifications count
     */
    async getUnreadCount(): Promise<number> {
        try {
            const response = await axios.get(`${this.baseUrl}/unread-count`);
            return response.data.unread_count;
        } catch (error) {
            throw new Error('Failed to fetch unread count');
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: number): Promise<UnreadCountResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/${notificationId}/mark-as-read`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to mark notification as read');
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<UnreadCountResponse> {
        try {
            const response = await axios.post(`${this.baseUrl}/mark-all-as-read`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to mark all notifications as read');
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: number): Promise<UnreadCountResponse> {
        try {
            const response = await axios.delete(`${this.baseUrl}/${notificationId}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to delete notification');
        }
    }

    /**
     * Clear all notifications with environment-aware error handling
     */
    async clearAllNotifications(): Promise<{ message: string; unread_count: number; deleted_count: number }> {
        const operationKey = 'clearAllNotifications';
        
        try {
            debugLog('Attempting to clear all notifications');
            
            const response = await axios.post(`${this.baseUrl}/clear-all`);
            
            // Reset retry count on success
            this.retryCount.delete(operationKey);
            
            debugLog('Successfully cleared all notifications', {
                deletedCount: response.data.deleted_count,
                unreadCount: response.data.unread_count
            });
            
            return response.data;
        } catch (error: any) {
            const currentRetries = this.retryCount.get(operationKey) || 0;
            
            // Enhanced error handling based on environment
            if (config.isProduction && currentRetries < config.retryAttempts) {
                // Production: Attempt retry for certain errors
                if (this.shouldRetryOperation(error)) {
                    this.retryCount.set(operationKey, currentRetries + 1);
                    
                    warnLog(`Retrying clear all notifications (${currentRetries + 1}/${config.retryAttempts})`, {
                        error: error.message,
                        status: error.response?.status
                    });
                    
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, config.retryDelay));
                    return this.clearAllNotifications();
                }
            }
            
            // Reset retry count
            this.retryCount.delete(operationKey);
            
            // Environment-specific error messages
            let errorMessage = 'Failed to clear all notifications';
            
            if (error.response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
                warnLog('Authentication error while clearing notifications');
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to clear notifications.';
                warnLog('Permission error while clearing notifications');
            } else if (error.response?.status === 419) {
                errorMessage = 'Session expired. The page will reload automatically.';
                warnLog('CSRF token expired while clearing notifications');
            } else if (error.response?.status >= 500) {
                errorMessage = config.isProduction 
                    ? 'Server error. Please try again later.' 
                    : `Server error: ${error.response.data?.message || error.message}`;
                errorLog('Server error while clearing notifications', error);
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please check your connection and try again.';
                errorLog('Timeout error while clearing notifications');
            } else {
                errorMessage = config.isProduction 
                    ? 'An unexpected error occurred. Please try again.' 
                    : `Error: ${error.message}`;
                errorLog('Unexpected error while clearing notifications', error);
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * Determine if an operation should be retried
     */
    private shouldRetryOperation(error: any): boolean {
        // Don't retry authentication or permission errors
        if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 419) {
            return false;
        }
        
        // Retry server errors and network issues
        return (
            error.response?.status >= 500 ||
            error.code === 'NETWORK_ERROR' ||
            error.code === 'ECONNABORTED' ||
            !error.response
        );
    }
}

export const notificationService = new NotificationService();
