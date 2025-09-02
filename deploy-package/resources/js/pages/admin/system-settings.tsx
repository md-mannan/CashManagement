import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Database, Globe, Lock, Mail, Settings as SettingsIcon, Shield } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'System Settings',
        href: '/admin/system-settings',
    },
];

export default function AdminSystemSettings() {
    const { systemSettings, userRole, userPermissions } = usePage<
        SharedData & {
            systemSettings: {
                general: {
                    site_name: string;
                    site_description: string;
                    maintenance_mode: boolean;
                    maintenance_message: string;
                    timezone: string;
                    date_format: string;
                };
                email: {
                    mail_driver: string;
                    mail_host: string;
                    mail_port: number;
                    mail_username: string;
                    mail_encryption: string;
                    mail_from_address: string;
                    mail_from_name: string;
                };
                database: {
                    connection: string;
                    host: string;
                    port: number;
                    database: string;
                    backup_enabled: boolean;
                    backup_frequency: string;
                    backup_retention: number;
                };
                security: {
                    session_lifetime: number;
                    password_min_length: number;
                    require_email_verification: boolean;
                    two_factor_enabled: boolean;
                    rate_limiting_enabled: boolean;
                    max_login_attempts: number;
                };
            };
        }
    >().props;

    const [activeTab, setActiveTab] = useState('general');

    const generalForm = useForm({
        site_name: systemSettings?.general?.site_name || '',
        site_description: systemSettings?.general?.site_description || '',
        maintenance_mode: systemSettings?.general?.maintenance_mode || false,
        maintenance_message: systemSettings?.general?.maintenance_message || '',
        timezone: systemSettings?.general?.timezone || 'UTC',
        date_format: systemSettings?.general?.date_format || 'Y-m-d',
    });

    const emailForm = useForm({
        mail_driver: systemSettings?.email?.mail_driver || 'smtp',
        mail_host: systemSettings?.email?.mail_host || '',
        mail_port: systemSettings?.email?.mail_port || 587,
        mail_username: systemSettings?.email?.mail_username || '',
        mail_encryption: systemSettings?.email?.mail_encryption || 'tls',
        mail_from_address: systemSettings?.email?.mail_from_address || '',
        mail_from_name: systemSettings?.email?.mail_from_name || '',
    });

    const databaseForm = useForm({
        connection: systemSettings?.database?.connection || 'mysql',
        host: systemSettings?.database?.host || '',
        port: systemSettings?.database?.port || 3306,
        database: systemSettings?.database?.database || '',
        backup_enabled: systemSettings?.database?.backup_enabled || false,
        backup_frequency: systemSettings?.database?.backup_frequency || 'daily',
        backup_retention: systemSettings?.database?.backup_retention || 30,
    });

    const securityForm = useForm({
        session_lifetime: systemSettings?.security?.session_lifetime || 120,
        password_min_length: systemSettings?.security?.password_min_length || 8,
        require_email_verification: systemSettings?.security?.require_email_verification || true,
        two_factor_enabled: systemSettings?.security?.two_factor_enabled || false,
        rate_limiting_enabled: systemSettings?.security?.rate_limiting_enabled || true,
        max_login_attempts: systemSettings?.security?.max_login_attempts || 5,
    });

    const handleGeneralSubmit = () => {
        generalForm.post('/admin/system-settings/general', {
            onSuccess: () => {
                // Show success message
            },
        });
    };

    const handleEmailSubmit = () => {
        emailForm.post('/admin/system-settings/email', {
            onSuccess: () => {
                // Show success message
            },
        });
    };

    const handleDatabaseSubmit = () => {
        databaseForm.post('/admin/system-settings/database', {
            onSuccess: () => {
                // Show success message
            },
        });
    };

    const handleSecuritySubmit = () => {
        securityForm.post('/admin/system-settings/security', {
            onSuccess: () => {
                // Show success message
            },
        });
    };

    const timezones = [
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
    ];

    const dateFormats = ['Y-m-d', 'd/m/Y', 'm/d/Y', 'd-m-Y', 'm-d-Y'];
    const backupFrequencies = ['hourly', 'daily', 'weekly', 'monthly'];

    return (
        <AdminRouteGuard userRole={userRole}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="System Settings" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                            <p className="text-muted-foreground">Manage system-wide configurations and settings</p>
                        </div>
                    </div>

                    {/* Settings Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general" className="flex items-center gap-2">
                                <SettingsIcon className="h-4 w-4" />
                                General
                            </TabsTrigger>
                            <TabsTrigger value="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="database" className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Database
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Security
                            </TabsTrigger>
                        </TabsList>

                        {/* General Settings */}
                        <TabsContent value="general" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        General Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="site_name">Site Name</Label>
                                            <Input
                                                id="site_name"
                                                value={generalForm.data.site_name}
                                                onChange={(e) => generalForm.setData('site_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <Select
                                                value={generalForm.data.timezone}
                                                onValueChange={(value) => generalForm.setData('timezone', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timezones.map((tz) => (
                                                        <SelectItem key={tz} value={tz}>
                                                            {tz}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="site_description">Site Description</Label>
                                        <Textarea
                                            id="site_description"
                                            value={generalForm.data.site_description}
                                            onChange={(e) => generalForm.setData('site_description', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_format">Date Format</Label>
                                        <Select
                                            value={generalForm.data.date_format}
                                            onValueChange={(value) => generalForm.setData('date_format', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dateFormats.map((format) => (
                                                    <SelectItem key={format} value={format}>
                                                        {format}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="maintenance_mode"
                                            checked={generalForm.data.maintenance_mode}
                                            onCheckedChange={(checked) => generalForm.setData('maintenance_mode', checked)}
                                        />
                                        <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                                    </div>

                                    {generalForm.data.maintenance_mode && (
                                        <div className="space-y-2">
                                            <Label htmlFor="maintenance_message">Maintenance Message</Label>
                                            <Textarea
                                                id="maintenance_message"
                                                value={generalForm.data.maintenance_message}
                                                onChange={(e) => generalForm.setData('maintenance_message', e.target.value)}
                                                rows={3}
                                                placeholder="Enter message to display during maintenance..."
                                            />
                                        </div>
                                    )}

                                    <Button onClick={handleGeneralSubmit} disabled={generalForm.processing}>
                                        Save General Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Email Settings */}
                        <TabsContent value="email" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Email Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_driver">Mail Driver</Label>
                                            <Select
                                                value={emailForm.data.mail_driver}
                                                onValueChange={(value) => emailForm.setData('mail_driver', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="smtp">SMTP</SelectItem>
                                                    <SelectItem value="mailgun">Mailgun</SelectItem>
                                                    <SelectItem value="ses">Amazon SES</SelectItem>
                                                    <SelectItem value="sendmail">Sendmail</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_host">Mail Host</Label>
                                            <Input
                                                id="mail_host"
                                                value={emailForm.data.mail_host}
                                                onChange={(e) => emailForm.setData('mail_host', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_port">Mail Port</Label>
                                            <Input
                                                id="mail_port"
                                                type="number"
                                                value={emailForm.data.mail_port}
                                                onChange={(e) => emailForm.setData('mail_port', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_encryption">Encryption</Label>
                                            <Select
                                                value={emailForm.data.mail_encryption}
                                                onValueChange={(value) => emailForm.setData('mail_encryption', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tls">TLS</SelectItem>
                                                    <SelectItem value="ssl">SSL</SelectItem>
                                                    <SelectItem value="none">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_username">Username</Label>
                                            <Input
                                                id="mail_username"
                                                value={emailForm.data.mail_username}
                                                onChange={(e) => emailForm.setData('mail_username', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_address">From Address</Label>
                                            <Input
                                                id="mail_from_address"
                                                type="email"
                                                value={emailForm.data.mail_from_address}
                                                onChange={(e) => emailForm.setData('mail_from_address', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mail_from_name">From Name</Label>
                                        <Input
                                            id="mail_from_name"
                                            value={emailForm.data.mail_from_name}
                                            onChange={(e) => emailForm.setData('mail_from_name', e.target.value)}
                                        />
                                    </div>

                                    <Button onClick={handleEmailSubmit} disabled={emailForm.processing}>
                                        Save Email Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Database Settings */}
                        <TabsContent value="database" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        Database Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="connection">Connection</Label>
                                            <Select
                                                value={databaseForm.data.connection}
                                                onValueChange={(value) => databaseForm.setData('connection', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mysql">MySQL</SelectItem>
                                                    <SelectItem value="pgsql">PostgreSQL</SelectItem>
                                                    <SelectItem value="sqlite">SQLite</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="host">Host</Label>
                                            <Input
                                                id="host"
                                                value={databaseForm.data.host}
                                                onChange={(e) => databaseForm.setData('host', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="port">Port</Label>
                                            <Input
                                                id="port"
                                                type="number"
                                                value={databaseForm.data.port}
                                                onChange={(e) => databaseForm.setData('port', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="database">Database Name</Label>
                                            <Input
                                                id="database"
                                                value={databaseForm.data.database}
                                                onChange={(e) => databaseForm.setData('database', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="backup_enabled"
                                            checked={databaseForm.data.backup_enabled}
                                            onCheckedChange={(checked) => databaseForm.setData('backup_enabled', checked)}
                                        />
                                        <Label htmlFor="backup_enabled">Enable Automated Backups</Label>
                                    </div>

                                    {databaseForm.data.backup_enabled && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="backup_frequency">Backup Frequency</Label>
                                                <Select
                                                    value={databaseForm.data.backup_frequency}
                                                    onValueChange={(value) => databaseForm.setData('backup_frequency', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {backupFrequencies.map((freq) => (
                                                            <SelectItem key={freq} value={freq}>
                                                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="backup_retention">Retention (Days)</Label>
                                                <Input
                                                    id="backup_retention"
                                                    type="number"
                                                    value={databaseForm.data.backup_retention}
                                                    onChange={(e) => databaseForm.setData('backup_retention', parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button onClick={handleDatabaseSubmit} disabled={databaseForm.processing}>
                                        Save Database Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Security Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="session_lifetime">Session Lifetime (minutes)</Label>
                                            <Input
                                                id="session_lifetime"
                                                type="number"
                                                value={securityForm.data.session_lifetime}
                                                onChange={(e) => securityForm.setData('session_lifetime', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_min_length">Minimum Password Length</Label>
                                            <Input
                                                id="password_min_length"
                                                type="number"
                                                value={securityForm.data.password_min_length}
                                                onChange={(e) => securityForm.setData('password_min_length', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                                            <Input
                                                id="max_login_attempts"
                                                type="number"
                                                value={securityForm.data.max_login_attempts}
                                                onChange={(e) => securityForm.setData('max_login_attempts', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="require_email_verification"
                                                checked={securityForm.data.require_email_verification}
                                                onCheckedChange={(checked) => securityForm.setData('require_email_verification', checked)}
                                            />
                                            <Label htmlFor="require_email_verification">Require Email Verification</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="two_factor_enabled"
                                                checked={securityForm.data.two_factor_enabled}
                                                onCheckedChange={(checked) => securityForm.setData('two_factor_enabled', checked)}
                                            />
                                            <Label htmlFor="two_factor_enabled">Enable Two-Factor Authentication</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="rate_limiting_enabled"
                                                checked={securityForm.data.rate_limiting_enabled}
                                                onCheckedChange={(checked) => securityForm.setData('rate_limiting_enabled', checked)}
                                            />
                                            <Label htmlFor="rate_limiting_enabled">Enable Rate Limiting</Label>
                                        </div>
                                    </div>

                                    <Button onClick={handleSecuritySubmit} disabled={securityForm.processing}>
                                        Save Security Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
