import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationToastProps {
    notification: {
        id: number;
        type: string;
        title: string;
        message: string;
        color: string;
        is_important: boolean;
    };
    onClose: (id: number) => void;
    duration?: number;
}

export function NotificationToast({ notification, onClose, duration = 5000 }: NotificationToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose(notification.id);
        }, 300);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'red':
                return 'border-red-200 bg-red-50 text-red-800';
            case 'green':
                return 'border-green-200 bg-green-50 text-green-800';
            case 'blue':
                return 'border-blue-200 bg-blue-50 text-blue-800';
            case 'yellow':
                return 'border-yellow-200 bg-yellow-50 text-yellow-800';
            case 'purple':
                return 'border-purple-200 bg-purple-50 text-purple-800';
            case 'orange':
                return 'border-orange-200 bg-orange-50 text-orange-800';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-800';
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                'fixed right-4 top-4 z-50 w-96 max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300',
                getColorClasses(notification.color),
                isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            )}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                            {notification.title}
                            {notification.is_important && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                    Important
                                </span>
                            )}
                        </h4>
                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                </div>
            </div>
        </div>
    );
}

interface NotificationToastContainerProps {
    notifications: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        color: string;
        is_important: boolean;
    }>;
    onClose: (id: number) => void;
}

export function NotificationToastContainer({ notifications, onClose }: NotificationToastContainerProps) {
    return (
        <div className="fixed right-4 top-4 z-50 space-y-4">
            {notifications.map((notification, index) => (
                <div
                    key={notification.id}
                    style={{
                        transform: `translateY(${index * 20}px)`,
                    }}
                >
                    <NotificationToast
                        notification={notification}
                        onClose={onClose}
                        duration={notification.is_important ? 10000 : 5000}
                    />
                </div>
            ))}
        </div>
    );
}
