import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { ArrowDownRight, ArrowUpRight, BarChart3, PieChart, Plus, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Chart } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Mock data for dashboard
const mockTransactions = [
    {
        id: 1,
        date: '2024-01-15',
        description: 'Salary Payment',
        type: 'income',
        amount: 3750.0,
        source: 'Company Inc.',
        category: 'Salary',
    },
    {
        id: 2,
        date: '2024-01-08',
        description: 'Grocery Shopping',
        type: 'expense',
        amount: 450.0,
        source: 'Local Supermarket',
        category: 'Food & Dining',
    },
    {
        id: 3,
        date: '2024-01-12',
        description: 'Freelance Project',
        type: 'income',
        amount: 1200.0,
        source: 'Client XYZ',
        category: 'Freelance',
    },
    {
        id: 4,
        date: '2024-01-15',
        description: 'Utility Bills',
        type: 'expense',
        amount: 180.0,
        source: 'Electricity Co.',
        category: 'Utilities',
    },
    {
        id: 5,
        date: '2024-01-18',
        description: 'Investment Dividend',
        type: 'income',
        amount: 500.0,
        source: 'Investment Bank',
        category: 'Investment',
    },
    {
        id: 6,
        date: '2024-01-22',
        description: 'Restaurant Dinner',
        type: 'expense',
        amount: 120.0,
        source: 'Fine Dining',
        category: 'Food & Dining',
    },
    {
        id: 7,
        date: '2024-01-25',
        description: 'Client Payment Due',
        type: 'receivable',
        amount: 2500.0,
        source: 'Client ABC',
        category: 'Client Payment',
    },
    {
        id: 8,
        date: '2024-01-28',
        description: 'Loan Repayment',
        type: 'receivable',
        amount: 800.0,
        source: 'Friend Loan',
        category: 'Loan Repayment',
    },
    {
        id: 9,
        date: '2024-01-30',
        description: 'Credit Card Bill',
        type: 'payable',
        amount: 350.0,
        source: 'Bank Credit Card',
        category: 'Credit Card',
    },
];

// Mock chart data
const mockChartData = {
    daily: {
        labels: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 'Jan 6', 'Jan 7'],
        datasets: [
            {
                label: 'Income',
                data: [0, 1200, 0, 500, 3750, 0, 0],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Expense',
                data: [0, 450, 180, 120, 0, 0, 0],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Receivable',
                data: [0, 500, 0, 800, 2500, 0, 0],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Payable',
                data: [0, 200, 0, 350, 0, 0, 0],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                type: 'bar' as const,
            },
        ],
    },
    monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Income',
                data: [5450, 4200, 3800, 5100, 4600, 3900],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Expense',
                data: [750, 1200, 950, 1100, 1300, 850],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Receivable',
                data: [3300, 2800, 2200, 3500, 2900, 2400],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Payable',
                data: [550, 800, 600, 700, 900, 500],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                type: 'bar' as const,
            },
        ],
    },
    yearly: {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        datasets: [
            {
                label: 'Income',
                data: [45000, 52000, 48000, 55000, 58000],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Expense',
                data: [12000, 15000, 14000, 16000, 17000],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Receivable',
                data: [28000, 32000, 30000, 35000, 38000],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Payable',
                data: [8000, 10000, 9000, 11000, 12000],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                type: 'bar' as const,
            },
        ],
    },
    total: {
        labels: ['Total'],
        datasets: [
            {
                label: 'Income',
                data: [270500],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Expense',
                data: [62500],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Receivable',
                data: [163000],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                type: 'bar' as const,
            },
            {
                label: 'Payable',
                data: [50000],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                type: 'bar' as const,
            },
        ],
    },
};

// Pie chart data
const mockPieChartData = {
    monthly: {
        labels: ['Income', 'Expense', 'Receivable', 'Payable'],
        datasets: [
            {
                data: [27050, 6150, 15100, 4050],
                backgroundColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)', 'rgba(59, 130, 246, 1)', 'rgba(249, 115, 22, 1)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)', 'rgb(59, 130, 246)', 'rgb(249, 115, 22)'],
                borderWidth: 4,
                hoverBorderWidth: 6,
                hoverOffset: 20,
            },
        ],
    },
    yearly: {
        labels: ['Income', 'Expense', 'Receivable', 'Payable'],
        datasets: [
            {
                data: [258000, 74000, 163000, 50000],
                backgroundColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)', 'rgba(59, 130, 246, 1)', 'rgba(249, 115, 22, 1)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)', 'rgb(59, 130, 246)', 'rgb(249, 115, 22)'],
                borderWidth: 4,
                hoverBorderWidth: 6,
                hoverOffset: 20,
            },
        ],
    },
    total: {
        labels: ['Income', 'Expense', 'Receivable', 'Payable'],
        datasets: [
            {
                data: [270500, 62500, 163000, 50000],
                backgroundColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)', 'rgba(59, 130, 246, 1)', 'rgba(249, 115, 22, 1)'],
                borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)', 'rgb(59, 130, 246)', 'rgb(249, 115, 22)'],
                borderWidth: 4,
                hoverBorderWidth: 6,
                hoverOffset: 20,
            },
        ],
    },
};

export default function Dashboard() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Trigger animations after component mounts
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Calculate financial summary
    const financialSummary = useMemo(() => {
        const totalIncome = mockTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = mockTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        const totalReceivable = mockTransactions.filter((t) => t.type === 'receivable').reduce((sum, t) => sum + t.amount, 0);

        const totalPayable = mockTransactions.filter((t) => t.type === 'payable').reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense + totalReceivable - totalPayable;

        return {
            balance,
            totalIncome,
            totalExpense,
            totalReceivable,
            totalPayable,
            transactionCount: mockTransactions.length,
        };
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KWD',
            minimumFractionDigits: 3,
        }).format(amount);
    };

    // Chart options with animations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: false,
            },
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                    },
                },
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

                        return `${emoji} ${label}: ${formatCurrency(value)}`;
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
                        return formatCurrency(value);
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
        plugins: {
            title: {
                display: false,
            },
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    },
                },
            },
        },
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart' as const,
        },
        elements: {
            arc: {
                borderWidth: 4,
                borderColor: '#fff',
                shadowOffsetX: 8,
                shadowOffsetY: 8,
                shadowBlur: 20,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
            },
        },
        cutout: '0%',
        radius: '80%',
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
                    <Button onClick={() => router.visit('/add-transaction')} className="flex animate-pulse items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Transaction
                    </Button>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    {/* Balance */}
                    <Card
                        className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        style={{ animationDelay: '100ms' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${financialSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(financialSummary.balance)}
                            </div>
                            <p className="text-xs text-muted-foreground">{financialSummary.balance >= 0 ? '+12%' : '-5%'} from last month</p>
                        </CardContent>
                    </Card>

                    {/* Total Income */}
                    <Card
                        className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        style={{ animationDelay: '200ms' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.totalIncome)}</div>
                            <p className="text-xs text-muted-foreground">+15% from last month</p>
                        </CardContent>
                    </Card>

                    {/* Total Expenses */}
                    <Card
                        className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        style={{ animationDelay: '300ms' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expense</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(financialSummary.totalExpense)}</div>
                            <p className="text-xs text-muted-foreground">+8% from last month</p>
                        </CardContent>
                    </Card>

                    {/* Receivables */}
                    <Card
                        className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        style={{ animationDelay: '400ms' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receivable</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialSummary.totalReceivable)}</div>
                            <p className="text-xs text-muted-foreground">+20% from last month</p>
                        </CardContent>
                    </Card>

                    {/* Payables */}
                    <Card
                        className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        style={{ animationDelay: '500ms' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payable</CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{formatCurrency(financialSummary.totalPayable)}</div>
                            <p className="text-xs text-muted-foreground">+5% from last month</p>
                        </CardContent>
                    </Card>

                    {/* Total Transactions */}
                    <Card
                        className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        style={{ animationDelay: '600ms' }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                            <Receipt className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{financialSummary.transactionCount}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="space-y-6">
                    {/* Bar Charts */}
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                        {/* Monthly Chart */}
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
                                    <Chart type="bar" data={mockChartData.monthly} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Yearly Chart */}
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
                                    <Chart type="bar" data={mockChartData.yearly} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Chart */}
                        <Card
                            className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                            style={{ animationDelay: '900ms' }}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Total Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 w-full">
                                    <Chart type="bar" data={mockChartData.total} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Pie Charts Section */}
                <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                        {/* Monthly Pie Chart */}
                        <Card
                            className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                            style={{ animationDelay: '1000ms' }}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Monthly Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="h-80 w-full"
                                    style={{
                                        perspective: '1000px',
                                        transform: 'rotateX(15deg) rotateY(5deg)',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <Chart type="pie" data={mockPieChartData.monthly} options={pieChartOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Yearly Pie Chart */}
                        <Card
                            className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                            style={{ animationDelay: '1100ms' }}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Yearly Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="h-80 w-full"
                                    style={{
                                        perspective: '1000px',
                                        transform: 'rotateX(15deg) rotateY(5deg)',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <Chart type="pie" data={mockPieChartData.yearly} options={pieChartOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Pie Chart */}
                        <Card
                            className={`transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                            style={{ animationDelay: '1200ms' }}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Total Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="h-80 w-full"
                                    style={{
                                        perspective: '1000px',
                                        transform: 'rotateX(15deg) rotateY(5deg)',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <Chart type="pie" data={mockPieChartData.total} options={pieChartOptions} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
