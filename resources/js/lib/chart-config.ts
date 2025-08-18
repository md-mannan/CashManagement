import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    DoughnutController,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PieController,
    PointElement,
    PolarAreaController,
    RadarController,
    RadialLinearScale,
    ScatterController,
    Title,
    Tooltip,
} from 'chart.js';

// Register all Chart.js components once globally
ChartJS.register(
    // Controllers
    BarController,
    LineController,
    PieController,
    DoughnutController,
    PolarAreaController,
    RadarController,
    ScatterController,
    
    // Elements
    ArcElement,
    BarElement,
    LineElement,
    PointElement,
    
    // Scales
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    
    // Plugins
    Title,
    Tooltip,
    Legend,
    Filler
);

// Export ChartJS for use in components
export { ChartJS };

// Default chart options
export const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: false,
        },
    },
    scales: {
        x: {
            beginAtZero: true,
        },
        y: {
            beginAtZero: true,
        },
    },
};
