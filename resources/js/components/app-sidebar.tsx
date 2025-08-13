import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Bell, Crown, DollarSign, LayoutGrid, Receipt, Shield, Tag, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: { role?: string } } }>().props;
    const isAdmin = auth.user.role && ['admin', 'super_admin'].includes(auth.user.role);
    const isSuperAdmin = auth.user.role === 'super_admin';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Ledger',
            href: '/ledger',
            icon: Receipt,
        },
        {
            title: 'Transaction',
            href: '/transaction',
            icon: DollarSign,
        },
        {
            title: 'Categories',
            href: '/categories',
            icon: Tag,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
            icon: Shield,
        },
        {
            title: 'User Management',
            href: '/admin/users',
            icon: Users,
        },
        {
            title: 'Role & Permissions',
            href: '/admin/role-permission',
            icon: Shield,
        },
        {
            title: 'Notifications',
            href: route('admin.notifications.index'),
            icon: Bell,
        },
        {
            title: 'Analytics',
            href: '/admin/analytics',
            icon: BarChart3,
        },
        {
            title: 'All Transactions',
            href: '/transaction',
            icon: DollarSign,
        },
        {
            title: 'All Ledger',
            href: '/ledger',
            icon: Receipt,
        },
        {
            title: 'System Settings',
            href: '/settings',
            icon: Shield,
        },
    ];

    const superAdminNavItems: NavItem[] = [
        {
            title: 'Super Admin Panel',
            href: '/admin/super-admin',
            icon: Crown,
        },
        {
            title: 'System Audit',
            href: '/admin/super-admin/audit',
            icon: Shield,
        },
        {
            title: 'Activity Logs',
            href: '/admin/activity-logs',
            icon: Shield,
        },
        {
            title: 'System Health',
            href: '/admin/system-health',
            icon: Shield,
        },
        {
            title: 'Database Management',
            href: '/admin/database',
            icon: Shield,
        },
        {
            title: 'Backup & Restore',
            href: '/admin/backup',
            icon: Shield,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Platform" />
                {isAdmin && <NavMain items={adminNavItems} label="Administration" />}
                {isSuperAdmin && <NavMain items={superAdminNavItems} label="Super Admin" />}
            </SidebarContent>

            <SidebarFooter>{/* User profile moved to header */}</SidebarFooter>
        </Sidebar>
    );
}
