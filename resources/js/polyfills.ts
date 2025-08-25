/**
 * Browser Polyfills for older browser support
 * 
 * This file loads polyfills conditionally based on browser support
 * to ensure the application works on older browsers while keeping
 * the bundle size minimal for modern browsers.
 */

// Import core-js polyfills for ES6+ features
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Check for and polyfill missing features
(function() {
    // Polyfill for fetch() API
    if (!window.fetch) {
        import('whatwg-fetch');
    }

    // Polyfill for Promise (if needed)
    if (!window.Promise) {
        import('core-js/features/promise');
    }

    // Polyfill for Object.assign
    if (!Object.assign) {
        import('core-js/features/object/assign');
    }

    // Polyfill for Array methods
    if (!Array.prototype.includes) {
        import('core-js/features/array/includes');
    }

    if (!Array.prototype.find) {
        import('core-js/features/array/find');
    }

    if (!Array.prototype.findIndex) {
        import('core-js/features/array/find-index');
    }

    // Polyfill for String methods
    if (!String.prototype.includes) {
        import('core-js/features/string/includes');
    }

    if (!String.prototype.startsWith) {
        import('core-js/features/string/starts-with');
    }

    if (!String.prototype.endsWith) {
        import('core-js/features/string/ends-with');
    }

    // Polyfill for URL API
    if (!window.URL || !window.URLSearchParams) {
        import('core-js/features/url');
        import('core-js/features/url-search-params');
    }

    // Polyfill for IntersectionObserver (used by some UI libraries)
    if (!window.IntersectionObserver) {
        import('intersection-observer');
    }

    // Polyfill for ResizeObserver (used by some chart libraries)
    if (!window.ResizeObserver) {
        import('@juggle/resize-observer').then(module => {
            window.ResizeObserver = module.ResizeObserver;
        });
    }

    // Polyfill for CSS.supports (for feature detection)
    if (!window.CSS || !window.CSS.supports) {
        // Simple fallback for CSS.supports
        if (!window.CSS) {
            window.CSS = {};
        }
        if (!window.CSS.supports) {
            window.CSS.supports = function() {
                return false; // Conservative fallback
            };
        }
    }

    // Polyfill for Element.closest (used by some UI interactions)
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(selector) {
            let el = this;
            while (el) {
                if (el.matches(selector)) {
                    return el;
                }
                el = el.parentElement;
            }
            return null;
        };
    }

    // Polyfill for Element.matches
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                    Element.prototype.webkitMatchesSelector;
    }

    // Polyfill for CustomEvent
    if (!window.CustomEvent) {
        window.CustomEvent = function(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
    }

    console.log('🔧 Browser polyfills loaded');
})();
