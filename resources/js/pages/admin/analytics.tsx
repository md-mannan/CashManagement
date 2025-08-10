import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Activity, BarChart3, CreditCard, Database, DollarSign, Eye, TrendingUp, Users } from 'lucide-react';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

// Function to get currency symbol
const getCurrencySymbol = (currencyCode: string): string => {
    const currencySymbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CAD: 'C$',
        AUD: 'A$',
        CHF: 'CHF',
        CNY: '¥',
        INR: '₹',
        BRL: 'R$',
        RUB: '₽',
        KRW: '₩',
        MXN: '$',
        SGD: 'S$',
        HKD: 'HK$',
        NZD: 'NZ$',
        SEK: 'kr',
        NOK: 'kr',
        DKK: 'kr',
        PLN: 'zł',
        CZK: 'Kč',
        HUF: 'Ft',
        RON: 'lei',
        BGN: 'лв',
        HRK: 'kn',
        RSD: 'din',
        UAH: '₴',
        TRY: '₺',
        ILS: '₪',
        EGP: 'E£',
        ZAR: 'R',
        NGN: '₦',
        KES: 'KSh',
        GHS: 'GH₵',
        UGX: 'USh',
        TZS: 'TSh',
        ETB: 'Br',
        MAD: 'MAD',
        TND: 'TND',
        DZD: 'DZD',
        LYD: 'LYD',
        SDG: 'SDG',
        KWD: 'KWD',
        SAR: 'SAR',
        AED: 'AED',
        QAR: 'QAR',
        OMR: 'OMR',
        BHD: 'BHD',
        JOD: 'JOD',
        LBP: 'LBP',
        IQD: 'IQD',
        IRR: 'IRR',
        AFN: 'AFN',
        PKR: '₨',
        BDT: '৳',
        LKR: 'Rs',
        NPR: '₨',
        MMK: 'K',
        THB: '฿',
        VND: '₫',
        IDR: 'Rp',
        MYR: 'RM',
        PHP: '₱',
        TWD: 'NT$',
        KRW: '₩',
    };

    return currencySymbols[currencyCode] || currencyCode;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
    },
];

export default function AdminAnalytics() {
    const { analytics, userRole, userPermissions, primaryCurrency } = usePage<
        SharedData & {
            analytics: {
                system_overview: {
                    total_users: number;
                    active_users: number;
                    total_transactions: number;
                    total_categories: number;
                    system_uptime: string;
                    last_backup: string;
                };
                user_activity: {
                    daily_active_users: number[];
                    weekly_active_users: number[];
                    monthly_active_users: number[];
                    labels: string[];
                };
                financial_overview: {
                    total_income: number;
                    total_expenses: number;
                    total_receivables: number;
                    total_payables: number;
                    currency_distribution: Record<string, number>;
                };
                performance_metrics: {
                    avg_response_time: number;
                    error_rate: number;
                    database_size: string;
                    cache_hit_rate: number;
                };
            };
            primaryCurrency: string;
        }
    >().props;

    const userActivityData = {
        labels: analytics?.user_activity?.labels || [],
        datasets: [
            {
                label: 'Daily Active Users',
                data: analytics?.user_activity?.daily_active_users || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Weekly Active Users',
                data: analytics?.user_activity?.weekly_active_users || [],
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Monthly Active Users',
                data: analytics?.user_activity?.monthly_active_users || [],
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const currencyDistributionData = {
        labels: Object.keys(analytics?.financial_overview?.currency_distribution || {}),
        datasets: [
            {
                data: Object.values(analytics?.financial_overview?.currency_distribution || {}),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
            },
        ],
    };

    const userActivityOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'User Activity Trends',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    const currencyDistributionOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            title: {
                display: true,
                text: 'Currency Distribution',
            },
        },
    };

    return (
        <AdminRouteGuard userRole={userRole}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Admin Analytics" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
                            <p className="text-muted-foreground">Comprehensive system insights and performance metrics</p>
                        </div>
                    </div>

                    {/* System Overview Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics?.system_overview?.total_users || 0}</div>
                                <p className="text-xs text-muted-foreground">{analytics?.system_overview?.active_users || 0} active</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics?.system_overview?.total_transactions || 0}</div>
                                <p className="text-xs text-muted-foreground">across all users</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics?.system_overview?.system_uptime || '99.9%'}</div>
                                <p className="text-xs text-muted-foreground">reliability</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics?.performance_metrics?.database_size || '0 MB'}</div>
                                <p className="text-xs text-muted-foreground">storage used</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Financial Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Financial System Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {getCurrencySymbol(primaryCurrency)}
                                        {(analytics?.financial_overview?.total_income || 0).toLocaleString()}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Income</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {getCurrencySymbol(primaryCurrency)}
                                        {(analytics?.financial_overview?.total_expenses || 0).toLocaleString()}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {getCurrencySymbol(primaryCurrency)}
                                        {(analytics?.financial_overview?.total_receivables || 0).toLocaleString()}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Receivables</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {getCurrencySymbol(primaryCurrency)}
                                        {(analytics?.financial_overview?.total_payables || 0).toLocaleString()}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Payables</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Charts */}
                    <Tabs defaultValue="user-activity" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="user-activity">User Activity</TabsTrigger>
                            <TabsTrigger value="currency-distribution">Currency Distribution</TabsTrigger>
                            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
                        </TabsList>

                        <TabsContent value="user-activity" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Activity Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        <Chart type="line" data={userActivityData} options={userActivityOptions} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="currency-distribution" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Currency Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        <Chart type="pie" data={currencyDistributionData} options={currencyDistributionOptions} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="performance" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Response Time
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.performance_metrics?.avg_response_time || 0}ms</div>
                                        <p className="text-sm text-muted-foreground">Average response time</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Eye className="h-5 w-5" />
                                            Cache Hit Rate
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{(analytics?.performance_metrics?.cache_hit_rate || 0) * 100}%</div>
                                        <p className="text-sm text-muted-foreground">Cache efficiency</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Error Rate
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{(analytics?.performance_metrics?.error_rate || 0) * 100}%</div>
                                        <p className="text-sm text-muted-foreground">System reliability</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Last Backup
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{analytics?.system_overview?.last_backup || 'Never'}</div>
                                        <p className="text-sm text-muted-foreground">System backup status</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
