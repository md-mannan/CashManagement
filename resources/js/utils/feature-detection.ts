/**
 * Feature Detection Utilities
 * 
 * These utilities help detect browser capabilities and provide
 * graceful degradation for unsupported features.
 */

export const FeatureDetection = {
    /**
     * Check if CSS Grid is supported
     */
    supportsGrid(): boolean {
        return CSS.supports('display', 'grid');
    },

    /**
     * Check if CSS Flexbox is supported
     */
    supportsFlexbox(): boolean {
        return CSS.supports('display', 'flex') || CSS.supports('display', '-webkit-flex');
    },

    /**
     * Check if CSS Custom Properties (variables) are supported
     */
    supportsCustomProperties(): boolean {
        return CSS.supports('color', 'var(--test-var)');
    },

    /**
     * Check if modern color functions are supported (like oklch)
     */
    supportsModernColors(): boolean {
        return CSS.supports('color', 'oklch(50% 0.2 180)');
    },

    /**
     * Check if IntersectionObserver is supported
     */
    supportsIntersectionObserver(): boolean {
        return 'IntersectionObserver' in window;
    },

    /**
     * Check if ResizeObserver is supported
     */
    supportsResizeObserver(): boolean {
        return 'ResizeObserver' in window;
    },

    /**
     * Check if WebSocket is supported
     */
    supportsWebSocket(): boolean {
        return 'WebSocket' in window;
    },

    /**
     * Check if Service Workers are supported
     */
    supportsServiceWorker(): boolean {
        return 'serviceWorker' in navigator;
    },

    /**
     * Check if the Fetch API is supported
     */
    supportsFetch(): boolean {
        return 'fetch' in window;
    },

    /**
     * Check if ES6 Promises are supported
     */
    supportsPromises(): boolean {
        return 'Promise' in window;
    },

    /**
     * Check if ES6 Symbols are supported
     */
    supportsSymbols(): boolean {
        return typeof Symbol !== 'undefined';
    },

    /**
     * Check if ES6 Map/Set are supported
     */
    supportsMapSet(): boolean {
        return 'Map' in window && 'Set' in window;
    },

    /**
     * Check if touch events are supported (mobile detection)
     */
    supportsTouch(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * Check if the browser supports modern JavaScript features
     */
    supportsModernJS(): boolean {
        try {
            // Test for arrow functions, const/let, template literals
            new Function('const test = (x) => `${x}`;');
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Get a comprehensive browser support report
     */
    getBrowserSupport() {
        return {
            css: {
                grid: this.supportsGrid(),
                flexbox: this.supportsFlexbox(),
                customProperties: this.supportsCustomProperties(),
                modernColors: this.supportsModernColors(),
            },
            js: {
                promises: this.supportsPromises(),
                fetch: this.supportsFetch(),
                symbols: this.supportsSymbols(),
                mapSet: this.supportsMapSet(),
                modernSyntax: this.supportsModernJS(),
            },
            apis: {
                intersectionObserver: this.supportsIntersectionObserver(),
                resizeObserver: this.supportsResizeObserver(),
                webSocket: this.supportsWebSocket(),
                serviceWorker: this.supportsServiceWorker(),
            },
            device: {
                touch: this.supportsTouch(),
            }
        };
    },

    /**
     * Add feature detection classes to the document
     */
    addFeatureClasses(): void {
        const html = document.documentElement;
        const support = this.getBrowserSupport();

        // CSS feature classes
        html.classList.add(support.css.grid ? 'supports-grid' : 'no-grid');
        html.classList.add(support.css.flexbox ? 'supports-flexbox' : 'no-flexbox');
        html.classList.add(support.css.customProperties ? 'supports-css-vars' : 'no-css-vars');
        html.classList.add(support.css.modernColors ? 'supports-modern-colors' : 'no-modern-colors');

        // JavaScript feature classes
        html.classList.add(support.js.promises ? 'supports-promises' : 'no-promises');
        html.classList.add(support.js.fetch ? 'supports-fetch' : 'no-fetch');
        html.classList.add(support.js.modernSyntax ? 'supports-modern-js' : 'no-modern-js');

        // API feature classes
        html.classList.add(support.apis.webSocket ? 'supports-websocket' : 'no-websocket');
        html.classList.add(support.device.touch ? 'touch-device' : 'no-touch');

        console.log('🔍 Feature detection classes added:', support);
    }
};

// Initialize feature detection when the script loads
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            FeatureDetection.addFeatureClasses();
        });
    } else {
        FeatureDetection.addFeatureClasses();
    }
}
