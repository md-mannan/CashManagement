import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Layout from '@/layouts/settings/layout';

interface User {
    exchange_rate_api_key?: string;
    exchange_rate_api_provider?: string;
}

interface Props {
    user: User;
    providers: Record<string, string>;
}

export default function ExchangeRate({ user, providers }: Props) {
    const {
        data,
        setData,
        patch,
        delete: destroy,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm({
        exchange_rate_api_key: user.exchange_rate_api_key || '',
        exchange_rate_api_provider: user.exchange_rate_api_provider || 'exchangerate-api.com',
    });

    const [testResult, setTestResult] = useState<{ success: boolean; message: string; sample_rate?: any } | null>(null);
    const [testing, setTesting] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('exchange-rate.update'), {
            onSuccess: () => {
                setTestResult(null);
            },
        });
    };

    const testApiKey = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch(route('exchange-rate.test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Failed to test API key. Please try again.',
            });
        } finally {
            setTesting(false);
        }
    };

    const clearApiKey = () => {
        destroy(route('exchange-rate.destroy'), {
            onSuccess: () => {
                setTestResult(null);
                reset('exchange_rate_api_key');
            },
        });
    };

    const getProviderInfo = (provider: string) => {
        switch (provider) {
            case 'exchangerate-api.com':
                return {
                    name: 'ExchangeRate-API.com',
                    description: 'Free tier: 1,500 requests/month. Paid plans available.',
                    signupUrl: 'https://app.exchangerate-api.com/sign-up',
                    docUrl: 'https://www.exchangerate-api.com/docs',
                };
            case 'fixer.io':
                return {
                    name: 'Fixer.io',
                    description: 'Free tier: 100 requests/month. Paid plans available.',
                    signupUrl: 'https://fixer.io/signup/free',
                    docUrl: 'https://fixer.io/documentation',
                };
            case 'currencylayer.com':
                return {
                    name: 'CurrencyLayer.com',
                    description: 'Free tier: 1,000 requests/month. Paid plans available.',
                    signupUrl: 'https://currencylayer.com/signup/free',
                    docUrl: 'https://currencylayer.com/documentation',
                };
            default:
                return null;
        }
    };

    const providerInfo = getProviderInfo(data.exchange_rate_api_provider);

    return (
        <Layout>
            <Head title="Exchange Rate API Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Exchange Rate API</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Configure your exchange rate API provider and key for real-time currency conversion.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                        <CardDescription>
                            Set up your preferred exchange rate API provider. If no API key is provided, the system will use default fallback rates.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="exchange_rate_api_provider">API Provider</Label>
                                <Select
                                    value={data.exchange_rate_api_provider}
                                    onValueChange={(value) => setData('exchange_rate_api_provider', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an API provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(providers).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.exchange_rate_api_provider} />
                            </div>

                            {providerInfo && (
                                <Alert>
                                    <AlertDescription>
                                        <div className="space-y-2">
                                            <p>
                                                <strong>{providerInfo.name}:</strong> {providerInfo.description}
                                            </p>
                                            <div className="flex gap-4 text-sm">
                                                <a
                                                    href={providerInfo.signupUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Sign up for API key →
                                                </a>
                                                <a
                                                    href={providerInfo.docUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    View documentation →
                                                </a>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="exchange_rate_api_key">API Key (Optional)</Label>
                                <Input
                                    id="exchange_rate_api_key"
                                    type="password"
                                    value={data.exchange_rate_api_key}
                                    onChange={(e) => setData('exchange_rate_api_key', e.target.value)}
                                    placeholder="Enter your API key here..."
                                />
                                <InputError message={errors.exchange_rate_api_key} />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Leave empty to use default fallback rates. Providing an API key enables real-time exchange rates.
                                </p>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>

                                {data.exchange_rate_api_key && (
                                    <>
                                        <Button type="button" variant="outline" onClick={testApiKey} disabled={testing}>
                                            {testing ? 'Testing...' : 'Test API Key'}
                                        </Button>

                                        <Button type="button" variant="destructive" onClick={clearApiKey} disabled={processing}>
                                            Clear API Key
                                        </Button>
                                    </>
                                )}

                                {recentlySuccessful && <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully.</p>}
                            </div>
                        </form>

                        {testResult && (
                            <div className="mt-6">
                                <Alert
                                    className={
                                        testResult.success
                                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                    }
                                >
                                    <AlertDescription>
                                        <div className="space-y-2">
                                            <p
                                                className={
                                                    testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                                                }
                                            >
                                                {testResult.message}
                                            </p>
                                            {testResult.success && testResult.sample_rate && (
                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                    Sample rate: 1 {testResult.sample_rate.from} = {testResult.sample_rate.rate}{' '}
                                                    {testResult.sample_rate.to}
                                                </p>
                                            )}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>How it Works</CardTitle>
                        <CardDescription>Understanding the exchange rate system</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Data Flow</h4>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Exchange rates are fetched from your chosen API provider</li>
                                <li>• Rates are stored locally in the database for fast access</li>
                                <li>• Data is automatically refreshed every 5 minutes</li>
                                <li>• If API fails, the system falls back to cached or default rates</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Benefits</h4>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Real-time exchange rates for accurate conversions</li>
                                <li>• Centralized data management across all transactions</li>
                                <li>• Automatic fallback ensures system reliability</li>
                                <li>• Reduced API calls through intelligent caching</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
