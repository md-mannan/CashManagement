import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const page = usePage<SharedData>();
    const appName = page.props.name || 'Cash Management';
    const logoUrl = page.props.branding?.logoUrl ?? null;

    return (
        <div className="flex items-center gap-3">
            {logoUrl ? (
                <img src={logoUrl} alt={appName} className="h-10 w-10 rounded object-contain" />
            ) : (
                <AppLogoIcon className="font-display! size-10 fill-current text-primary" />
            )}
            <span className="font-display line-clamp-1 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-lg font-bold text-transparent">
                {appName}
            </span>
        </div>
    );
}
