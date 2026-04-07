import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthSplitLayout({ children }: PropsWithChildren) {
    const page = usePage<SharedData>();
    const appName = page.props.name || 'Cash Management';
    return (
        <div className="flex min-h-svh">
            <div className="flex w-full flex-col lg:w-1/2">
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                    <div className="mx-auto w-full max-w-sm lg:w-full">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                                    <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-md">
                                        <AppLogoIcon className="size-16 fill-current text-primary" />
                                    </div>
                                </Link>

                                <div className="space-y-2 text-center">
                                    <h1 className="text-xl font-medium">Welcome back</h1>
                                    <p className="text-center text-sm text-muted-foreground">Enter your credentials to access your account</p>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 h-full w-full">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                                <AppLogoIcon className="h-12 w-12 fill-current text-primary" />
                            </div>
                            <div className="max-w-sm">
                                <h2 className="text-2xl font-semibold text-foreground">Welcome to {appName}</h2>
                                <p className="mt-2 text-sm text-muted-foreground">Manage your personal finances with ease and security.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
