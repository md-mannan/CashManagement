import { Ziggy } from '../ziggy';

declare global {
    interface Window {
        Ziggy: typeof Ziggy;
    }
}

// Make Ziggy available globally
if (typeof window !== 'undefined') {
    window.Ziggy = Ziggy;
}

// Route helper function
export function route(name: string, params?: Record<string, any>, absolute?: boolean): string {
    const route = Ziggy.routes[name];

    if (!route) {
        throw new Error(`Route "${name}" not found.`);
    }

    let uri = route.uri;

    // Replace route parameters
    if (params) {
        Object.keys(params).forEach((key) => {
            const value = params[key];
            uri = uri.replace(`{${key}}`, value);
        });
    }

    // Add query parameters
    const queryParams = { ...Ziggy.defaults };
    if (params) {
        Object.keys(params).forEach((key) => {
            if (!route.parameters?.includes(key)) {
                queryParams[key] = params[key];
            }
        });
    }

    const queryString = Object.keys(queryParams)
        .filter((key) => queryParams[key] !== undefined && queryParams[key] !== null)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');

    if (queryString) {
        uri += `?${queryString}`;
    }

    // Add base URL if absolute is true
    if (absolute) {
        return `${Ziggy.url}/${uri}`.replace(/\/+/g, '/');
    }

    return `/${uri}`.replace(/\/+/g, '/');
}

// Export Ziggy for use in other parts of the app
export { Ziggy };
