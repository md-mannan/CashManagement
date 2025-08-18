import { AdminNotification } from '@/components/admin-notification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Banknote, BarChart3, CreditCard, PieChart, Shield, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Chart } from 'react-chartjs-2';
// Import chart configuration to ensure all controllers are registered
import '@/lib/chart-config';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth, currentSummary, recentTransactions, changes, monthlyData, yearlyData, categoryData, yearlyCategoryData } = usePage<
        SharedData & {
            currentSummary: {
                total_income: number;
                total_expenses: number;
                total_receivables: number;
                total_payables: number;
                net_balance: number;
                secondary_amounts?: {
                    total_income: number;
                    total_expenses: number;
                    total_receivables: number;
                    total_payables: number;
                };
            };
            recentTransactions: Array<{
                id: number;
                date: string;
                description: string;
                type: 'income' | 'expense' | 'receivable' | 'payable';
                amount: number;
                source: string;
                category: {
                    name: string;
                    color: string;
                };
                currency: string;
                user?: {
                    name: string;
                    email: string;
                };
                metadata?: {
                    secondary_currency?: string;
                    exchange_rate?: number;
                    secondary_amount?: number;
                    primary_currency?: string;
                    primary_symbol?: string;
                };
            }>;
            changes: {
                income_change: number;
                expense_change: number;
                receivables_change: number;
                payables_change: number;
                balance_change: number;
            };
            monthlyData: {
                labels: string[];
                datasets: Array<{
                    label: string;
                    data: number[];
                    borderColor: string;
                    backgroundColor: string;
                    type: string;
                }>;
            } | null;
            yearlyData: {
                labels: string[];
                datasets: Array<{
                    label: string;
                    data: number[];
                    borderColor: string;
                    backgroundColor: string;
                    type: string;
                }>;
            } | null;
            categoryData: {
                labels: string[];
                datasets: Array<{
                    data: number[];
                    backgroundColor: string[];
                    borderColor: string[];
                    borderWidth: number;
                    hoverBorderWidth: number;
                    hoverOffset: number;
                }>;
            } | null;
            yearlyCategoryData: {
                labels: string[];
                datasets: Array<{
                    data: number[];
                    backgroundColor: string[];
                    borderColor: string[];
                    borderWidth: number;
                    hoverBorderWidth: number;
                    hoverOffset: number;
                }>;
            } | null;
            upcomingTransactions: Array<{
                id: number;
                date: string;
                description: string;
                type: 'receivable' | 'payable';
                amount: number;
                source: string;
                due_date?: string;
                status: string;
            }> | null;
        }
    >().props;
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Trigger animations after component mounts
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // User's currency settings
    const primaryCurrency = auth.user.primary_currency || 'USD';
    const primarySymbol = auth.user.primary_symbol || '$';
    const secondaryCurrency = auth.user.secondary_currency || 'EUR';
    const secondarySymbol = auth.user.secondary_symbol || '€';
    const exchangeRate = parseFloat(auth.user.exchange_rate || '1.0');

    // Helper function to check if chart data has actual values
    const hasChartData = (data: { datasets?: Array<{ data?: number[] }> } | null) => {
        if (!data || !data.datasets || !Array.isArray(data.datasets)) return false;
        return data.datasets.some((dataset) => Array.isArray(dataset.data) && dataset.data.some((value: number) => value > 0));
    };

    // Helper function to check if pie chart data has values
    const hasPieData = (data: { datasets?: Array<{ data?: number[] }> } | null) => {
        if (!data || !data.datasets || !Array.isArray(data.datasets)) return false;
        const dataset = data.datasets[0];
        return dataset && Array.isArray(dataset.data) && dataset.data.some((value: number) => value > 0);
    };

    // Helper function to calculate converted amount
    const convertAmount = (amount: number, targetCurrency: string) => {
        if (targetCurrency === primaryCurrency) return amount;
        if (targetCurrency === secondaryCurrency) {
            // Check if exchange rate is valid (not 0, null, or undefined)
            if (!exchangeRate || exchangeRate === 0 || isNaN(exchangeRate)) {
                return 0; // Return 0 instead of NaN
            }
            // Convert from primary to secondary currency using user's exchange rate
            const convertedAmount = amount / exchangeRate;
            // Use appropriate decimal precision
            if (secondaryCurrency === 'KWD') {
                return Math.round(convertedAmount * 1000) / 1000; // 3 decimals for KWD
            }
            return Math.round(convertedAmount * 100) / 100; // 2 decimals for others
        }
        // For any other currency, return the original amount (no conversion available)
        return amount;
    };

    // Use real financial summary from backend
    const financialSummary = useMemo(() => {
        return {
            balance: currentSummary?.net_balance || 0,
            totalIncome: currentSummary?.total_income || 0,
            totalExpense: currentSummary?.total_expenses || 0,
            totalReceivable: currentSummary?.total_receivables || 0,
            totalPayable: currentSummary?.total_payables || 0,
            transactionCount: recentTransactions?.length || 0,
        };
    }, [currentSummary, recentTransactions]);

    // Format currency amounts with proper decimal places (similar to ledger)
    const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
        // Round the amount first to avoid floating point precision issues
        const roundedAmount = Math.round(amount * 1000) / 1000;

        const formatNumber = (num: number, decimals: number) => {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        };

        // Handle different currencies with appropriate decimal places
        if (currency === 'KWD') {
            return formatNumber(roundedAmount, 3); // 3 decimal places for KWD
        }
        return formatNumber(roundedAmount, 2); // 2 decimal places for other currencies
    };

    // Chart options with animations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 5,
                bottom: 5,
            },
        },
        plugins: {
            title: {
                display: false,
            },
            legend: {
                position: 'top' as const,
                align: 'center' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    boxWidth: 12,
                    boxHeight: 12,
                    font: {
                        size: 12,
                    },
                },
                maxHeight: 50,
                fullSize: true,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold' as const,
                },
                bodyFont: {
                    size: 13,
                },
                callbacks: {
                    title: function (context: any) {
                        return `📅 ${context[0].label}`;
                    },
                    label: function (context: any) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;

                        let emoji = '';
                        switch (label) {
                            case 'Income':
                                emoji = '💰';
                                break;
                            case 'Expense':
                                emoji = '💸';
                                break;
                            case 'Receivable':
                                emoji = '📈';
                                break;
                            case 'Payable':
                                emoji = '📉';
                                break;
                            default:
                                emoji = '📊';
                        }

                        return `${emoji} ${label}: ${primarySymbol} ${formatCurrency(value)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                    color: '#666',
                },
                title: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                    color: '#666',
                    callback: function (value: any) {
                        return `${primarySymbol} ${formatCurrency(Number(value))}`;
                    },
                },
                title: {
                    display: false,
                },
            },
        },
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart' as const,
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false,
        },
    };

    // Pie chart options
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
            },
        },
        plugins: {
            title: {
                display: false,
            },
            legend: {
                position: 'bottom' as const,
                align: 'center' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    boxWidth: 12,
                    boxHeight: 12,
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                    generateLabels: function (chart: any) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label: string, i: number) => {
                                const meta = chart.getDatasetMeta(0);
                                const style = meta.controller.getStyle(i);
                                return {
                                    text: label,
                                    fillStyle: style.backgroundColor,
                                    strokeStyle: style.borderColor,
                                    lineWidth: style.borderWidth,
                                    pointStyle: 'circle',
                                    hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                                    index: i,
                                };
                            });
                        }
                        return [];
                    },
                },
                maxHeight: 60,
                fullSize: true,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold' as const,
                },
                bodyFont: {
                    size: 13,
                },
                callbacks: {
                    title: function () {
                        return 'Transaction Breakdown';
                    },
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${primarySymbol} ${formatCurrency(value)} (${percentage}%)`;
                    },
                },
            },
        },
        animation: {
            duration: 1500,
            easing: 'easeInOutQuart' as const,
        },
        elements: {
            arc: {
                borderWidth: 3,
                borderColor: '#fff',
                hoverBorderWidth: 5,
                hoverOffset: 8,
            },
        },
        cutout: '20%', // Creates a donut chart effect
        radius: '90%',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Welcome Section */}
                <div
                    className={`flex items-center justify-between transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
                >
                    <div>
                        <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                            Financial Dashboard
                        </h1>
                        <p className="text-muted-foreground">Your financial overview at a glance</p>
                    </div>
                    {auth.user.role && ['admin', 'super_admin'].includes(auth.user.role) && (
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800">Admin Access</p>
                                        <p className="text-xs text-red-600">You have administrative privileges</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Admin Notification */}
                {auth.user.role && ['admin', 'super_admin'].includes(auth.user.role) && (
                    <AdminNotification userRole={auth.user.role} userPermissions={auth.user.permissions || []} />
                )}

                {/* Financial Summary Section - Ledger Style */}
                <div className="financial-summary space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">Financial Summary</h2>
                            <p className="text-sm text-muted-foreground">Overview of your overall financial position (all transactions)</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {/* Net Balance Card */}
                        <Card
                            className={`border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{ animationDelay: '100ms' }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-purple-800">Net Balance</CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200">
                                    <Wallet className="h-4 w-4 text-purple-700" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-800">
                                    {primarySymbol} {formatCurrency(financialSummary.balance, primaryCurrency)}
                                </div>
                                <div className="space-y-1 text-sm text-purple-600">
                                    <div>
                                        {secondarySymbol}{' '}
                                        {formatCurrency(
                                            currentSummary?.secondary_amounts &&
                                                typeof currentSummary.secondary_amounts.total_income === 'number' &&
                                                typeof currentSummary.secondary_amounts.total_receivables === 'number' &&
                                                typeof currentSummary.secondary_amounts.total_expenses === 'number' &&
                                                typeof currentSummary.secondary_amounts.total_payables === 'number'
                                                ? (currentSummary.secondary_amounts.total_income - currentSummary.secondary_amounts.total_expenses) +
                                                  (currentSummary.secondary_amounts.total_receivables - currentSummary.secondary_amounts.total_payables)
                                                : convertAmount(financialSummary.balance, secondaryCurrency),
                                            secondaryCurrency,
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-purple-600">
                                    {changes?.balance_change
                                        ? changes.balance_change >= 0
                                            ? `+${changes.balance_change.toFixed(1)}%`
                                            : `${changes.balance_change.toFixed(1)}%`
                                        : 'Current balance'}{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>

                        {/* Income Card */}
                        <Card
                            className={`border-green-200 bg-gradient-to-br from-green-50 to-green-100 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{ animationDelay: '200ms' }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-800">Income</CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                                    <TrendingUp className="h-4 w-4 text-green-700" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800">
                                    {primarySymbol} {formatCurrency(financialSummary.totalIncome, primaryCurrency)}
                                </div>
                                <div className="space-y-1 text-sm text-green-600">
                                    <div>
                                        {secondarySymbol}{' '}
                                        {formatCurrency(
                                            currentSummary?.secondary_amounts?.total_income &&
                                                typeof currentSummary.secondary_amounts.total_income === 'number' &&
                                                !isNaN(currentSummary.secondary_amounts.total_income)
                                                ? currentSummary.secondary_amounts.total_income
                                                : convertAmount(financialSummary.totalIncome, secondaryCurrency),
                                            secondaryCurrency,
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-green-600">
                                    {changes?.income_change
                                        ? changes.income_change >= 0
                                            ? `+${changes.income_change.toFixed(1)}%`
                                            : `${changes.income_change.toFixed(1)}%`
                                        : 'Total income'}{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>

                        {/* Expenses Card */}
                        <Card
                            className={`border-red-200 bg-gradient-to-br from-red-50 to-red-100 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{ animationDelay: '300ms' }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-800">Expenses</CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-200">
                                    <TrendingDown className="h-4 w-4 text-red-700" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-800">
                                    {primarySymbol} {formatCurrency(financialSummary.totalExpense, primaryCurrency)}
                                </div>
                                <div className="space-y-1 text-sm text-red-600">
                                    <div>
                                        {secondarySymbol}{' '}
                                        {formatCurrency(
                                            currentSummary?.secondary_amounts?.total_expenses &&
                                                typeof currentSummary.secondary_amounts.total_expenses === 'number' &&
                                                !isNaN(currentSummary.secondary_amounts.total_expenses)
                                                ? currentSummary.secondary_amounts.total_expenses
                                                : convertAmount(financialSummary.totalExpense, secondaryCurrency),
                                            secondaryCurrency,
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-red-600">
                                    {changes?.expense_change
                                        ? changes.expense_change >= 0
                                            ? `+${changes.expense_change.toFixed(1)}%`
                                            : `${changes.expense_change.toFixed(1)}%`
                                        : 'Total expenses'}{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>

                        {/* Receivable Card */}
                        <Card
                            className={`border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{ animationDelay: '400ms' }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-800">Receivable</CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                                    <Banknote className="h-4 w-4 text-blue-700" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-800">
                                    {primarySymbol} {formatCurrency(financialSummary.totalReceivable, primaryCurrency)}
                                </div>
                                <div className="space-y-1 text-sm text-blue-600">
                                    <div>
                                        {secondarySymbol}{' '}
                                        {formatCurrency(
                                            currentSummary?.secondary_amounts?.total_receivables &&
                                                typeof currentSummary.secondary_amounts.total_receivables === 'number' &&
                                                !isNaN(currentSummary.secondary_amounts.total_receivables)
                                                ? currentSummary.secondary_amounts.total_receivables
                                                : convertAmount(financialSummary.totalReceivable, secondaryCurrency),
                                            secondaryCurrency,
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-blue-600">
                                    {changes?.receivables_change
                                        ? changes.receivables_change >= 0
                                            ? `+${changes.receivables_change.toFixed(1)}%`
                                            : `${changes.receivables_change.toFixed(1)}%`
                                        : 'Total receivables'}{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>

                        {/* Payable Card */}
                        <Card
                            className={`border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{ animationDelay: '500ms' }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-800">Payable</CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200">
                                    <CreditCard className="h-4 w-4 text-orange-700" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-800">
                                    {primarySymbol} {formatCurrency(financialSummary.totalPayable, primaryCurrency)}
                                </div>
                                <div className="space-y-1 text-sm text-orange-600">
                                    <div>
                                        {secondarySymbol}{' '}
                                        {formatCurrency(
                                            currentSummary?.secondary_amounts?.total_payables &&
                                                typeof currentSummary.secondary_amounts.total_payables === 'number' &&
                                                !isNaN(currentSummary.secondary_amounts.total_payables)
                                                ? currentSummary.secondary_amounts.total_payables
                                                : convertAmount(financialSummary.totalPayable, secondaryCurrency),
                                            secondaryCurrency,
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-orange-600">
                                    {changes?.payables_change
                                        ? changes.payables_change >= 0
                                            ? `+${changes.payables_change.toFixed(1)}%`
                                            : `${changes.payables_change.toFixed(1)}%`
                                        : 'Total payables'}{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="space-y-6">
                    {/* Bar Charts Row */}
                    <div>
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold tracking-tight">Analytics Overview</h2>
                            <p className="text-sm text-muted-foreground">Transaction trends over time</p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                            {/* Monthly Bar Chart */}
                            <Card
                                className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                                style={{ animationDelay: '700ms' }}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Monthly Analytics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 w-full">
                                        {hasChartData(monthlyData) && monthlyData ? (
                                            <Chart type="bar" data={monthlyData as any} options={chartOptions as any} />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                                <div className="text-center">
                                                    <BarChart3 className="mx-auto h-12 w-12 opacity-20" />
                                                    <p className="mt-2 text-sm">No transaction data available</p>
                                                    <p className="mt-1 text-xs text-gray-500">Add some transactions to see analytics</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Yearly Bar Chart */}
                            <Card
                                className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                                style={{ animationDelay: '800ms' }}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Yearly Analytics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 w-full">
                                        {hasChartData(yearlyData) && yearlyData ? (
                                            <Chart type="bar" data={yearlyData as any} options={chartOptions as any} />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                                <div className="text-center">
                                                    <BarChart3 className="mx-auto h-12 w-12 opacity-20" />
                                                    <p className="mt-2 text-sm">No transaction data available</p>
                                                    <p className="mt-1 text-xs text-gray-500">Add some transactions to see yearly trends</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Pie Charts Row */}
                    <div>
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold tracking-tight">Transaction Distribution</h2>
                            <p className="text-sm text-muted-foreground">Breakdown by transaction types</p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                            {/* Monthly Transaction Distribution */}
                            <Card
                                className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                                style={{ animationDelay: '900ms' }}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5" />
                                        Monthly Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 w-full">
                                        {hasPieData(categoryData) && categoryData ? (
                                            <Chart type="pie" data={categoryData} options={pieChartOptions} />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                                <div className="text-center">
                                                    <PieChart className="mx-auto h-12 w-12 opacity-20" />
                                                    <p className="mt-2 text-sm">No category data available for this month</p>
                                                    <p className="mt-1 text-xs text-gray-500">Add transactions to see category breakdown</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Yearly Transaction Distribution */}
                            <Card
                                className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                                style={{ animationDelay: '1000ms' }}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5" />
                                        Yearly Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 w-full">
                                        {hasPieData(yearlyCategoryData) && yearlyCategoryData ? (
                                            <Chart type="pie" data={yearlyCategoryData} options={pieChartOptions} />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                                <div className="text-center">
                                                    <PieChart className="mx-auto h-12 w-12 opacity-20" />
                                                    <p className="mt-2 text-sm">No category data available for this year</p>
                                                    <p className="mt-1 text-xs text-gray-500">Add transactions to see yearly distribution</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
