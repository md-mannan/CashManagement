import { route as ziggyRoute } from 'ziggy-js';

/**
 * Use Ziggy route helper with runtime routes injected by Blade `@routes`.
 * This avoids needing to regenerate a static ziggy file after adding routes.
 */
export function route(name: string, params?: Record<string, any> | string | number, absolute?: boolean): string {
    const ziggy = typeof window !== 'undefined' ? (window as any).Ziggy : undefined;
    return ziggyRoute(name as any, params as any, absolute, ziggy);
}
