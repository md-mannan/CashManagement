import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { LogOut, Settings, User } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { addToast } = useToast();

    // Debug logging

    const handleLogout = () => {
        addToast({
            type: 'success',
            title: 'Logged out',
            message: 'You have been logged out successfully.',
        });
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm">
            <div className="flex h-16 min-w-0 items-center justify-between gap-2 px-2 sm:px-3 md:px-4">
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <SidebarTrigger className="shrink-0" />
                    <Separator orientation="vertical" className="h-4" />
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                {/* User Profile Dropdown - Avatar Only */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex h-10 w-10 items-center justify-center rounded-full p-0 hover:bg-accent">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                <AvatarFallback className="bg-blue-500 text-sm font-bold text-white">
                                    {auth.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        {/* User Info in Dropdown */}
                        <div className="mb-1 flex items-center gap-3 border-b border-border px-2 py-1.5">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                <AvatarFallback className="bg-blue-500 text-sm font-bold text-white">
                                    {auth.user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{auth.user?.name || 'User'}</span>
                                <span className="text-xs text-muted-foreground">{auth.user?.email || 'user@example.com'}</span>
                            </div>
                        </div>

                        <DropdownMenuItem onClick={() => router.get('/settings/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.get('/settings/appearance')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            </div>
        </header>
    );
}
