import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import ThemeSelector from '@/components/theme-selector';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    <div className="space-y-6">
                        <HeadingSmall 
                            title="Appearance mode" 
                            description="Choose how your application appears based on your system preferences" 
                        />
                        <AppearanceTabs />
                    </div>
                    
                    <div className="space-y-6">
                        <HeadingSmall 
                            title="Theme" 
                            description="Select a color theme for your application" 
                        />
                        <ThemeSelector />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
