import { apiTasks, apiCompanies, apiExpenses, apiRevenues } from '../lib/supabase';
import { initialDashboardData } from '../lib/initialData';

export const dashboardService = {
  async fetchAggregatedMetrics() {
    try {
      const [tasks, companies, expenses, revenues] = await Promise.all([
        apiTasks.fetchAll(),
        apiCompanies.fetchAll(),
        apiExpenses.fetchAll(),
        apiRevenues.fetchAll()
      ]);

      const validTasks = tasks || [];
      const validCompanies = companies || [];
      const validExpenses = expenses || [];
      const validRevenues = revenues || [];

      // 1. Task Metrics 100% Dynamic Aggregation from Supabase Tasks Database
      const completedTasksCount = validTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
      const totalTasksCount = validTasks.length;
      const taskProgressPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

      // 2. Highlighted Company Selection
      const featuredCompany = validCompanies.find(c => c.is_featured || c.status === 'Featured') || validCompanies[0] || {
        name: 'Product design',
        category: 'Web Design',
        transactions: '1,641',
        logo_bg: 'bg-[#d94e34]'
      };

      // 3. Financial Totals Aggregation
      const sumExpenses = validExpenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
      const monthlyExpenseAmount = sumExpenses > 0 ? sumExpenses : 8414;

      const sumRevenues = validRevenues.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
      const totalRevenueK = sumRevenues > 0 ? Math.round(sumRevenues / 1000) : 56;

      // 4. Expenses Allocation Categories
      const categoriesMap = {
        Production: 0,
        Marketing: 0,
        Operational: 0,
        Design: 0
      };

      validExpenses.forEach(e => {
        let cat = 'Operational';
        if (e.category_id === 'e1111111-1111-1111-1111-111111111111' || (e.category && e.category.includes('Prod'))) cat = 'Production';
        else if (e.category_id === 'e2222222-2222-2222-2222-222222222222' || (e.category && e.category.includes('Mark'))) cat = 'Marketing';
        else if (e.category_id === 'e3333333-3333-3333-3333-333333333333' || (e.category && e.category.includes('Oper'))) cat = 'Operational';
        else if (e.category_id === 'e4444444-4444-4444-4444-444444444444' || (e.category && e.category.includes('Desi'))) cat = 'Design';

        const amt = parseFloat(e.amount) || 0;
        categoriesMap[cat] += Math.round(amt);
      });

      const categoriesList = Object.keys(categoriesMap).map(key => ({
        name: key,
        value: categoriesMap[key],
        max: Math.max(...Object.values(categoriesMap), 40000)
      }));

      const totalAllocationK = Math.round(monthlyExpenseAmount / 1000);

      return {
        ...initialDashboardData,
        taskProgress: {
          completed: completedTasksCount,
          total: totalTasksCount,
          percentage: taskProgressPercentage,
          month: 'This Month',
        },
        totalExpenses: {
          amount: monthlyExpenseAmount,
          formatted: `$${Math.round(monthlyExpenseAmount).toLocaleString()}`,
          growth: 12,
          month: 'This Month',
          sparkline: [
            { value: 4000 },
            { value: 7500 },
            { value: 3000 },
            { value: 6200 },
            { value: 5100 },
            { value: Math.round(monthlyExpenseAmount) }
          ]
        },
        averageFinishedTask: {
          ...initialDashboardData.averageFinishedTask,
          average: `± ${completedTasksCount} Task`
        },
        taskSummaries: {
          ...initialDashboardData.taskSummaries,
          totalTasks: `${totalTasksCount} Task`
        },
        highlightedCompany: {
          name: featuredCompany.name,
          category: featuredCompany.category,
          totalTransactions: featuredCompany.total_transactions || featuredCompany.transactions || '1,641',
          formattedTransactions: featuredCompany.total_transactions || featuredCompany.transactions || '1,641',
          logo_bg: featuredCompany.logo_bg || 'bg-[#d94e34]',
          sparkline: [3, 8, 4, 9, 2, 7, 3, 10, 5, 8, 2, 5]
        },
        totalRevenue: {
          ...initialDashboardData.totalRevenue,
          amountFormatted: `$${totalRevenueK.toLocaleString()}k`,
          growth: 12
        },
        expensesAllocation: {
          ...initialDashboardData.expensesAllocation,
          amountFormatted: `$${totalAllocationK.toLocaleString()}k`,
          categories: categoriesList
        },
        completedTasksCount: completedTasksCount
      };

    } catch (err) {
      console.warn("Dashboard aggregated service load fallback:", err.message);
      return initialDashboardData;
    }
  }
};
