// Performance optimization utilities for mobile responsiveness and fast workflow

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
): IntersectionObserver {
    return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
    });
}

// Virtual scrolling helper
export function calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number
): { startIndex: number; endIndex: number; visibleItems: number } {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(startIndex + visibleItems + 1, totalItems);
    
    return {
        startIndex: Math.max(0, startIndex - 1),
        endIndex,
        visibleItems,
    };
}

// Mobile detection
export function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) ||
        window.innerWidth < 768
    );
}

// Touch device detection
export function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
    );
}

// Optimize images for mobile
export function getOptimizedImageUrl(url: string, width: number = 400): string {
    // Add image optimization parameters
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=80&format=webp`;
}

// Preload critical resources
export function preloadResource(href: string, as: string = 'fetch'): void {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
}

// Optimize table rendering for mobile
export function optimizeTableForMobile(
    data: any[],
    columns: string[],
    mobileBreakpoint: number = 768
): { desktopData: any[]; mobileData: any[] } {
    if (typeof window === 'undefined' || window.innerWidth >= mobileBreakpoint) {
        return { desktopData: data, mobileData: data };
    }
    
    // For mobile, limit the number of columns and items
    const mobileColumns = columns.slice(0, 3); // Show only first 3 columns on mobile
    const mobileData = data.slice(0, 10); // Show only first 10 items on mobile
    
    return {
        desktopData: data,
        mobileData: mobileData.map(item => {
            const mobileItem: any = {};
            mobileColumns.forEach(col => {
                mobileItem[col] = item[col];
            });
            return mobileItem;
        }),
    };
}

// Cache management
export class SimpleCache {
    private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    
    set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }
    
    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    clear(): void {
        this.cache.clear();
    }
}

// Memory management
export function cleanupMemory(): void {
    if (typeof window === 'undefined') return;
    
    // Clear unused event listeners
    // Clear unused timeouts
    // Clear unused intervals
    // Force garbage collection if available
    if ('gc' in window) {
        (window as any).gc();
    }
}

// Network optimization
export function getNetworkInfo(): { isSlow: boolean; isFast: boolean } {
    if (typeof navigator === 'undefined') {
        return { isSlow: false, isFast: true };
    }
    
    const connection = (navigator as any).connection;
    if (!connection) {
        return { isSlow: false, isFast: true };
    }
    
    const isSlow = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
    const isFast = connection.effectiveType === '4g';
    
    return { isSlow, isFast };
}

// Responsive breakpoints
export const BREAKPOINTS = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS {
    if (typeof window === 'undefined') return 'lg';
    
    const width = window.innerWidth;
    
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
}

// Optimize animations for mobile
export function shouldReduceMotion(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Optimize for battery saving mode
export function isLowPowerMode(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    return (navigator as any).getBattery?.()?.then((battery: any) => {
        return battery.level < 0.2 || battery.charging === false;
    }) || false;
}
