import { notificationService, type NotificationData } from '@/services/notificationService';
import webSocketService from '@/services/websocketService';
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
            console.debug('Failed to fetch unread count:', err);
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
     * Clear all notifications
     */
    const clearAllNotifications = useCallback(async () => {
        try {
            const response = await notificationService.clearAllNotifications();
            setUnreadCount(0);

            // Clear all notifications from the local state
            setNotifications([]);
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear all notifications');
            throw err;
        }
    }, []);

    /**
     * Initialize notifications on mount
     */
    useEffect(() => {
        fetchNotifications();

        // Set up real-time WebSocket listeners with error handling
        let userListener = null;
        let adminListener = null;
        let readListener = null;
        let deleteListener = null;

        try {
            userListener = webSocketService.listenToUserNotifications(
                (window as any).user?.id || 0,
                (notification: NotificationData) => {
                    // Add new notification to the list
                    setNotifications((prev) => [notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            );

            adminListener = webSocketService.listenToAdminNotifications(
                (notification: NotificationData) => {
                    // Add new notification to the list
                    setNotifications((prev) => [notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            );

            readListener = webSocketService.listenToNotificationRead(
                (data: { id: number }) => {
                    // Update notification read status
                    setNotifications((prev) =>
                        prev.map((notification) =>
                            notification.id === data.id ? { ...notification, is_read: true } : notification
                        )
                    );
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
            );

            deleteListener = webSocketService.listenToNotificationDeleted(
                (data: { id: number }) => {
                    // Remove deleted notification
                    setNotifications((prev) => prev.filter((notification) => notification.id !== data.id));
                    // Recalculate unread count
                    fetchUnreadCount();
                }
            );
        } catch (error) {
            console.warn('WebSocket setup failed, falling back to polling:', error);
            // Continue with polling fallback
        }

        // Set up polling for unread count updates every 30 seconds (fallback)
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => {
            clearInterval(interval);
            // Clean up WebSocket listeners
            if (userListener) userListener.stopListening('.notification.sent');
            if (adminListener) adminListener.stopListening('.notification.sent');
            if (readListener?.userChannel) readListener.userChannel.stopListening('.notification.read');
            if (readListener?.adminChannel) readListener.adminChannel.stopListening('.notification.read');
            if (deleteListener?.userChannel) deleteListener.userChannel.stopListening('.notification.deleted');
            if (deleteListener?.adminChannel) deleteListener.adminChannel.stopListening('.notification.deleted');
        };
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
        clearAllNotifications,
        refresh: fetchNotifications,
    };
}
