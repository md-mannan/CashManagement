import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Archive,
    BarChart3,
    Crown,
    Database,
    DollarSign,
    FileText,
    LayoutGrid,
    Lock,
    Monitor,
    Receipt,
    Settings,
    Shield,
    Tag,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth, appEntryPath } = usePage<SharedData>().props;
    const user = auth.user;
    const perms = user?.effective_permissions ?? user?.permissions ?? [];
    const isSuperAdmin = user?.role === 'super_admin';
    const isAdminRole = !!(user?.role && ['admin', 'super_admin'].includes(user.role));

    const can = (key: string) => isSuperAdmin || perms.includes(key);

    const homeHref = appEntryPath ?? '/settings/profile';

    const platformNavDefs: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            permission: 'view_dashboard',
        },
        {
            title: 'Ledger',
            href: '/ledger',
            icon: Receipt,
            permission: 'access_ledger',
        },
        {
            title: 'Transaction',
            href: '/transactions',
            icon: DollarSign,
            permission: 'manage_transactions',
        },
        {
            title: 'Categories',
            href: '/categories',
            icon: Tag,
            permission: 'manage_categories',
        },
    ];

    const adminNavDefs: NavItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
            icon: Shield,
            permission: 'admin_dashboard',
        },
        {
            title: 'User Management',
            href: '/admin/users',
            icon: Users,
            permission: 'manage_users',
        },
        {
            title: 'Role & Permissions',
            href: '/admin/role-permission',
            icon: Lock,
            permission: 'manage_role_permissions',
        },
        {
            title: 'Analytics',
            href: '/admin/analytics',
            icon: BarChart3,
            permission: 'view_analytics',
        },
        {
            title: 'All Transactions',
            href: '/transactions',
            icon: DollarSign,
            permission: 'manage_transactions',
        },
        {
            title: 'All Ledger',
            href: '/ledger',
            icon: Receipt,
            permission: 'access_ledger',
        },
        {
            title: 'System Settings',
            href: '/admin/system-settings',
            icon: Settings,
            permission: 'manage_system_settings',
        },
    ];

    const superAdminNavDefs: NavItem[] = [
        {
            title: 'Super Admin Panel',
            href: '/admin/super-admin',
            icon: Crown,
            permission: 'super_admin_panel',
        },
        {
            title: 'System Audit',
            href: '/admin/super-admin/audit',
            icon: FileText,
            permission: 'system_audit',
        },
        {
            title: 'Activity Logs',
            href: '/admin/activity-logs',
            icon: Activity,
            permission: 'view_system_logs',
        },
        {
            title: 'System Health',
            href: '/admin/system-health',
            icon: Monitor,
            permission: 'system_health',
        },
        {
            title: 'Database Management',
            href: '/admin/database',
            icon: Database,
            permission: 'database_management',
        },
        {
            title: 'Backup & Restore',
            href: '/admin/backup',
            icon: Archive,
            permission: 'backup_restore',
        },
    ];

    const mainNavItems = platformNavDefs.filter((item) => !item.permission || can(item.permission));

    const showAdministration =
        isAdminRole && adminNavDefs.some((item) => item.permission && can(item.permission));
    const adminNavItems = adminNavDefs.filter((item) => !item.permission || can(item.permission));

    const showSuperAdmin =
        isSuperAdmin && superAdminNavDefs.some((item) => item.permission && can(item.permission));
    const superAdminNavItems = superAdminNavDefs.filter((item) => !item.permission || can(item.permission));

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {mainNavItems.length > 0 && <NavMain items={mainNavItems} label="Platform" />}
                {showAdministration && adminNavItems.length > 0 && <NavMain items={adminNavItems} label="Administration" />}
                {showSuperAdmin && superAdminNavItems.length > 0 && <NavMain items={superAdminNavItems} label="Super Admin" />}
            </SidebarContent>

            <SidebarFooter />
        </Sidebar>
    );
}
