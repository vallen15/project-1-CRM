import { apiCompanies, apiRevenues, apiExpenses, apiTasks, apiProfiles, apiTeams } from '../lib/supabase';

export const analyticsService = {
  /**
   * Generates a date range object for Asia/Jakarta timezone filtering
   */
  getDateRange(filter = 'month', customStart = null, customEnd = null) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    if (filter === 'week') {
      const dayOfWeek = now.getDay();
      const start = new Date(year, month, day - dayOfWeek);
      const end = new Date(year, month, day + (6 - dayOfWeek));
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        label: 'This Week'
      };
    } else if (filter === 'year') {
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        label: `Year ${year}`
      };
    } else if (filter === 'custom' && customStart && customEnd) {
      return {
        startDate: customStart,
        endDate: customEnd,
        label: 'Custom Date Range'
      };
    } else {
      // Default: Month
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        label: `${now.toLocaleString('default', { month: 'long' })} ${year}`
      };
    }
  },

  parseAmount(valStr) {
    if (!valStr) return 0;
    if (typeof valStr === 'number') return valStr;
    const cleaned = valStr.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  },

  calculateAnalyticsData({ tasks = [], companies = [], revenues = [], expenses = [], profiles = [], teams = [], filter = 'month' }) {
    const dateRange = this.getDateRange(filter);

    // 1. TASK ANALYTICS (Filtered dynamically by date range)
    const filteredTasks = tasks.filter(t => {
      const taskDate = t.date || t.due_date || t.created_at?.split('T')[0];
      if (!taskDate) return true;
      return taskDate >= dateRange.startDate && taskDate <= dateRange.endDate;
    });

    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s === 'completed' || s === 'done';
    }).length;
    const inProgressTasks = filteredTasks.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s === 'in progress' || s === 'in_progress';
    }).length;
    const todoTasks = filteredTasks.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s === 'todo';
    }).length;
    const cancelledTasks = filteredTasks.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s === 'cancelled' || s === 'canceled';
    }).length;
    const pendingTasks = todoTasks + inProgressTasks;

    const completionRate = totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

    const taskStatusDistribution = [
      { name: 'Completed', count: completedTasks, color: '#10b981' },
      { name: 'In Progress', count: inProgressTasks, color: '#3b82f6' },
      { name: 'Todo', count: todoTasks, color: '#6b7280' },
      { name: 'Cancelled', count: cancelledTasks, color: '#ef4444' }
    ];

    const taskTrendMap = {};
    filteredTasks.forEach(t => {
      const d = t.date || t.due_date || '2026-08-08';
      taskTrendMap[d] = (taskTrendMap[d] || 0) + 1;
    });

    const taskTrend = Object.keys(taskTrendMap).sort().slice(0, 10).map(date => ({
      date,
      count: taskTrendMap[date]
    }));

    // 2. COMPANY ANALYTICS
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'Active' || c.status === 'Featured').length;
    const newCompanies = companies.filter(c => {
      const cDate = c.created_at?.split('T')[0];
      return cDate && cDate >= dateRange.startDate;
    }).length;

    const topCompanies = [...companies].map(c => {
      const companyRev = revenues
        .filter(r => r.company_id === c.id)
        .reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0) || this.parseAmount(c.revenue || 0);

      const companyExp = expenses
        .filter(e => e.company_id === c.id)
        .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0) || this.parseAmount(c.expenses || 0);

      const companyTasksCount = tasks.filter(t => t.company === c.name || t.company_id === c.id).length;
      const txCount = parseInt((c.transactions || '0').toString().replace(/[^0-9]/g, '')) || 0;
      
      return {
        id: c.id,
        name: c.name,
        category: c.category || 'General',
        revenue: companyRev,
        revenueFormatted: `$${companyRev.toLocaleString()}`,
        expenses: companyExp,
        expensesFormatted: `$${companyExp.toLocaleString()}`,
        tasksCount: companyTasksCount,
        transactions: txCount,
        score: companyRev + (companyTasksCount * 100) + txCount
      };
    }).sort((a, b) => b.score - a.score).slice(0, 5);

    // 3. REVENUE ANALYTICS (Pours from revenues array or companies)
    const sumRevFromTable = revenues.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    const sumRevFromCompanies = companies.reduce((acc, c) => acc + this.parseAmount(c.revenue || 0), 0);
    const totalRevenue = sumRevFromTable > 0 ? sumRevFromTable : sumRevFromCompanies;

    const revenueByCompany = companies.map(c => {
      const rev = revenues
        .filter(r => r.company_id === c.id)
        .reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0) || this.parseAmount(c.revenue || 0);
      return { name: c.name, revenue: rev };
    }).sort((a, b) => b.revenue - a.revenue);

    // 4. EXPENSE ANALYTICS (Pours from expenses array or companies)
    const sumExpFromTable = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
    const sumExpFromCompanies = companies.reduce((acc, c) => acc + this.parseAmount(c.expenses || 0), 0);
    const totalExpenses = sumExpFromTable > 0 ? sumExpFromTable : sumExpFromCompanies;

    const expenseByCategoryMap = { Production: 0, Marketing: 0, Operational: 0, Design: 0 };
    expenses.forEach(e => {
      let cat = 'Operational';
      if (e.category_id === 'e1111111-1111-1111-1111-111111111111') cat = 'Production';
      else if (e.category_id === 'e2222222-2222-2222-2222-222222222222') cat = 'Marketing';
      else if (e.category_id === 'e3333333-3333-3333-3333-333333333333') cat = 'Operational';
      else if (e.category_id === 'e4444444-4444-4444-4444-444444444444') cat = 'Design';
      const amt = parseFloat(e.amount) || 0;
      expenseByCategoryMap[cat] = (expenseByCategoryMap[cat] || 0) + amt;
    });

    const expenseByCategory = Object.keys(expenseByCategoryMap).map(name => ({
      name,
      amount: expenseByCategoryMap[name]
    }));

    // 5. PROFIT ANALYTICS
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? parseFloat(((profit / totalRevenue) * 100).toFixed(1)) : 0;

    // 6. TEAM PERFORMANCE ANALYTICS
    const teamPerformance = teams.map(team => {
      const teamTasks = tasks.filter(t => t.team === team.name || t.team?.includes(team.name.split(" ")[0]));
      const tTotal = teamTasks.length;
      const tCompleted = teamTasks.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s === 'completed' || s === 'done';
      }).length;
      const tRate = tTotal > 0 ? parseFloat(((tCompleted / tTotal) * 100).toFixed(1)) : 0;

      return {
        id: team.id,
        name: team.name,
        badge: team.badge || team.name.charAt(0),
        totalTasks: tTotal,
        completedTasks: tCompleted,
        completionRate: tRate,
        inProgress: tTotal - tCompleted
      };
    });

    // 7. USER PERFORMANCE ANALYTICS
    const userPerformance = profiles.map(u => {
      const uTasks = tasks.filter(t => t.created_by === u.id || t.assigned_to === u.id || t.author === u.full_name);
      const uTotal = uTasks.length;
      const uCompleted = uTasks.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s === 'completed' || s === 'done';
      }).length;
      const uRate = uTotal > 0 ? parseFloat(((uCompleted / uTotal) * 100).toFixed(1)) : 0;

      return {
        id: u.id,
        name: u.full_name,
        email: u.email,
        totalTasks: uTotal,
        completedTasks: uCompleted,
        completionRate: uRate
      };
    });

    const financialTrendData = totalRevenue > 0 || totalExpenses > 0 ? [
      { period: dateRange.label, revenue: totalRevenue, expenses: totalExpenses }
    ] : [];

    return {
      dateRange,
      taskAnalytics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        todoTasks,
        cancelledTasks,
        completionRate,
        avgCompletionTime: totalTasks > 0 ? '1.5 Days' : '0 Days',
        taskStatusDistribution,
        taskTrend
      },
      companyAnalytics: {
        totalCompanies,
        activeCompanies,
        newCompanies,
        topCompanies
      },
      revenueAnalytics: {
        totalRevenue,
        formattedRevenue: `$${Math.round(totalRevenue / 1000).toLocaleString()}k`,
        revenueByCompany
      },
      expenseAnalytics: {
        totalExpenses,
        formattedExpenses: `$${Math.round(totalExpenses / 1000).toLocaleString()}k`,
        expenseByCategory
      },
      profitAnalytics: {
        profit,
        formattedProfit: `$${Math.round(profit / 1000).toLocaleString()}k`,
        profitMargin
      },
      teamPerformance,
      userPerformance,
      financialTrendData
    };
  }
};
