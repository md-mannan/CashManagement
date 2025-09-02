import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthSimpleLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex items-center gap-2 self-center font-medium">
                    <div className="flex h-16 w-16 items-center justify-center">
                        <AppLogoIcon className="size-16 fill-current text-primary" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">{children}</div>
            </div>
        </div>
    );
}
