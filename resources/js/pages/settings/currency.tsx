import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Currency settings',
        href: '/settings/currency',
    },
];

type CurrencyForm = {
    primary_currency: string;
    secondary_currency: string;
    primary_symbol: string;
    secondary_symbol: string;
    exchange_rate: string;
};

const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
];

export default function Currency() {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<CurrencyForm>>({
        primary_currency: auth.user.primary_currency || 'USD',
        secondary_currency: auth.user.secondary_currency || 'EUR',
        primary_symbol: auth.user.primary_symbol || '$',
        secondary_symbol: auth.user.secondary_symbol || '€',
        exchange_rate: auth.user.exchange_rate || '1.0',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('currency.update'), {
            preserveScroll: true,
        });
    };

    const handlePrimaryCurrencyChange = (value: string) => {
        const currency = currencies.find((c) => c.code === value);
        setData('primary_currency', value);
        if (currency) {
            setData('primary_symbol', currency.symbol);
        }
    };

    const handleSecondaryCurrencyChange = (value: string) => {
        const currency = currencies.find((c) => c.code === value);
        setData('secondary_currency', value);
        if (currency) {
            setData('secondary_symbol', currency.symbol);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Currency settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Currency preferences"
                        description="Set your primary and secondary currencies for financial transactions and reporting"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Primary Currency */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primary_currency">Primary Currency</Label>
                                    <Select value={data.primary_currency} onValueChange={handlePrimaryCurrencyChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select primary currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem key={currency.code} value={currency.code}>
                                                    {currency.code} - {currency.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError className="mt-2" message={errors.primary_currency} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="primary_symbol">Currency Symbol</Label>
                                    <Input
                                        id="primary_symbol"
                                        className="mt-1 block w-full"
                                        value={data.primary_symbol}
                                        onChange={(e) => setData('primary_symbol', e.target.value)}
                                        required
                                        placeholder="Currency symbol"
                                    />
                                    <InputError className="mt-2" message={errors.primary_symbol} />
                                </div>
                            </div>

                            {/* Secondary Currency */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="secondary_currency">Secondary Currency</Label>
                                    <Select value={data.secondary_currency} onValueChange={handleSecondaryCurrencyChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select secondary currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem key={currency.code} value={currency.code}>
                                                    {currency.code} - {currency.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError className="mt-2" message={errors.secondary_currency} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="secondary_symbol">Currency Symbol</Label>
                                    <Input
                                        id="secondary_symbol"
                                        className="mt-1 block w-full"
                                        value={data.secondary_symbol}
                                        onChange={(e) => setData('secondary_symbol', e.target.value)}
                                        required
                                        placeholder="Currency symbol"
                                    />
                                    <InputError className="mt-2" message={errors.secondary_symbol} />
                                </div>
                            </div>
                        </div>

                        {/* Exchange Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="exchange_rate">
                                Exchange Rate (1 {data.primary_currency} = ? {data.secondary_currency})
                            </Label>
                            <Input
                                id="exchange_rate"
                                type="number"
                                step="0.0001"
                                min="0"
                                className="mt-1 block w-full"
                                value={data.exchange_rate}
                                onChange={(e) => setData('exchange_rate', e.target.value)}
                                required
                                placeholder="1.0"
                            />
                            <p className="text-sm text-muted-foreground">
                                Set the current exchange rate between your primary and secondary currencies
                            </p>
                            <InputError className="mt-2" message={errors.exchange_rate} />
                        </div>

                        {/* Currency Preview */}
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <h4 className="mb-3 font-medium">Currency Preview</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Primary Currency</p>
                                    <p className="text-lg">
                                        {data.primary_symbol}1,000.{data.primary_currency === 'KWD' ? '000' : '00'} {data.primary_currency}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Secondary Currency</p>
                                    <p className="text-lg">
                                        {data.secondary_symbol}
                                        {(parseFloat(data.exchange_rate) * 1000).toFixed(data.secondary_currency === 'KWD' ? 3 : 2)}{' '}
                                        {data.secondary_currency}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save Currency Settings</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
