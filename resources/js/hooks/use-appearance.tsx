import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
export type Theme = 'neutral' | 'violet';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
};

const applyTheme = (appearance: Appearance, theme: Theme = 'neutral') => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    // Remove all theme classes
    document.documentElement.classList.remove('theme-violet');

    // Add theme class if not neutral
    if (theme !== 'neutral') {
        document.documentElement.classList.add(`theme-${theme}`);
    }

    // Apply dark mode
    document.documentElement.classList.toggle('dark', isDark);
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    const currentTheme = (localStorage.getItem('theme') as Theme) || 'neutral';
    applyTheme(currentAppearance || 'system', currentTheme);
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'violet';

    applyTheme(savedAppearance, savedTheme);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');
    const [theme, setTheme] = useState<Theme>('violet');

    const updateAppearance = useCallback(
        (mode: Appearance) => {
            setAppearance(mode);

            // Store in localStorage for client-side persistence...
            localStorage.setItem('appearance', mode);

            // Store in cookie for SSR...
            setCookie('appearance', mode);

            applyTheme(mode, theme);
        },
        [theme],
    );

    const updateTheme = useCallback(
        (newTheme: Theme) => {
            setTheme(newTheme);

            // Store in localStorage for client-side persistence...
            localStorage.setItem('theme', newTheme);

            // Store in cookie for SSR...
            setCookie('theme', newTheme);

            applyTheme(appearance, newTheme);
        },
        [appearance],
    );

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        const savedTheme = (localStorage.getItem('theme') as Theme) || 'violet';

        setAppearance(savedAppearance || 'system');
        setTheme(savedTheme);
        updateAppearance(savedAppearance || 'system');

        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, [updateAppearance]);

    return { appearance, updateAppearance, theme, updateTheme } as const;
}
