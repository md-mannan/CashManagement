import { getExchangeRateForTransaction } from '@/services/exchangeRateService';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useCallback, useEffect, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { RefreshCw } from 'lucide-react';

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
    const { user_preferences } = usePage<
        SharedData & {
            user_preferences: {
                primary_currency: string;
                secondary_currency: string;
                primary_symbol: string;
                secondary_symbol: string;
                exchange_rate: string;
            };
        }
    >().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<CurrencyForm>>({
        primary_currency: user_preferences.primary_currency || 'USD',
        secondary_currency: user_preferences.secondary_currency || 'EUR',
        primary_symbol: user_preferences.primary_symbol || '$',
        secondary_symbol: user_preferences.secondary_symbol || '€',
        exchange_rate: user_preferences.exchange_rate || '1.0',
    });

    const [isLoadingRate, setIsLoadingRate] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('settings.currency.update'), {
            preserveScroll: true,
        });
    };

    const handlePrimaryCurrencyChange = (value: string) => {
        const currency = currencies.find((c) => c.code === value);
        setData('primary_currency', value);
        if (currency) {
            setData('primary_symbol', currency.symbol);
        }
        // Fetch live exchange rate when currency changes
        fetchLiveExchangeRate(data.secondary_currency, value);
    };

    const handleSecondaryCurrencyChange = (value: string) => {
        const currency = currencies.find((c) => c.code === value);
        setData('secondary_currency', value);
        if (currency) {
            setData('secondary_symbol', currency.symbol);
        }
        // Fetch live exchange rate when currency changes
        fetchLiveExchangeRate(value, data.primary_currency);
    };

    const fetchLiveExchangeRate = useCallback(
        async (from: string, to: string) => {
            if (!from || !to || from === to) return;

            setIsLoadingRate(true);
            try {
                // Use your existing exchange rate service
                const rate = await getExchangeRateForTransaction(from, to);

                setData('exchange_rate', rate.toFixed(4));
            } catch (error) {
            } finally {
                setIsLoadingRate(false);
            }
        },
        [setData],
    );

    // Auto-fetch exchange rate when both currencies are selected
    useEffect(() => {
        if (data.primary_currency && data.secondary_currency && data.primary_currency !== data.secondary_currency) {
            fetchLiveExchangeRate(data.secondary_currency, data.primary_currency);
        }
    }, [data.primary_currency, data.secondary_currency, fetchLiveExchangeRate]);

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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="exchange_rate" className="flex items-center gap-2">
                                    Exchange Rate (1 {data.secondary_currency} = ? {data.primary_currency})
                                    <span className="text-xs font-medium text-green-600">📈</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    {isLoadingRate && (
                                        <div className="flex items-center gap-1 text-xs text-blue-600">
                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                            <span>Fetching...</span>
                                        </div>
                                    )}
                                    {data.secondary_currency && data.primary_currency && (
                                        <button
                                            type="button"
                                            onClick={() => fetchLiveExchangeRate(data.secondary_currency, data.primary_currency)}
                                            disabled={isLoadingRate}
                                            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                                            title="Refresh exchange rate"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
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
                                disabled={isLoadingRate}
                            />
                            <p className="text-sm text-muted-foreground">Set the current exchange rate between your currencies</p>
                            <InputError className="mt-2" message={errors.exchange_rate} />
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
