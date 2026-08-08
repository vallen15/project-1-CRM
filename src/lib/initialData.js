export const initialDashboardData = {
  taskProgress: {
    completed: 0,
    total: 0,
    percentage: 0,
    month: 'This Month',
  },
  totalExpenses: {
    amount: 0,
    formatted: '$0',
    growth: 0,
    sparkline: []
  },
  averageFinishedTask: {
    avgCount: 0,
    month: 'This Month',
    heatmapData: []
  },
  taskSummaries: {
    total: 0,
    change: 0,
    periodLabel: 'Sun - Sat',
    dailyBreakdown: []
  },
  highlightedCompany: {
    name: 'No Company Available',
    category: 'General',
    totalTransactions: 0,
    formattedTransactions: '0',
    sparkline: []
  },
  totalRevenue: {
    amountFormatted: '$0k',
    growth: 0,
    yearlyData: []
  },
  expensesAllocation: {
    amountFormatted: '$0k',
    growth: 0,
    categories: []
  },
  completedTasksCount: 0,
  teams: [
    { id: 'a1111111-1111-1111-1111-111111111111', name: "Marketing", badge: 'M' },
    { id: 'a2222222-2222-2222-2222-222222222222', name: "Design", badge: 'D' },
    { id: 'a3333333-3333-3333-3333-333333333333', name: "Production", badge: 'P' },
    { id: 'a4444444-4444-4444-4444-444444444444', name: "Development", badge: 'DEV' },
    { id: 'a5555555-5555-5555-5555-555555555555', name: "Operations", badge: 'OPS' },
  ]
};

export const initialCompanyList = [];
export const initialTaskList = [];
export const initialNotesList = [];
export const initialContactsList = [];
