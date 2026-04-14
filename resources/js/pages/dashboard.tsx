import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Banknote, BarChart3, CreditCard, FileText, PieChart, Plus, Shield, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import FinancialConstraintWarning from '@/components/FinancialConstraintWarning';
// Import chart configuration to ensure all controllers are registered
import '@/lib/chart-config';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth, currentSummary, ledgerLikeNetBalance, recentTransactions, changes, monthlyData, yearlyData, categoryData, yearlyCategoryData } = usePage<
        SharedData & {
            currentSummary: {
                total_income: number;
                total_expenses: number;
                total_expenses_with_payable_settlements: number;
                total_receivables: number;
                total_payables: number;
                remaining_receivables: number;
                remaining_payables: number;
                total_settlements: number;
                receivable_settlements: number;
                payable_settlements: number;
                net_balance: number;
                secondary_amounts?: {
                    total_income: number;
                    total_expenses: number;
                    total_receivables: number;
                    total_payables: number;
                    receivable_settlements: number;
                    payable_settlements: number;
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
            ledgerLikeNetBalance?: number | null;

        }
    >().props;
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Trigger animations after component mounts
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // User's currency settings
    const primaryCurrency = auth.user.primary_currency || 'BDT';
    const primarySymbol = auth.user.primary_symbol || '৳';
    const secondaryCurrency = auth.user.secondary_currency || 'KWD';
    const secondarySymbol = auth.user.secondary_symbol || 'د.ك';
    const userExchangeRate = parseFloat(auth.user.exchange_rate || '0');
    const derivedExchangeRate =
        secondaryCurrency !== primaryCurrency &&
        (currentSummary?.total_payables || 0) > 0 &&
        (currentSummary?.secondary_amounts?.total_payables || 0) > 0
            ? (currentSummary.total_payables || 0) / (currentSummary.secondary_amounts?.total_payables || 1)
            : 0;
    const effectiveExchangeRate =
        secondaryCurrency !== primaryCurrency && userExchangeRate > 0 && userExchangeRate <= 1.0001
            ? derivedExchangeRate
            : userExchangeRate;

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
                beginAtZero: true,
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
                suggestedMax: function(context: any) {
                    const chart = context.chart;
                    const datasets = chart.data.datasets;
                    let maxValue = 0;
                    
                    // Find the maximum value across all datasets
                    datasets.forEach((dataset: any) => {
                        dataset.data.forEach((value: number) => {
                            if (value > maxValue) {
                                maxValue = value;
                            }
                        });
                    });
                    
                    // Extend the range by 5%
                    return maxValue * 1.05;
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
                    color: document.documentElement.classList.contains('dark') ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
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
            <div className="flex h-full flex-1 flex-col gap-3 overflow-x-auto w-full max-w-full p-0">
                {/* Welcome Section */}
                <div
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
                >
                    <div>
                        <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-xl sm:text-2xl font-bold tracking-tight text-transparent">
                            Financial Dashboard
                        </h1>
                        <p className="text-xs text-muted-foreground">Your financial overview at a glance</p>
                    </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Add Transaction Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 text-sm">
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Transaction
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => router.visit('/transactions/add-income')}>
                                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                    Add Income
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.visit('/transactions/add-expense')}>
                                    <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                                    Add Expense
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.visit('/transactions/add-receivable')}>
                                    <Banknote className="h-4 w-4 mr-2 text-blue-600" />
                                    Add Receivable
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.visit('/transactions/add-payable')}>
                                    <CreditCard className="h-4 w-4 mr-2 text-orange-600" />
                                    Add Payable
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {/* Admin Access Badge */}
                        {auth.user.role && ['admin', 'super_admin'].includes(auth.user.role) && (
                            <div className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-1.5 sm:p-2 w-full sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                                    <div>
                                        <p className="text-xs font-medium text-red-800">Admin Access</p>
                                        <p className="text-xs text-red-600 hidden sm:block">You have administrative privileges</p>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </div>

                {/* Notifications removed */}

                {/* Transaction Summary */}
                <div className="space-y-3">
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full max-w-full">
                        {/* Net Balance - First Card */}
                                                <Card className="bg-violet-50 border-violet-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-violet-800">Net Balance</CardTitle>
                                <FileText className="h-4 w-4 text-violet-600" />
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const primaryNet = typeof ledgerLikeNetBalance === 'number'
                                        ? ledgerLikeNetBalance
                                        : (currentSummary?.net_balance || 0);
                                    return (
                                        <div className={`text-2xl font-bold ${primaryNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {primarySymbol}
                                    {formatCurrency(primaryNet, primaryCurrency)}
                                        </div>
                                    );
                                })()}
                                <div className="space-y-1 text-sm text-gray-600 mt-1">
                                    {(() => {
                                        // Secondary net balance should be derived from primary net + exchange rate
                                        // to avoid inconsistencies when stored secondary totals drift.
                                        if (effectiveExchangeRate > 0) {
                                            const primaryNet = typeof ledgerLikeNetBalance === 'number'
                                                ? ledgerLikeNetBalance
                                                : (currentSummary?.net_balance || 0);
                                            const secondaryNetBalance = primaryNet / effectiveExchangeRate;
                                            if (!isNaN(secondaryNetBalance)) {
                                                return (
                                                    <div className={`${secondaryNetBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {secondarySymbol} {formatCurrency(secondaryNetBalance, secondaryCurrency)}
                                                    </div>
                                                );
                                            }
                                        }
                                        return null;
                                    })()}
                                </div>
                                <p className="text-xs text-muted-foreground">Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {primarySymbol}
                                    {formatCurrency(currentSummary?.total_income || 0, primaryCurrency)}
                                </div>
                                <div className="space-y-1 text-sm text-gray-600 mt-1">
                                                                         {currentSummary?.secondary_amounts && currentSummary.secondary_amounts.total_income > 0 && (
                                    <div>
                                             {secondarySymbol} {formatCurrency(currentSummary.secondary_amounts.total_income, secondaryCurrency)}
                                         </div>
                                        )}
                                    </div>
                                <p className="text-xs text-muted-foreground">
                                    {recentTransactions?.filter((t) => t.type === 'income').length || 0} transactions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {primarySymbol}
                                    {formatCurrency(currentSummary?.total_expenses || 0, primaryCurrency)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {recentTransactions?.filter((t) => t.type === 'expense').length || 0} expenses
                                </p>

                                <div className="space-y-1 text-sm text-gray-600 mt-1">
                                    {currentSummary?.secondary_amounts && currentSummary.secondary_amounts.total_expenses > 0 && (
                                    <div>
                                            {secondarySymbol} {formatCurrency(
                                                currentSummary.secondary_amounts.total_expenses, 
                                                secondaryCurrency
                                        )}
                                    </div>
                                    )}

                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Payables</CardTitle>
                                <CreditCard className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {primarySymbol}
                                    {formatCurrency(currentSummary?.total_payables || 0, primaryCurrency)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {recentTransactions?.filter((t) => t.type === 'payable').length || 0} transactions
                                </p>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <div>Remaining: {primarySymbol}{formatCurrency((currentSummary?.total_payables || 0) - (currentSummary?.payable_settlements || 0), primaryCurrency)} {currentSummary?.secondary_amounts && (currentSummary.secondary_amounts.total_payables - currentSummary.secondary_amounts.payable_settlements) > 0 && `/ ${secondarySymbol} ${formatCurrency(currentSummary.secondary_amounts.total_payables - currentSummary.secondary_amounts.payable_settlements, secondaryCurrency)}`}</div>
                                    <div>Settled: {primarySymbol}{formatCurrency(currentSummary?.payable_settlements || 0, primaryCurrency)} {currentSummary?.secondary_amounts && currentSummary.secondary_amounts.payable_settlements > 0 && `/ ${secondarySymbol} ${formatCurrency(currentSummary.secondary_amounts.payable_settlements, secondaryCurrency)}`}</div>
                                    </div>
                                <div className="space-y-1 text-sm text-gray-600 mt-1">
                                    {currentSummary?.secondary_amounts && currentSummary.secondary_amounts.total_payables > 0 && (
                                    <div>
                                            {secondarySymbol} {formatCurrency(currentSummary.secondary_amounts.total_payables, secondaryCurrency)}
                                </div>
                                        )}
                                    </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Receivables</CardTitle>
                                <Banknote className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {primarySymbol}
                                    {formatCurrency(currentSummary?.total_receivables || 0, primaryCurrency)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {recentTransactions?.filter((t) => t.type === 'receivable').length || 0} transactions
                                </p>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <div>Remaining: {primarySymbol}{formatCurrency((currentSummary?.total_receivables || 0) - (currentSummary?.receivable_settlements || 0), primaryCurrency)} {currentSummary?.secondary_amounts && (currentSummary.secondary_amounts.total_receivables - currentSummary.secondary_amounts.receivable_settlements) > 0 && `/ ${secondarySymbol} ${formatCurrency(currentSummary.secondary_amounts.total_receivables - currentSummary.secondary_amounts.receivable_settlements, secondaryCurrency)}`}</div>
                                    <div>Settled: {primarySymbol}{formatCurrency(currentSummary?.receivable_settlements || 0, primaryCurrency)} {currentSummary?.secondary_amounts && currentSummary.secondary_amounts.receivable_settlements > 0 && `/ ${secondarySymbol} ${formatCurrency(currentSummary.secondary_amounts.receivable_settlements, secondaryCurrency)}`}</div>
                                    </div>
                                <div className="space-y-1 text-sm text-gray-600 mt-1">
                                    {currentSummary?.secondary_amounts && currentSummary.secondary_amounts.total_receivables > 0 && (
                                    <div>
                                            {secondarySymbol} {formatCurrency(currentSummary.secondary_amounts.total_receivables, secondaryCurrency)}
                                </div>
                                        )}
                                    </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>



                {/* Charts Section */}
                <div className="space-y-4">
                    {/* Financial Overview Chart */}
                        <div>
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg">
                                    <BarChart3 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Financial Overview
                                    </h2>
                                    <p className="text-xs text-muted-foreground">Visualize your payables and receivables status</p>
                                </div>
                        </div>
                    </div>
                    
                        <Card className="shadow-xl border-0 bg-white">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-gray-800">
                                        Financial Status: Settled vs Remaining
                                    </CardTitle>

                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="h-40 w-full">
                                    {currentSummary ? (
                                        <>
                                            
                                            
                                            <Chart 
                                            type="bar" 
                                            data={{
                                                labels: ['Total Payable', 'Total Receivable'],
                                                datasets: [
                                                    {
                                                        label: 'Settled',
                                                        data: [
                                                            currentSummary.payable_settlements || 0,
                                                            currentSummary.receivable_settlements || 0
                                                        ],
                                                        backgroundColor: [
                                                            'rgba(34, 197, 94, 0.9)', // success color for settled
                                                            'rgba(34, 197, 94, 0.9)', // success color for settled
                                                        ],
                                                        borderColor: ['#22c55e', '#22c55e'],
                                                        borderWidth: 0,
                                                        borderRadius: 0,
                                                        borderSkipped: false,
                                                        stack: 'stack1',
                                                    },
                                                    {
                                                        label: 'Remaining',
                                                        data: [
                                                            (currentSummary.total_payables || 0) - (currentSummary.payable_settlements || 0),
                                                            (currentSummary.total_receivables || 0) - (currentSummary.receivable_settlements || 0)
                                                        ],
                                                        backgroundColor: [
                                                            'rgba(134, 239, 172, 0.9)', // light success color for remaining
                                                            'rgba(134, 239, 172, 0.9)', // light success color for remaining
                                                        ],
                                                        borderColor: ['#86efac', '#86efac'],
                                                        borderWidth: 0,
                                                        borderRadius: 0,
                                                        borderSkipped: false,
                                                        stack: 'stack1',
                                                    }
                                                ]
                                            }} 
                                            options={{
                                                indexAxis: 'y' as const,
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },

                                                    tooltip: {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                        titleColor: 'white',
                                                        bodyColor: 'white',
                                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                                        borderWidth: 1,
                                                        cornerRadius: 8,
                                                        displayColors: false,
                                                        callbacks: {
                                                            label: function(context) {
                                                                const label = context.dataset.label || '';
                                                                const value = context.parsed.x;
                                                                const dataIndex = context.dataIndex;
                                                                
                                                                // Get secondary amount based on the category (Payable or Receivable)
                                                                let secondaryAmount = 0;
                                                                if (dataIndex === 0) { // Total Payable
                                                                    if (context.dataset.label === 'Settled') {
                                                                        secondaryAmount = currentSummary.secondary_amounts?.payable_settlements || 0;
                                                                    } else { // Remaining
                                                                        secondaryAmount = (currentSummary.secondary_amounts?.total_payables || 0) - (currentSummary.secondary_amounts?.payable_settlements || 0);
                                                                    }
                                                                } else { // Total Receivable
                                                                    if (context.dataset.label === 'Settled') {
                                                                        secondaryAmount = currentSummary.secondary_amounts?.receivable_settlements || 0;
                                                                    } else { // Remaining
                                                                        secondaryAmount = (currentSummary.secondary_amounts?.total_receivables || 0) - (currentSummary.secondary_amounts?.receivable_settlements || 0);
                                                                    }
                                                                }
                                                                
                                                                const primaryText = `${label}: ${primarySymbol}${formatCurrency(value, primaryCurrency)}`;
                                                                const secondaryText = secondaryAmount > 0 ? ` / ${secondarySymbol}${formatCurrency(secondaryAmount, secondaryCurrency)}` : '';
                                                                
                                                                return primaryText + secondaryText;
                                                            }
                                                        }
                                                    }
                                                },
                                                datasets: {
                                                    bar: {
                                                        stack: 'stack1',
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        beginAtZero: true,
                                                        grid: {
                                                            color: 'rgba(0, 0, 0, 0.1)',
                                                            lineWidth: 1,
                                                        },
                                                        ticks: {
                                                            callback: function(value) {
                                                                return `${primarySymbol}${formatCurrency(value as number, primaryCurrency)}`;
                                                            },
                                                            font: { size: 11 },
                                                            color: '#9CA3AF'
                                                        }
                                                    },
                                                    y: {
                                                        grid: { display: false },
                                                        ticks: {
                                                            font: { size: 13, weight: 600 },
                                                            color: '#4B5563'
                                                        }
                                                    }
                                                },
                                                elements: {
                                                    bar: {
                                                        borderSkipped: false,
                                                        borderWidth: 2,
                                                        borderColor: 'rgba(0, 0, 0, 0.1)',
                                                    }
                                                },
                                                interaction: {
                                                    intersect: false,
                                                    mode: 'index' as const,
                                                },

                                            }} 
                                        />
                                        </>
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <div className="text-center">
                                                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                                    <BarChart3 className="h-8 w-8 text-emerald-500" />
                                                </div>
                                                <p className="text-lg font-medium text-gray-700 mb-2">No financial data available</p>
                                                <p className="text-sm text-gray-500">Add transactions to see your payables and receivables status</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                </div>

                    {/* Bar Charts Row */}
                    <div>
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold tracking-tight">Analytics Overview</h2>
                            <p className="text-xs text-muted-foreground">Transaction trends over time</p>
                        </div>
                        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
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
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold tracking-tight">Transaction Distribution</h2>
                            <p className="text-xs text-muted-foreground">Breakdown by transaction types</p>
                        </div>
                        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
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
