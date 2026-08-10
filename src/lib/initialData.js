export const initialDashboardData = {
  taskProgress: {
    completed: 435,
    total: 500,
    percentage: 64,
    month: 'This Month',
  },
  totalExpenses: {
    amount: 8414,
    formatted: '$8,414',
    growth: 12,
    month: 'This Month',
    sparkline: [
      { value: 65 }, { value: 80 }, { value: 50 }, { value: 70 }, { value: 60 }, { value: 75 }, { value: 55 }
    ]
  },
  averageFinishedTask: {
    average: '± 52 Task',
    month: 'This Month',
    heatmapData: []
  },
  taskSummaries: {
    totalTasks: '126 Task',
    change: -4,
    periodLabel: 'Sun, 1 Dec - Sat, 7 Dec',
    dailyBreakdown: []
  },
  highlightedCompany: {
    name: 'Product design',
    category: 'Web Design',
    totalTransactions: 1641,
    formattedTransactions: '1,641',
    logo_bg: 'bg-rose-500',
    sparkline: [60, 90, 45, 80, 55, 100, 70, 85, 35]
  },
  totalRevenue: {
    amountFormatted: '$56,123k',
    growth: 12,
    yearlyData: [
      { year: '2019', revenue: 28 },
      { year: '2020', revenue: 56 },
      { year: '2021', revenue: 42 },
      { year: '2022', revenue: 32 },
      { year: '2023', revenue: 48 }
    ]
  },
  expensesAllocation: {
    amountFormatted: '$44,171k',
    growth: 12,
    categories: [
      { name: 'Production', value: 12.5, max: 40 },
      { name: 'Marketing', value: 14.2, max: 40 },
      { name: 'Operational', value: 22, max: 40 },
      { name: 'Design', value: 31, max: 40 }
    ]
  },
  completedTasksCount: 44,
  teams: [
    { id: '11111111-1111-1111-1111-111111111111', name: "Marketing Team's", badge: 'M' },
    { id: '22222222-2222-2222-2222-222222222222', name: "Design Team's", badge: 'D' },
    { id: '33333333-3333-3333-3333-333333333333', name: "Production Team's", badge: 'P' },
    { id: '44444444-4444-4444-4444-444444444444', name: "Development Team's", badge: 'DEV' },
    { id: '55555555-5555-5555-5555-555555555555', name: "Operations Team's", badge: 'OPS' },
  ]
};

export const initialCompanyList = [];
export const initialTaskList = [];
export const initialNotesList = [];
export const initialContactsList = [];
