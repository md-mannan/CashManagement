import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const fullName = auth.user?.name || 'Guest';
    const lastName = fullName.split(' ').pop() || 'Guest';

    return (
        <div className="flex items-center gap-4">
            <AppLogoIcon className="font-display! size-12 fill-current text-primary" />
            <span className="font-display bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl font-bold text-transparent">
                {lastName} Accounting
            </span>
        </div>
    );
}
