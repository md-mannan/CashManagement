import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

// Global route function declaration
declare global {
    function route(name: string, params?: Record<string, any> | string | number, absolute?: boolean): string;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    /** Module permission key from config/module_permissions.php */
    permission?: string;
}

export interface SharedData {
    name: string;
    appEntryPath?: string;
    quote: { message: string; author: string };
    auth: Auth;
    branding?: { logoUrl?: string | null };
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profile_photo?: string;
    email_verified_at: string | null;
    primary_currency?: string;
    secondary_currency?: string;
    primary_symbol?: string;
    secondary_symbol?: string;
    exchange_rate?: string;
    role?: string;
    permissions?: string[];
    /** Derived from role for navigation and checks (preferred over permissions). */
    effective_permissions?: string[];
    is_active?: boolean;
    last_login_at?: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
