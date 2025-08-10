import { Link } from '@inertiajs/react';
import { BarChart3, Settings, Shield, Users } from 'lucide-react';

interface AdminNotificationProps {
    userRole: string;
    userPermissions: string[];
}

export function AdminNotification({ userRole, userPermissions }: AdminNotificationProps) {
    if (!['admin', 'super_admin'].includes(userRole)) {
        return null;
    }

    return (
        <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-100 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-800">Administrative Access</h3>
                    <p className="mt-1 text-xs text-blue-600">
                        You have {userPermissions.length} permissions as a {userRole.replace('_', ' ')}.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <Link
                            href="/admin/dashboard"
                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Users className="h-3 w-3" />
                            Admin Dashboard
                        </Link>
                        <Link
                            href="/admin/users"
                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Settings className="h-3 w-3" />
                            User Management
                        </Link>
                        <Link
                            href="/admin/analytics"
                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <BarChart3 className="h-3 w-3" />
                            Analytics
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
