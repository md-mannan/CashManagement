import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/components/ui/toast';
import { useNotifications } from '@/hooks/use-notifications';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell, CheckCircle, LogOut, Settings, User, X } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { showToast } = useToast();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    // Debug logging

    const handleLogout = () => {
        showToast({
            type: 'success',
            title: 'Logged out',
            message: 'You have been logged out successfully.',
            sound: true,
        });
        router.post('/logout');
    };

    // Get color classes based on color name
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-500';
            case 'red':
                return 'bg-red-500';
            case 'yellow':
                return 'bg-yellow-500';
            case 'blue':
                return 'bg-blue-500';
            case 'purple':
                return 'bg-purple-500';
            case 'orange':
                return 'bg-orange-500';
            case 'indigo':
                return 'bg-indigo-500';
            case 'pink':
                return 'bg-pink-500';
            case 'teal':
                return 'bg-teal-500';
            default:
                return 'bg-blue-500';
        }
    };

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
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                        <div className="flex items-center justify-between p-2">
                            <h4 className="text-sm font-medium">Notifications</h4>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={markAllAsRead} disabled={unreadCount === 0}>
                                Mark all as read
                            </Button>
                        </div>
                        <div className="scrollbar-hide max-h-64 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
                            ) : (
                                notifications.map((notification, index) => {
                                    const isLast = index === notifications.length - 1;

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group relative p-3 hover:bg-accent/50 ${!isLast ? 'border-b border-border' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-2 h-2 w-2 rounded-full ${getColorClasses(notification.color)}`}></div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p
                                                                className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}
                                                            >
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                                                            <p className="mt-1 text-xs text-muted-foreground">{notification.time_ago}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                            {!notification.is_read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    title="Mark as read"
                                                                >
                                                                    <CheckCircle className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                                                onClick={() => deleteNotification(notification.id)}
                                                                title="Delete notification"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="border-t border-border p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => router.visit(route('admin.notifications.index'))}
                            >
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
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
