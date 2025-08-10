import { notificationService, type NotificationData } from '@/services/notificationService';
import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch notifications from the API
     */
    const fetchNotifications = useCallback(async (unreadOnly = false, limit = 20) => {
        try {
            setLoading(true);
            setError(null);
            const response = await notificationService.getNotifications(unreadOnly, limit);
            setNotifications(response.notifications);
            setUnreadCount(response.unread_count);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch only unread count
     */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            // Silently fail for unread count updates
        }
    }, []);

    /**
     * Mark a notification as read
     */
    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            const response = await notificationService.markAsRead(notificationId);
            setUnreadCount(response.unread_count);

            // Update the notification in the local state
            setNotifications((prev) =>
                prev.map((notification) => (notification.id === notificationId ? { ...notification, is_read: true } : notification)),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark as read');
        }
    }, []);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await notificationService.markAllAsRead();
            setUnreadCount(response.unread_count);

            // Update all notifications in the local state
            setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark all as read');
        }
    }, []);

    /**
     * Delete a notification
     */
    const deleteNotification = useCallback(async (notificationId: number) => {
        try {
            const response = await notificationService.deleteNotification(notificationId);
            setUnreadCount(response.unread_count);

            // Remove the notification from the local state
            setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete notification');
        }
    }, []);

    /**
     * Initialize notifications on mount
     */
    useEffect(() => {
        fetchNotifications();

        // Set up polling for unread count updates every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchNotifications,
    };
}
