import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast';
import { type SharedData } from '@/types';
import axios from '@/lib/axios';

type SetupForm = {
    app_name: string;
    logo: File | null;

    primary_currency: string;
    primary_symbol: string;
    secondary_currency: string;
    secondary_symbol: string;

    exchange_api_base_url: string;
    exchange_api_key: string;

    db_host: string;
    db_port: string;
    db_database: string;
    db_username: string;
    db_password: string;

    super_admin_name: string;
    super_admin_email: string;
    super_admin_password: string;
    super_admin_password_confirmation: string;
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

export default function SetupWizard() {
    const { addToast } = useToast();
    const { defaults } = usePage<SharedData & { defaults: Partial<SetupForm> }>().props;

    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const { data, setData, post, processing, errors } = useForm<SetupForm>({
        app_name: defaults?.app_name ?? 'Cash Management System',
        logo: null,

        primary_currency: defaults?.primary_currency ?? 'BDT',
        primary_symbol: defaults?.primary_symbol ?? '৳',
        secondary_currency: defaults?.secondary_currency ?? 'KWD',
        secondary_symbol: defaults?.secondary_symbol ?? 'د.ك',

        exchange_api_base_url: defaults?.exchange_api_base_url ?? '',
        exchange_api_key: '',

        db_host: defaults?.db_host ?? '127.0.0.1',
        db_port: defaults?.db_port ?? '3306',
        db_database: defaults?.db_database ?? '',
        db_username: defaults?.db_username ?? '',
        db_password: '',

        super_admin_name: '',
        super_admin_email: '',
        super_admin_password: '',
        super_admin_password_confirmation: '',
    });

    const stepTitle = useMemo(() => {
        switch (step) {
            case 1:
                return 'App branding';
            case 2:
                return 'Currency settings';
            case 3:
                return 'Exchange-rate API';
            case 4:
                return 'Database connection';
            case 5:
                return 'Create Super Admin';
            default:
                return 'Setup';
        }
    }, [step]);

    const canGoBack = step > 1 && !processing;
    const canGoNext = step < totalSteps && !processing;

    const validateStep = (s: number): boolean => {
        const missing: string[] = [];

        const req = (value: string, label: string) => {
            if (!String(value ?? '').trim()) missing.push(label);
        };

        if (s === 1) {
            req(data.app_name, 'App name');
        }

        if (s === 2) {
            req(data.primary_currency, 'Primary currency');
            req(data.primary_symbol, 'Primary symbol');
            req(data.secondary_currency, 'Secondary currency');
            req(data.secondary_symbol, 'Secondary symbol');
        }

        if (s === 3) {
            req(data.exchange_api_base_url, 'Exchange API base URL');
            req(data.exchange_api_key, 'Exchange API key');
        }

        if (s === 4) {
            req(data.db_host, 'DB host');
            req(data.db_port, 'DB port');
            req(data.db_database, 'DB name');
            req(data.db_username, 'DB username');
        }

        if (s === 5) {
            req(data.super_admin_name, 'Super Admin name');
            req(data.super_admin_email, 'Super Admin email');
            req(data.super_admin_password, 'Password');
            req(data.super_admin_password_confirmation, 'Confirm password');
            if (
                String(data.super_admin_password ?? '') &&
                String(data.super_admin_password_confirmation ?? '') &&
                data.super_admin_password !== data.super_admin_password_confirmation
            ) {
                missing.push('Passwords do not match');
            }
        }

        if (missing.length) {
            addToast({
                type: 'error',
                title: 'Please complete required fields',
                message: missing.slice(0, 4).join(', ') + (missing.length > 4 ? '…' : ''),
            });
            return false;
        }

        return true;
    };

    const next = () => {
        if (!canGoNext) return;
        if (!validateStep(step)) return;
        setStep((s) => Math.min(totalSteps, s + 1));
    };
    const back = () => canGoBack && setStep((s) => Math.max(1, s - 1));

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

    const [testingDb, setTestingDb] = useState(false);
    const testDb = async () => {
        if (testingDb) return;
        setTestingDb(true);
        try {
            await axios.post(route('setup.db-test'), {
                db_host: data.db_host,
                db_port: data.db_port,
                db_database: data.db_database,
                db_username: data.db_username,
                db_password: data.db_password,
            });
            addToast({ type: 'success', title: 'DB connection OK', message: 'Database connection succeeded.' });
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.errors?.db?.[0] ||
                e?.response?.data?.errors?.db_host?.[0] ||
                'Database connection failed.';
            addToast({ type: 'error', title: 'DB connection failed', message: String(msg) });
        } finally {
            setTestingDb(false);
        }
    };

    const submit = () => {
        if (!validateStep(5)) return;
        post(route('setup.store'), {
            forceFormData: true,
            onSuccess: () => {
                addToast({ type: 'success', title: 'Setup completed', message: 'Redirecting to dashboard…' });
            },
        });
    };

    return (
        <>
            <Head title="Setup" />
            <div className="min-h-svh bg-muted/30 p-4 md:p-8">
                <div className="mx-auto w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Initial Setup</CardTitle>
                            <CardDescription>
                                Complete setup to start using the application. Step {step} of {totalSteps}: {stepTitle}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Stepper */}
                            <div className="flex items-center gap-2 text-sm">
                                {Array.from({ length: totalSteps }).map((_, i) => {
                                    const idx = i + 1;
                                    const active = idx === step;
                                    const done = idx < step;
                                    return (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div
                                                className={[
                                                    'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
                                                    done ? 'bg-primary text-primary-foreground border-primary' : '',
                                                    active ? 'border-primary text-primary' : 'text-muted-foreground',
                                                ].join(' ')}
                                            >
                                                {idx}
                                            </div>
                                            {idx !== totalSteps && <div className="h-px w-6 bg-border" />}
                                        </div>
                                    );
                                })}
                            </div>

                            <Separator />

                            {/* Step content */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="app_name">App name</Label>
                                        <Input
                                            id="app_name"
                                            value={data.app_name}
                                            onChange={(e) => setData('app_name', e.target.value)}
                                            placeholder="Cash Management System"
                                        />
                                        <InputError message={(errors as any).app_name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logo">Logo (optional)</Label>
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={(e) => setData('logo', e.target.files?.[0] ?? null)}
                                        />
                                        <InputError message={(errors as any).logo} />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Primary currency</Label>
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
                                        <InputError message={(errors as any).primary_currency} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Primary symbol</Label>
                                        <Input value={data.primary_symbol} onChange={(e) => setData('primary_symbol', e.target.value)} />
                                        <InputError message={(errors as any).primary_symbol} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secondary currency</Label>
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
                                        <InputError message={(errors as any).secondary_currency} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secondary symbol</Label>
                                        <Input value={data.secondary_symbol} onChange={(e) => setData('secondary_symbol', e.target.value)} />
                                        <InputError message={(errors as any).secondary_symbol} />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Exchange API base URL</Label>
                                        <Input
                                            value={data.exchange_api_base_url}
                                            onChange={(e) => setData('exchange_api_base_url', e.target.value)}
                                            placeholder="https://api.example.com"
                                        />
                                        <InputError message={(errors as any).exchange_api_base_url} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Exchange API key</Label>
                                        <Input
                                            value={data.exchange_api_key}
                                            onChange={(e) => setData('exchange_api_key', e.target.value)}
                                            placeholder="Your API key"
                                        />
                                        <InputError message={(errors as any).exchange_api_key} />
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>DB host</Label>
                                            <Input value={data.db_host} onChange={(e) => setData('db_host', e.target.value)} />
                                            <InputError message={(errors as any).db_host} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>DB port</Label>
                                            <Input value={data.db_port} onChange={(e) => setData('db_port', e.target.value)} />
                                            <InputError message={(errors as any).db_port} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>DB name</Label>
                                            <Input value={data.db_database} onChange={(e) => setData('db_database', e.target.value)} />
                                            <InputError message={(errors as any).db_database} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>DB username</Label>
                                            <Input value={data.db_username} onChange={(e) => setData('db_username', e.target.value)} />
                                            <InputError message={(errors as any).db_username} />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>DB password</Label>
                                            <Input
                                                type="password"
                                                value={data.db_password}
                                                onChange={(e) => setData('db_password', e.target.value)}
                                            />
                                            <InputError message={(errors as any).db_password} />
                                            <InputError message={(errors as any).db} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <Button type="button" variant="outline" onClick={testDb} disabled={testingDb}>
                                            {testingDb ? 'Testing…' : 'Test connection'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Super Admin name</Label>
                                        <Input value={data.super_admin_name} onChange={(e) => setData('super_admin_name', e.target.value)} />
                                        <InputError message={(errors as any).super_admin_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Super Admin email</Label>
                                        <Input
                                            type="email"
                                            value={data.super_admin_email}
                                            onChange={(e) => setData('super_admin_email', e.target.value)}
                                        />
                                        <InputError message={(errors as any).super_admin_email} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Password</Label>
                                            <Input
                                                type="password"
                                                value={data.super_admin_password}
                                                onChange={(e) => setData('super_admin_password', e.target.value)}
                                            />
                                            <InputError message={(errors as any).super_admin_password} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Confirm password</Label>
                                            <Input
                                                type="password"
                                                value={data.super_admin_password_confirmation}
                                                onChange={(e) => setData('super_admin_password_confirmation', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between gap-3">
                                <Button type="button" variant="outline" onClick={back} disabled={!canGoBack}>
                                    Back
                                </Button>
                                <div className="flex items-center gap-2">
                                    {step < totalSteps ? (
                                        <Button type="button" onClick={next} disabled={!canGoNext}>
                                            Next
                                        </Button>
                                    ) : (
                                        <Button type="button" onClick={submit} disabled={processing}>
                                            {processing ? 'Saving…' : 'Finish setup'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

