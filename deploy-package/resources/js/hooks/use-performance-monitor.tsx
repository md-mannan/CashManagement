import { useEffect, useState, useCallback, useRef } from 'react';
import { getNetworkInfo, isMobileDevice, isTouchDevice } from '@/utils/performance';

interface PerformanceMetrics {
    fps: number;
    memoryUsage: number;
    networkSpeed: 'slow' | 'medium' | 'fast';
    deviceType: 'mobile' | 'desktop';
    touchCapable: boolean;
    loadTime: number;
    renderTime: number;
}

interface PerformanceMonitorOptions {
    enableFPSMonitoring?: boolean;
    enableMemoryMonitoring?: boolean;
    enableNetworkMonitoring?: boolean;
    enableLoadTimeMonitoring?: boolean;
    updateInterval?: number;
}

export function usePerformanceMonitor(options: PerformanceMonitorOptions = {}) {
    const {
        enableFPSMonitoring = true,
        enableMemoryMonitoring = true,
        enableNetworkMonitoring = true,
        enableLoadTimeMonitoring = true,
        updateInterval = 1000
    } = options;

    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        fps: 60,
        memoryUsage: 0,
        networkSpeed: 'fast',
        deviceType: 'desktop',
        touchCapable: false,
        loadTime: 0,
        renderTime: 0
    });

    const [isOptimized, setIsOptimized] = useState(false);
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const animationFrameRef = useRef<number>();

    // FPS monitoring
    const measureFPS = useCallback(() => {
        if (!enableFPSMonitoring) return;

        const currentTime = performance.now();
        frameCountRef.current++;

        if (currentTime - lastTimeRef.current >= 1000) {
            const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
            setMetrics(prev => ({ ...prev, fps }));
            frameCountRef.current = 0;
            lastTimeRef.current = currentTime;
        }

        animationFrameRef.current = requestAnimationFrame(measureFPS);
    }, [enableFPSMonitoring]);

    // Memory monitoring
    const measureMemory = useCallback(() => {
        if (!enableMemoryMonitoring || !('memory' in performance)) return;

        const memory = (performance as any).memory;
        const memoryUsage = Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
        setMetrics(prev => ({ ...prev, memoryUsage }));
    }, [enableMemoryMonitoring]);

    // Network monitoring
    const measureNetwork = useCallback(() => {
        if (!enableNetworkMonitoring) return;

        const networkInfo = getNetworkInfo();
        const networkSpeed = networkInfo.isSlow ? 'slow' : networkInfo.isFast ? 'fast' : 'medium';
        setMetrics(prev => ({ ...prev, networkSpeed }));
    }, [enableNetworkMonitoring]);

    // Load time monitoring
    const measureLoadTime = useCallback(() => {
        if (!enableLoadTimeMonitoring) return;

        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            setMetrics(prev => ({ ...prev, loadTime }));
        }
    }, [enableLoadTimeMonitoring]);

    // Device capabilities detection
    const detectDeviceCapabilities = useCallback(() => {
        const deviceType = isMobileDevice() ? 'mobile' : 'desktop';
        const touchCapable = isTouchDevice();
        setMetrics(prev => ({ ...prev, deviceType, touchCapable }));
    }, []);

    // Performance optimization recommendations
    const getOptimizationRecommendations = useCallback(() => {
        const recommendations: string[] = [];

        if (metrics.fps < 30) {
            recommendations.push('Low FPS detected. Consider reducing animations or optimizing rendering.');
        }

        if (metrics.memoryUsage > 80) {
            recommendations.push('High memory usage detected. Consider implementing memory cleanup.');
        }

        if (metrics.networkSpeed === 'slow') {
            recommendations.push('Slow network detected. Consider reducing data transfer or implementing caching.');
        }

        if (metrics.loadTime > 3000) {
            recommendations.push('Slow load time detected. Consider optimizing bundle size or implementing lazy loading.');
        }

        return recommendations;
    }, [metrics]);

    // Apply performance optimizations
    const applyOptimizations = useCallback(() => {
        const recommendations = getOptimizationRecommendations();
        
        if (recommendations.length > 0) {
            // Apply automatic optimizations
            if (metrics.fps < 30) {
                document.documentElement.classList.add('reduce-motion');
            }

            if (metrics.memoryUsage > 80) {
                // Trigger garbage collection if available
                if ('gc' in window) {
                    (window as any).gc();
                }
            }

            if (metrics.networkSpeed === 'slow') {
                document.documentElement.classList.add('slow-network');
            }

            setIsOptimized(true);
        }
    }, [metrics, getOptimizationRecommendations]);

    // Start monitoring
    useEffect(() => {
        detectDeviceCapabilities();

        if (enableFPSMonitoring) {
            measureFPS();
        }

        const interval = setInterval(() => {
            measureMemory();
            measureNetwork();
            measureLoadTime();
            applyOptimizations();
        }, updateInterval);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            clearInterval(interval);
        };
    }, [
        enableFPSMonitoring,
        enableMemoryMonitoring,
        enableNetworkMonitoring,
        enableLoadTimeMonitoring,
        updateInterval,
        measureFPS,
        measureMemory,
        measureNetwork,
        measureLoadTime,
        detectDeviceCapabilities,
        applyOptimizations
    ]);

    // Performance warning system
    const [warnings, setWarnings] = useState<string[]>([]);

    useEffect(() => {
        const newWarnings = getOptimizationRecommendations();
        setWarnings(newWarnings);
    }, [getOptimizationRecommendations]);

    // Performance score calculation
    const getPerformanceScore = useCallback(() => {
        let score = 100;

        // FPS penalty
        if (metrics.fps < 30) score -= 30;
        else if (metrics.fps < 50) score -= 15;

        // Memory penalty
        if (metrics.memoryUsage > 80) score -= 20;
        else if (metrics.memoryUsage > 60) score -= 10;

        // Network penalty
        if (metrics.networkSpeed === 'slow') score -= 15;

        // Load time penalty
        if (metrics.loadTime > 3000) score -= 20;
        else if (metrics.loadTime > 1000) score -= 10;

        return Math.max(0, score);
    }, [metrics]);

    return {
        metrics,
        warnings,
        isOptimized,
        performanceScore: getPerformanceScore(),
        getOptimizationRecommendations,
        applyOptimizations
    };
}

// Hook for monitoring component render performance
export function useRenderPerformance(componentName: string) {
    const renderStartRef = useRef(performance.now());
    const renderCountRef = useRef(0);

    useEffect(() => {
        const renderTime = performance.now() - renderStartRef.current;
        renderCountRef.current++;

        // Log slow renders in development
        if (process.env.NODE_ENV === 'development' && renderTime > 16) {
            console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }

        renderStartRef.current = performance.now();
    });

    return {
        renderCount: renderCountRef.current
    };
}

// Hook for monitoring API call performance
export function useAPIPerformance() {
    const [apiMetrics, setApiMetrics] = useState<{
        averageResponseTime: number;
        totalCalls: number;
        slowCalls: number;
    }>({
        averageResponseTime: 0,
        totalCalls: 0,
        slowCalls: 0
    });

    const trackAPICall = useCallback((responseTime: number) => {
        setApiMetrics(prev => {
            const totalCalls = prev.totalCalls + 1;
            const slowCalls = responseTime > 1000 ? prev.slowCalls + 1 : prev.slowCalls;
            const averageResponseTime = (prev.averageResponseTime * prev.totalCalls + responseTime) / totalCalls;

            return {
                averageResponseTime,
                totalCalls,
                slowCalls
            };
        });
    }, []);

    return {
        apiMetrics,
        trackAPICall
    };
}

// Hook for monitoring user interactions
export function useInteractionPerformance() {
    const [interactionMetrics, setInteractionMetrics] = useState<{
        clickLatency: number;
        scrollPerformance: number;
        touchLatency: number;
    }>({
        clickLatency: 0,
        scrollPerformance: 0,
        touchLatency: 0
    });

    const trackClick = useCallback((latency: number) => {
        setInteractionMetrics(prev => ({
            ...prev,
            clickLatency: latency
        }));
    }, []);

    const trackScroll = useCallback((performance: number) => {
        setInteractionMetrics(prev => ({
            ...prev,
            scrollPerformance: performance
        }));
    }, []);

    const trackTouch = useCallback((latency: number) => {
        setInteractionMetrics(prev => ({
            ...prev,
            touchLatency: latency
        }));
    }, []);

    return {
        interactionMetrics,
        trackClick,
        trackScroll,
        trackTouch
    };
}
