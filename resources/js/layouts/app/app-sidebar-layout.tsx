import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

function SidebarLayoutContent({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs: BreadcrumbItem[] }) {
    return (
        <div className="flex h-svh min-h-0 w-full flex-1 overflow-hidden">
            <AppSidebar />
            <main
                className="!mx-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background !px-0 transition-[width] duration-200 ease-linear"
                data-slot="sidebar-inset"
            >
                <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <div className="min-h-0 flex-1">{children}</div>
                </div>
            </main>
        </div>
    );
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <SidebarLayoutContent breadcrumbs={breadcrumbs}>{children}</SidebarLayoutContent>
        </AppShell>
    );
}
