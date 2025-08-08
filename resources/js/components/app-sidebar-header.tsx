import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell, LogOut, Settings, User } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 bg-sidebar px-6 shadow-[8px_3px_4px_rgba(0,0,0,0.08)] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                {/* Notification Panel */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-accent">
                            <Bell className="h-5 w-5" />
                            {/* Notification Badge */}
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                3
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                        <div className="flex items-center justify-between p-2">
                            <h4 className="text-sm font-medium">Notifications</h4>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                Mark all as read
                            </Button>
                        </div>
                        <div className="scrollbar-hide max-h-64 overflow-y-auto">
                            {/* Notification Items */}
                            <div className="border-b border-border p-3 hover:bg-accent/50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New message received</p>
                                        <p className="text-xs text-muted-foreground">You have a new message from John Doe</p>
                                        <p className="mt-1 text-xs text-muted-foreground">2 minutes ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-border p-3 hover:bg-accent/50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Task completed</p>
                                        <p className="text-xs text-muted-foreground">Your task "Update dashboard" has been completed</p>
                                        <p className="mt-1 text-xs text-muted-foreground">1 hour ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 hover:bg-accent/50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-yellow-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">System update</p>
                                        <p className="text-xs text-muted-foreground">System maintenance scheduled for tomorrow</p>
                                        <p className="mt-1 text-xs text-muted-foreground">3 hours ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-border p-3 hover:bg-accent/50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New feature available</p>
                                        <p className="text-xs text-muted-foreground">Dark mode has been enabled for your account</p>
                                        <p className="mt-1 text-xs text-muted-foreground">5 hours ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-border p-3 hover:bg-accent/50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-orange-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Security alert</p>
                                        <p className="text-xs text-muted-foreground">New login detected from a new device</p>
                                        <p className="mt-1 text-xs text-muted-foreground">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-border p-3 hover:bg-accent/50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-indigo-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Backup completed</p>
                                        <p className="text-xs text-muted-foreground">Your data has been successfully backed up</p>
                                        <p className="mt-1 text-xs text-muted-foreground">2 days ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-border p-3 hover:bg-accent/50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-pink-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Welcome message</p>
                                        <p className="text-xs text-muted-foreground">Welcome to your new dashboard!</p>
                                        <p className="mt-1 text-xs text-muted-foreground">1 week ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 hover:bg-accent/50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-2 h-2 w-2 rounded-full bg-teal-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Account verified</p>
                                        <p className="text-xs text-muted-foreground">Your email address has been verified</p>
                                        <p className="mt-1 text-xs text-muted-foreground">1 week ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-border p-2">
                            <Button variant="ghost" size="sm" className="w-full text-xs">
                                View all notifications
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

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
                        <DropdownMenuItem onClick={() => router.post('/logout')} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
