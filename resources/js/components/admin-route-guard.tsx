import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Shield } from 'lucide-react';

interface AdminRouteGuardProps {
    requiredRole?: 'admin' | 'super_admin';
    children: React.ReactNode;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: string[];
}

interface PageProps {
    auth: {
        user: User;
    };
}

export function AdminRouteGuard({ requiredRole = 'admin', children }: AdminRouteGuardProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // Debug logging
    console.log('AdminRouteGuard: User data:', user);
    console.log('AdminRouteGuard: Required role:', requiredRole);
    console.log('AdminRouteGuard: User role:', user.role);

    // Super admin has access to everything
    if (user.role === 'super_admin') {
        console.log('AdminRouteGuard: User is super admin, granting access');
        return <>{children}</>;
    }

    // Check if user has the required role
    const hasAccess = ['admin', 'super_admin'].includes(user.role);
    const hasRequiredRole = user.role === requiredRole || user.role === 'super_admin';

    console.log('AdminRouteGuard: Has access:', hasAccess);
    console.log('AdminRouteGuard: Has required role:', hasRequiredRole);

    if (!hasAccess) {
        console.log('AdminRouteGuard: Access denied - user is not admin');
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Shield className="mx-auto h-16 w-16 text-gray-400" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
                    <p className="mt-2 text-gray-600">You don't have permission to access this area.</p>
                    <p className="mt-2 text-sm text-gray-500">Current role: {user.role}</p>
                    <Link
                        href="/dashboard"
                        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (requiredRole === 'super_admin' && !hasRequiredRole) {
        console.log('AdminRouteGuard: Insufficient privileges - super admin required');
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-16 w-16 text-orange-400" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">Insufficient Privileges</h1>
                    <p className="mt-2 text-gray-600">This area requires super admin access.</p>
                    <p className="mt-2 text-sm text-gray-500">Current role: {user.role}</p>
                    <Link
                        href="/admin/dashboard"
                        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        Go to Admin Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    console.log('AdminRouteGuard: Access granted');
    return <>{children}</>;
}
