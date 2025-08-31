import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    Activity, 
    BarChart3, 
    Bell, 
    Crown, 
    Database, 
    DollarSign, 
    FileText, 
    HardDrive, 
    LayoutGrid, 
    Lock, 
    Receipt, 
    Settings, 
    Shield, 
    Tag, 
    Users,
    Archive,
    Monitor,
    Image
} from 'lucide-react';
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
            href: '/transactions',
            icon: DollarSign,
        },
        {
            title: 'Categories',
            href: '/categories',
            icon: Tag,
        },
        {
            title: 'Gallery',
            href: '/gallery',
            icon: Image,
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
            icon: Lock,
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
            href: '/transactions',
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
            icon: Settings,
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
            icon: FileText,
        },
        {
            title: 'Activity Logs',
            href: '/admin/activity-logs',
            icon: Activity,
        },
        {
            title: 'System Health',
            href: '/admin/system-health',
            icon: Monitor,
        },
        {
            title: 'Database Management',
            href: '/admin/database',
            icon: Database,
        },
        {
            title: 'Backup & Restore',
            href: '/admin/backup',
            icon: Archive,
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
