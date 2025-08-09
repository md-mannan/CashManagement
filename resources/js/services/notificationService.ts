import axios from 'axios';

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
}

export const notificationService = new NotificationService();
