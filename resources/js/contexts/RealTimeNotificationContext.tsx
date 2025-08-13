import { NotificationToastContainer } from '@/components/ui/notification-toast';
import webSocketService from '@/services/websocketService';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface NotificationToast {
    id: number;
    type: string;
    title: string;
    message: string;
    color: string;
    is_important: boolean;
    timestamp: number;
}

interface RealTimeNotificationContextType {
    addToast: (notification: Omit<NotificationToast, 'id' | 'timestamp'>) => void;
    removeToast: (id: number) => void;
    clearToasts: () => void;
    toasts: NotificationToast[];
}

const RealTimeNotificationContext = createContext<RealTimeNotificationContextType | undefined>(undefined);

export function useRealTimeNotifications() {
    const context = useContext(RealTimeNotificationContext);
    if (context === undefined) {
        throw new Error('useRealTimeNotifications must be used within a RealTimeNotificationProvider');
    }
    return context;
}

interface RealTimeNotificationProviderProps {
    children: React.ReactNode;
    userId?: number;
    userRole?: string;
}

export function RealTimeNotificationProvider({ children, userId, userRole }: RealTimeNotificationProviderProps) {
    const [toasts, setToasts] = useState<NotificationToast[]>([]);
    const [nextId, setNextId] = useState(1);

    const addToast = useCallback(
        (notification: Omit<NotificationToast, 'id' | 'timestamp'>) => {
            const newToast: NotificationToast = {
                ...notification,
                id: nextId,
                timestamp: Date.now(),
            };

            setToasts((prev) => [...prev, newToast]);
            setNextId((prev) => prev + 1);

            // Auto-remove toast after a delay
            setTimeout(
                () => {
                    removeToast(newToast.id);
                },
                notification.is_important ? 10000 : 5000,
            );
        },
        [nextId],
    );

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Set up WebSocket listeners for real-time notifications
    useEffect(() => {
        if (!userId) return;

        let userListener: any = null;
        let adminListener: any = null;
        let superAdminListener: any = null;

        try {
            // Listen to user-specific notifications
            userListener = webSocketService.listenToUserNotifications(userId, (notification) => {
                addToast({
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    color: notification.color,
                    is_important: notification.is_important,
                });
            });

            // Listen to admin notifications if user is admin
            if (userRole && ['admin', 'super_admin'].includes(userRole)) {
                adminListener = webSocketService.listenToAdminNotifications((notification) => {
                    addToast({
                        type: notification.type,
                        title: notification.title,
                        message: notification.message,
                        color: notification.color,
                        is_important: notification.is_important,
                    });
                });
            }

            // Listen to super admin notifications if user is super admin
            if (userRole === 'super_admin') {
                superAdminListener = webSocketService.listenToSuperAdminNotifications((notification) => {
                    addToast({
                        type: notification.type,
                        title: notification.title,
                        message: notification.message,
                        color: notification.color,
                        is_important: notification.is_important,
                    });
                });
            }
        } catch (error) {
            console.warn('WebSocket setup failed in RealTimeNotificationContext:', error);
            // Continue without WebSocket - toasts will still work for manual additions
        }

        return () => {
            if (userListener) userListener.stopListening('.notification.sent');
            if (adminListener) adminListener.stopListening('.notification.sent');
            if (superAdminListener) superAdminListener.stopListening('.notification.sent');
        };
    }, [userId, userRole, addToast]);

    const contextValue: RealTimeNotificationContextType = {
        addToast,
        removeToast,
        clearToasts,
        toasts,
    };

    return (
        <RealTimeNotificationContext.Provider value={contextValue}>
            {children}
            <NotificationToastContainer notifications={toasts} onClose={removeToast} />
        </RealTimeNotificationContext.Provider>
    );
}
