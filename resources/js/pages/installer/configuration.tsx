import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, DollarSign, Globe, Settings, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function InstallerConfiguration() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isInstalling, setIsInstalling] = useState(false);
    const [dbConfig, setDbConfig] = useState<any>(null);

    const { data, setData, post, processing, errors } = useForm({
        // Database Configuration (retrieved from previous step)
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
        
        // Application Configuration
        app_name: 'Cash Management',
        app_url: window.location.origin,
        app_timezone: 'UTC',
        app_locale: 'en',
        
        // Currency Configuration
        default_currency: 'USD',
        default_secondary_currency: 'EUR',
        
        // Admin User Configuration
        admin_name: '',
        admin_email: '',
        admin_password: '',
        admin_password_confirmation: '',
        
        // Optional Settings
        enable_notifications: true,
        enable_activity_logging: true,
        enable_backup: true,
        enable_social_login: false,
    });

    useEffect(() => {
        // Retrieve database configuration from sessionStorage
        const storedDbConfig = sessionStorage.getItem('installer_db_config');
        if (storedDbConfig) {
            const parsed = JSON.parse(storedDbConfig);
            setDbConfig(parsed);
            setData({
                ...data,
                host: parsed.host,
                port: parsed.port,
                database: parsed.database,
                username: parsed.username,
                password: parsed.password,
            });
        }
    }, []);

    // Timezones, locales, and currencies arrays
    const timezones = [
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
        'Australia/Sydney', 'Pacific/Auckland'
    ];

    const locales = [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'
    ];

    const currencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'SGD'
    ];

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleInstall = async () => {
        if (!dbConfig) {
            alert('Database configuration not found. Please go back to the database step.');
            return;
        }

        setIsInstalling(true);

        try {
            const response = await fetch('/install/install', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                // Clear sessionStorage
                sessionStorage.removeItem('installer_db_config');
                window.location.href = result.redirect_url;
            } else {
                alert('Installation failed: ' + result.message);
            }
        } catch (error) {
            alert('Installation failed. Please try again.');
        } finally {
            setIsInstalling(false);
        }
    };

    const renderStep1 = () => (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Application Configuration
                </CardTitle>
                <CardDescription>Set up your application basic settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="app_name">Application Name</Label>
                    <Input
                        id="app_name"
                        type="text"
                        value={data.app_name}
                        onChange={(e) => setData('app_name', e.target.value)}
                        placeholder="Cash Management"
                        required
                    />
                    {errors.app_name && <p className="mt-1 text-sm text-red-500">{errors.app_name}</p>}
                </div>
                <div>
                    <Label htmlFor="app_url">Application URL</Label>
                    <Input
                        id="app_url"
                        type="url"
                        value={data.app_url}
                        onChange={(e) => setData('app_url', e.target.value)}
                        placeholder="https://example.com"
                        required
                    />
                    {errors.app_url && <p className="mt-1 text-sm text-red-500">{errors.app_url}</p>}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="app_timezone">Timezone</Label>
                        <Select value={data.app_timezone} onValueChange={(value) => setData('app_timezone', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                {timezones.map((tz) => (
                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.app_timezone && <p className="mt-1 text-sm text-red-500">{errors.app_timezone}</p>}
                    </div>
                    <div>
                        <Label htmlFor="app_locale">Locale</Label>
                        <Select value={data.app_locale} onValueChange={(value) => setData('app_locale', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select locale" />
                            </SelectTrigger>
                            <SelectContent>
                                {locales.map((locale) => (
                                    <SelectItem key={locale} value={locale}>{locale.toUpperCase()}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.app_locale && <p className="mt-1 text-sm text-red-500">{errors.app_locale}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderStep2 = () => (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Currency Configuration
                </CardTitle>
                <CardDescription>Set your default currencies for transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="default_currency">Primary Currency</Label>
                        <Select value={data.default_currency} onValueChange={(value) => setData('default_currency', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select primary currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map((currency) => (
                                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.default_currency && <p className="mt-1 text-sm text-red-500">{errors.default_currency}</p>}
                    </div>
                    <div>
                        <Label htmlFor="default_secondary_currency">Secondary Currency</Label>
                        <Select value={data.default_secondary_currency} onValueChange={(value) => setData('default_secondary_currency', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select secondary currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map((currency) => (
                                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.default_secondary_currency && <p className="mt-1 text-sm text-red-500">{errors.default_secondary_currency}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderStep3 = () => (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Administrator Account
                </CardTitle>
                <CardDescription>Create your super admin account. This user will have full access to the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="admin_name">Full Name</Label>
                        <Input
                            id="admin_name"
                            type="text"
                            value={data.admin_name}
                            onChange={(e) => setData('admin_name', e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                        {errors.admin_name && <p className="mt-1 text-sm text-red-500">{errors.admin_name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="admin_email">Email Address</Label>
                        <Input
                            id="admin_email"
                            type="email"
                            value={data.admin_email}
                            onChange={(e) => setData('admin_email', e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                        {errors.admin_email && <p className="mt-1 text-sm text-red-500">{errors.admin_email}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="admin_password">Password</Label>
                        <Input
                            id="admin_password"
                            type="password"
                            value={data.admin_password}
                            onChange={(e) => setData('admin_password', e.target.value)}
                            placeholder="Minimum 8 characters"
                            required
                        />
                        {errors.admin_password && <p className="mt-1 text-sm text-red-500">{errors.admin_password}</p>}
                    </div>
                    <div>
                        <Label htmlFor="admin_password_confirmation">Confirm Password</Label>
                        <Input
                            id="admin_password_confirmation"
                            type="password"
                            value={data.admin_password_confirmation}
                            onChange={(e) => setData('admin_password_confirmation', e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                        {errors.admin_password_confirmation && (
                            <p className="mt-1 text-sm text-red-500">{errors.admin_password_confirmation}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderOptionalSettings = () => (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-600" />
                    Optional Settings
                </CardTitle>
                <CardDescription>Configure additional features and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="enable_notifications"
                            checked={data.enable_notifications}
                            onChange={(e) => setData('enable_notifications', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="enable_notifications">Enable Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="enable_activity_logging"
                            checked={data.enable_activity_logging}
                            onChange={(e) => setData('enable_activity_logging', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="enable_activity_logging">Enable Activity Logging</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="enable_backup"
                            checked={data.enable_backup}
                            onChange={(e) => setData('enable_backup', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="enable_backup">Enable Backup</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="enable_social_login"
                            checked={data.enable_social_login}
                            onChange={(e) => setData('enable_social_login', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="enable_social_login">Enable Social Login</Label>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (!dbConfig) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="mx-auto max-w-4xl text-center">
                    <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">
                            Database configuration not found. Please go back to the database step.
                        </AlertDescription>
                    </Alert>
                    <div className="mt-4">
                        <a href="/install/database">
                            <Button variant="outline">Go to Database Step</Button>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Configuration - Cash Management Installer" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Application Configuration</h1>
                        <p className="text-lg text-gray-600">Configure your application settings and create your admin account</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8 flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">1</div>
                            <div className="h-1 w-16 bg-green-600"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">2</div>
                            <div className="h-1 w-16 bg-green-600"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</div>
                            <div className="h-1 w-16 bg-gray-300"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-gray-500">4</div>
                        </div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()}>
                        {/* Step Content */}
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}

                        {/* Optional Settings - Always Visible */}
                        {renderOptionalSettings()}

                        {/* Step Navigation */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                {currentStep > 1 && (
                                    <Button type="button" variant="outline" onClick={handlePrevious}>
                                        Previous
                                    </Button>
                                )}
                                {currentStep < 3 && (
                                    <Button type="button" onClick={handleNext}>
                                        Next
                                    </Button>
                                )}
                            </div>
                            
                            <div className="text-sm text-gray-500">
                                Step {currentStep} of 3
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <a href="/install/database">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Database
                                </Button>
                            </a>

                            {currentStep === 3 && (
                                <Button 
                                    onClick={handleInstall} 
                                    disabled={isInstalling || !data.admin_name || !data.admin_email || !data.admin_password || !data.admin_password_confirmation} 
                                    className="flex items-center gap-2"
                                >
                                    {isInstalling ? 'Installing...' : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Install Application
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Important Notes */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="text-yellow-600">Important Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Complete all required fields before proceeding</li>
                                <li>• Your admin account will have full system access</li>
                                <li>• You can modify these settings later from the admin panel</li>
                                <li>• The installation process may take a few minutes</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
