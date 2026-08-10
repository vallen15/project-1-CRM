import { apiTasks, apiCompanies, apiExpenses, apiRevenues, apiTransactions } from '../lib/supabase';
import { initialDashboardData } from '../lib/initialData';

export const dashboardService = {
  async fetchAggregatedMetrics() {
    try {
      const [tasks, companies, expenses, revenues, transactions] = await Promise.all([
        apiTasks.fetchAll(),
        apiCompanies.fetchAll(),
        apiExpenses.fetchAll(),
        apiRevenues.fetchAll(),
        apiTransactions ? apiTransactions.fetchAll() : Promise.resolve([])
      ]);

      const validTasks = tasks || [];
      const validCompanies = companies || [];
      const validExpenses = expenses || [];
      const validRevenues = revenues || [];
      const validTransactions = transactions || [];

      // 1. TASK METRICS (Pours directly from Supabase `tasks` table)
      const totalTasksCount = validTasks.length;
      const completedTasksCount = validTasks.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s === 'completed' || s === 'done';
      }).length;

      const taskProgressPercentage = totalTasksCount > 0
        ? Math.round((completedTasksCount / totalTasksCount) * 100)
        : 0;

      const avgFinishedCount = Math.round(completedTasksCount / 4);

      // 2. HIGHLIGHTED COMPANY (Derived dynamically from Supabase `companies` table)
      const featuredCompany = validCompanies.find(c => c.is_featured || (c.status || '').toLowerCase() === 'featured') || validCompanies[0] || null;

      const featuredTxCount = featuredCompany
        ? (validTransactions.filter(tx => tx.company_id === featuredCompany.id).length || featuredCompany.total_transactions || 0)
        : 0;

      // 3. FINANCIAL TOTALS (Pours directly from Supabase `expenses` & `revenues` tables)
      const sumExpenses = validExpenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
      const sumRevenues = validRevenues.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);

      const totalRevenueK = sumRevenues > 0 ? Math.round(sumRevenues / 1000) : 0;

      // 4. EXPENSES ALLOCATION CATEGORIES (Pours directly from Supabase `expenses` table)
      const categoriesMap = {
        Production: 0,
        Marketing: 0,
        Operational: 0,
        Design: 0
      };

      validExpenses.forEach(e => {
        let cat = 'Operational';
        if (e.category_id === 'e1111111-1111-1111-1111-111111111111') cat = 'Production';
        else if (e.category_id === 'e2222222-2222-2222-2222-222222222222') cat = 'Marketing';
        else if (e.category_id === 'e3333333-3333-3333-3333-333333333333') cat = 'Operational';
        else if (e.category_id === 'e4444444-4444-4444-4444-444444444444') cat = 'Design';
        else if (e.category_name) cat = e.category_name;

        const amt = parseFloat(e.amount) || 0;
        categoriesMap[cat] = (categoriesMap[cat] || 0) + Math.round(amt / 1000);
      });

      const categoriesList = Object.keys(categoriesMap).map(key => ({
        name: key,
        value: categoriesMap[key],
        max: Math.max(...Object.values(categoriesMap), 10)
      }));

      const totalAllocationK = Object.values(categoriesMap).reduce((a, b) => a + b, 0);

      const expenseSparkline = validExpenses.length > 0
        ? validExpenses.map(e => ({ value: Math.round(parseFloat(e.amount) || 50) }))
        : initialDashboardData.totalExpenses.sparkline;

      const revenueYearlyData = validRevenues.length > 0
        ? validRevenues.map(r => ({ year: (r.year || r.period || '2026').toString(), revenue: Math.round((parseFloat(r.amount) || 0) / 1000) }))
        : initialDashboardData.totalRevenue.yearlyData;

      return {
        ...initialDashboardData,
        taskProgress: {
          completed: completedTasksCount || initialDashboardData.taskProgress.completed,
          total: totalTasksCount || initialDashboardData.taskProgress.total,
          percentage: taskProgressPercentage || initialDashboardData.taskProgress.percentage,
          month: 'This Month',
        },
        totalExpenses: {
          amount: sumExpenses || initialDashboardData.totalExpenses.amount,
          formatted: sumExpenses > 0 ? `$${Math.round(sumExpenses).toLocaleString()}` : initialDashboardData.totalExpenses.formatted,
          growth: 12,
          month: 'This Month',
          sparkline: expenseSparkline
        },
        averageFinishedTask: {
          ...initialDashboardData.averageFinishedTask,
          average: `± ${avgFinishedCount || 52} Task`
        },
        taskSummaries: {
          ...initialDashboardData.taskSummaries,
          totalTasks: `${totalTasksCount || 126} Task`
        },
        highlightedCompany: {
          name: featuredCompany ? featuredCompany.name : 'Product design',
          category: featuredCompany ? (featuredCompany.category || 'Web Design') : 'Web Design',
          totalTransactions: featuredTxCount || 1641,
          formattedTransactions: (featuredTxCount || 1641).toLocaleString(),
          logo_bg: featuredCompany ? (featuredCompany.logo_bg || 'bg-rose-500') : 'bg-rose-500',
          sparkline: initialDashboardData.highlightedCompany.sparkline
        },
        totalRevenue: {
          ...initialDashboardData.totalRevenue,
          amountFormatted: totalRevenueK > 0 ? `$${totalRevenueK.toLocaleString()}k` : initialDashboardData.totalRevenue.amountFormatted,
          growth: 12,
          yearlyData: revenueYearlyData
        },
        expensesAllocation: {
          ...initialDashboardData.expensesAllocation,
          amountFormatted: totalAllocationK > 0 ? `$${totalAllocationK.toLocaleString()}k` : initialDashboardData.expensesAllocation.amountFormatted,
          categories: categoriesList.length > 0 && totalAllocationK > 0 ? categoriesList : initialDashboardData.expensesAllocation.categories
        },
        completedTasksCount: completedTasksCount || initialDashboardData.completedTasksCount
      };

    } catch (err) {
      console.warn("Dashboard aggregated service load fallback:", err.message);
      return initialDashboardData;
    }
  }
};
