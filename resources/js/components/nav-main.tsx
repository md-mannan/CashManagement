import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label = 'Platform' }: { items: NavItem[]; label?: string }) {
    const page = usePage();

    const isActive = (href: string) => {
        const currentPath = page.url;
        const hrefPath = href;

        // Exact match for any path
        if (currentPath === hrefPath) {
            return true;
        }

        // For admin paths, use more restrictive matching
        if (href.startsWith('/admin/')) {
            const hrefParts = hrefPath.split('/').filter(Boolean);
            const currentParts = currentPath.split('/').filter(Boolean);

            // Only mark as active if this is the exact parent route
            // For example: /admin/super-admin should only be active when on /admin/super-admin
            // Not when on /admin/super-admin/audit
            if (currentParts.length === hrefParts.length) {
                return currentPath === hrefPath;
            }

            // Don't mark parent routes as active for child routes
            return false;
        }

        // For non-admin paths, use exact matching
        return currentPath === href;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
