import React, { useEffect, useState, useCallback } from 'react';
import { isMobileDevice, isTouchDevice, shouldReduceMotion, getNetworkInfo } from '@/utils/performance';

interface MobileOptimizedLayoutProps {
    children: React.ReactNode;
    className?: string;
    showMobileIndicator?: boolean;
    optimizeForTouch?: boolean;
    reduceAnimations?: boolean;
}

export function MobileOptimizedLayout({
    children,
    className = '',
    showMobileIndicator = false,
    optimizeForTouch = true,
    reduceAnimations = false
}: MobileOptimizedLayoutProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [isTouch, setIsTouch] = useState(false);
    const [shouldReduce, setShouldReduce] = useState(false);
    const [networkInfo, setNetworkInfo] = useState({ isSlow: false, isFast: true });

    useEffect(() => {
        const checkDeviceCapabilities = () => {
            setIsMobile(isMobileDevice());
            setIsTouch(isTouchDevice());
            setShouldReduce(shouldReduceMotion());
            setNetworkInfo(getNetworkInfo());
        };

        checkDeviceCapabilities();
        window.addEventListener('resize', checkDeviceCapabilities);

        return () => window.removeEventListener('resize', checkDeviceCapabilities);
    }, []);

    // Apply mobile optimizations
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const html = document.documentElement;
        
        // Add mobile-specific classes
        if (isMobile) {
            html.classList.add('mobile-device');
        } else {
            html.classList.remove('mobile-device');
        }

        // Add touch-specific classes
        if (isTouch && optimizeForTouch) {
            html.classList.add('touch-device');
        } else {
            html.classList.remove('touch-device');
        }

        // Add reduced motion class
        if (shouldReduce || reduceAnimations) {
            html.classList.add('reduce-motion');
        } else {
            html.classList.remove('reduce-motion');
        }

        // Add network-specific classes
        if (networkInfo.isSlow) {
            html.classList.add('slow-network');
        } else {
            html.classList.remove('slow-network');
        }

        if (networkInfo.isFast) {
            html.classList.add('fast-network');
        } else {
            html.classList.remove('fast-network');
        }
    }, [isMobile, isTouch, shouldReduce, reduceAnimations, networkInfo, optimizeForTouch]);

    // Optimize scroll performance
    const handleScroll = useCallback((e: Event) => {
        if (isMobile) {
            // Use passive listeners for better scroll performance
            e.preventDefault();
        }
    }, [isMobile]);

    useEffect(() => {
        if (isMobile) {
            document.addEventListener('scroll', handleScroll, { passive: true });
            return () => document.removeEventListener('scroll', handleScroll);
        }
    }, [isMobile, handleScroll]);

    return (
        <div
            className={`
                mobile-optimized-layout
                ${isMobile ? 'mobile' : 'desktop'}
                ${isTouch ? 'touch' : 'no-touch'}
                ${shouldReduce || reduceAnimations ? 'reduce-motion' : ''}
                ${networkInfo.isSlow ? 'slow-network' : ''}
                ${networkInfo.isFast ? 'fast-network' : ''}
                ${className}
            `}
            style={{
                // Optimize for mobile rendering
                ...(isMobile && {
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                }),
                // Reduce animations for better performance
                ...((shouldReduce || reduceAnimations) && {
                    animationDuration: '0.1s',
                    transitionDuration: '0.1s',
                }),
            }}
        >
            {children}
            
            {showMobileIndicator && isMobile && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                        Mobile
                    </div>
                </div>
            )}
        </div>
    );
}

// Mobile-optimized container component
interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
    padding?: 'none' | 'small' | 'medium' | 'large';
}

export function MobileContainer({
    children,
    className = '',
    fullWidth = false,
    padding = 'medium'
}: MobileContainerProps) {
    const paddingClasses = {
        none: '',
        small: 'p-2',
        medium: 'p-4 sm:p-6',
        large: 'p-6 sm:p-8'
    };

    return (
        <div
            className={`
                mobile-container
                ${fullWidth ? 'w-full' : 'max-w-full mx-auto'}
                ${paddingClasses[padding]}
                ${className}
            `}
            style={{
                maxWidth: fullWidth ? '100vw' : '100%',
                overflowX: 'hidden',
            }}
        >
            {children}
        </div>
    );
}

// Mobile-optimized grid component
interface MobileGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4 | 6;
    gap?: 'none' | 'small' | 'medium' | 'large';
    className?: string;
}

export function MobileGrid({
    children,
    columns = 1,
    gap = 'medium',
    className = ''
}: MobileGridProps) {
    const gapClasses = {
        none: '',
        small: 'gap-2',
        medium: 'gap-4',
        large: 'gap-6'
    };

    const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
    };

    return (
        <div
            className={`
                grid
                ${columnClasses[columns]}
                ${gapClasses[gap]}
                ${className}
            `}
        >
            {children}
        </div>
    );
}

// Mobile-optimized card component
interface MobileCardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
    compact?: boolean;
}

export function MobileCard({
    children,
    className = '',
    interactive = false,
    compact = false
}: MobileCardProps) {
    return (
        <div
            className={`
                bg-card
                border
                border-border
                rounded-lg
                shadow-sm
                ${compact ? 'p-3' : 'p-4 sm:p-6'}
                ${interactive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
                ${className}
            `}
            style={{
                // Optimize for mobile touch
                minHeight: interactive ? '44px' : 'auto',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            {children}
        </div>
    );
}

// Mobile-optimized button component
interface MobileButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    className?: string;
    disabled?: boolean;
    loading?: boolean;
}

export function MobileButton({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    className = '',
    disabled = false,
    loading = false
}: MobileButtonProps) {
    const variantClasses = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground'
    };

    const sizeClasses = {
        small: 'px-3 py-2 text-sm',
        medium: 'px-4 py-2',
        large: 'px-6 py-3 text-lg'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                inline-flex
                items-center
                justify-center
                rounded-md
                font-medium
                transition-colors
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
                disabled:opacity-50
                disabled:pointer-events-none
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${className}
            `}
            style={{
                // Ensure minimum touch target size
                minHeight: '44px',
                minWidth: '44px',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            )}
            {children}
        </button>
    );
}
