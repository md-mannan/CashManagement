import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    sound?: boolean;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const playSound = (type: ToastType) => {
        try {
            // Create audio context for better browser support
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different toast types
            const frequencies = {
                success: [523.25, 659.25, 783.99], // C5, E5, G5 (success chord)
                error: [220, 196], // A3, G3 (error sound)
                warning: [440, 523.25], // A4, C5 (warning sound)
                info: [523.25], // C5 (simple info sound)
            };

            const freq = frequencies[type];

            // Play each note in sequence
            freq.forEach((frequency, index) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(audioContext.destination);

                    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    osc.type = 'sine';

                    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                    osc.start(audioContext.currentTime);
                    osc.stop(audioContext.currentTime + 0.3);
                }, index * 150);
            });
        } catch (error) {
            // Silently handle audio errors
            console.debug('Audio playback failed:', error);
        }
    };

    const showToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = {
            id,
            duration: 4000, // 4 seconds for better UX
            sound: true,
            ...toast,
        };

        setToasts(prev => [...prev, newToast]);

        // Play sound if enabled
        if (newToast.sound) {
            playSound(newToast.type);
        }

        // Auto remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
        }
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed right-4 top-4 z-[9999] pointer-events-none space-y-4">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{
                        transform: `translateY(${index * 20}px)`,
                    }}
                >
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger slide-in animation
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'error':
                return <XCircle className="h-6 w-6 text-red-600" />;
            case 'warning':
                return <AlertCircle className="h-6 w-6 text-yellow-600" />;
            case 'info':
                return <Info className="h-6 w-6 text-blue-600" />;
        }
    };

    const getBackgroundColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div
            className={`
                pointer-events-auto w-96 max-w-sm
                transform transition-all duration-300 ease-out
                ${isVisible && !isExiting
                    ? 'translate-x-0 opacity-100'
                    : isExiting
                    ? 'translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                }
            `}
        >
            <div className={`
                rounded-lg border p-4 shadow-lg backdrop-blur-sm
                ${getBackgroundColor()}
            `}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {toast.title}
                        </p>
                        {toast.message && (
                            <p className="mt-1 text-sm text-gray-700">
                                {toast.message}
                            </p>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            onClick={handleClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
