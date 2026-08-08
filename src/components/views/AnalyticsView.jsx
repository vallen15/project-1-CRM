import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  CheckCircle2,
  Calendar,
  DollarSign,
  PieChart,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Layers,
  CheckSquare,
  Activity,
  Award,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';

export default function AnalyticsView({
  tasks = [],
  companies = [],
  dashboardData,
  currentUser,
  teams = [],
  profiles = []
}) {
  const [filter, setFilter] = useState('month'); // 'week', 'month', 'year'
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [filter, tasks, companies, dashboardData]);

  const fetchAnalytics = () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = analyticsService.calculateAnalyticsData({
        tasks,
        companies,
        dashboardData,
        profiles,
        teams,
        filter
      });
      setAnalyticsData(data);
    } catch (err) {
      console.warn("Analytics calculation error:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = (currentUser?.role || currentUser?.user_metadata?.role || '').toLowerCase() === 'admin';

  if (isLoading && !analyticsData) {
    return (
      <div className="p-12 text-center text-gray-500 font-medium text-xs space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-black" />
        <p>Loading Supabase analytics aggregations...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold space-y-3 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <p>Unable to load live analytics data.</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 text-xs shadow-2xs"
        >
          Retry Fetching Analytics
        </button>
      </div>
    );
  }

  const {
    dateRange,
    taskAnalytics,
    companyAnalytics,
    revenueAnalytics,
    expenseAnalytics,
    profitAnalytics,
    teamPerformance,
    userPerformance,
    financialTrendData
  } = analyticsData || analyticsService.calculateAnalyticsData({ tasks, companies, filter: 'month' });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CRM Analytics Engine</h1>
            {isAdmin ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> FULL ADMIN ANALYTICS
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                TEAM ANALYTICS
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Live database aggregations for <span className="font-bold text-black">{dateRange?.label}</span>
          </p>
        </div>

        {/* Date Filter Controls (Week / Month / Year) */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
          {['week', 'month', 'year'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f
                  ? 'bg-black text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}

          <button
            onClick={fetchAnalytics}
            className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 ml-1"
            title="Refresh Real-Time Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-black' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subnav Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 pb-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeSubTab === 'overview' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeSubTab === 'tasks' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Task Analytics
        </button>

        <button
          onClick={() => setActiveSubTab('companies')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeSubTab === 'companies' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Company Analytics
        </button>

        <button
          onClick={() => setActiveSubTab('revenue')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeSubTab === 'revenue' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Revenue & Profit
        </button>

        <button
          onClick={() => setActiveSubTab('teams')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${
            activeSubTab === 'teams' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Team & User Performance
        </button>
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
                <span>Task Completion Rate</span>
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">{taskAnalytics.completionRate}%</h3>
              <span className="text-[11px] text-gray-500 font-medium block">
                {taskAnalytics.completedTasks} of {taskAnalytics.totalTasks} tasks done
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
                <span>Total Live Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-600">{revenueAnalytics.formattedRevenue}</h3>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +12% Growth
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
                <span>Total Live Expenses</span>
                <DollarSign className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-rose-600">{expenseAnalytics.formattedExpenses}</h3>
              <span className="text-[11px] text-gray-500 font-medium block">
                4 Allocation Categories
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
                <span>Profit Margin</span>
                <Zap className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">+{profitAnalytics.profitMargin}%</h3>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                Net Profit {profitAnalytics.formattedProfit}
              </span>
            </div>
          </div>

          {/* Revenue vs Expenses Financial Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Financial Performance (Revenue vs Expenses)</h3>
                <p className="text-xs text-gray-500 font-medium">Synced 1:1 with Supabase financial ledgers</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-black" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Expenses</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialTrendData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: TASK ANALYTICS */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Tasks</span>
              <h4 className="text-2xl font-extrabold text-gray-900 mt-1">{taskAnalytics.totalTasks}</h4>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Completed</span>
              <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">{taskAnalytics.completedTasks}</h4>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase">In Progress</span>
              <h4 className="text-2xl font-extrabold text-blue-600 mt-1">{taskAnalytics.inProgressTasks}</h4>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Pending Todo</span>
              <h4 className="text-2xl font-extrabold text-gray-700 mt-1">{taskAnalytics.todoTasks}</h4>
            </div>
          </div>

          {/* Task Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900">Task Status Distribution</h3>
            <div className="space-y-3">
              {taskAnalytics.taskStatusDistribution.map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{item.name}</span>
                    <span>{item.count} tasks ({taskAnalytics.totalTasks > 0 ? ((item.count / taskAnalytics.totalTasks) * 100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${taskAnalytics.totalTasks > 0 ? (item.count / taskAnalytics.totalTasks) * 100 : 0}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: COMPANY ANALYTICS */}
      {activeSubTab === 'companies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Companies</span>
              <h4 className="text-2xl font-extrabold text-gray-900 mt-1">{companyAnalytics.totalCompanies}</h4>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Active / Featured</span>
              <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">{companyAnalytics.activeCompanies}</h4>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-600 uppercase">New Onboarded</span>
              <h4 className="text-2xl font-extrabold text-indigo-600 mt-1">{companyAnalytics.newCompanies}</h4>
            </div>
          </div>

          {/* Top Companies Ranking */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden divide-y divide-gray-100">
            <div className="p-4 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider flex justify-between">
              <span>Top Companies Ranking (Activity & Revenue)</span>
              <span>Total: {companyAnalytics.topCompanies.length} Companies</span>
            </div>
            {companyAnalytics.topCompanies.map((c, idx) => (
              <div key={c.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white font-extrabold text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{c.name}</h4>
                    <span className="text-gray-500 text-[11px]">{c.category} • {c.tasksCount} Tasks</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 text-sm block">{c.revenueFormatted}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{c.transactions} Transactions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: REVENUE & PROFIT */}
      {activeSubTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-gray-500">Total Live Revenue</span>
              <h3 className="text-2xl font-extrabold text-emerald-600">{revenueAnalytics.formattedRevenue}</h3>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-gray-500">Total Expenses</span>
              <h3 className="text-2xl font-extrabold text-rose-600">{expenseAnalytics.formattedExpenses}</h3>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-gray-500">Net Calculated Profit</span>
              <h3 className="text-2xl font-extrabold text-gray-900">{profitAnalytics.formattedProfit}</h3>
            </div>
          </div>

          {/* Revenue By Company List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden divide-y divide-gray-100">
            <div className="p-4 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider">
              Revenue Contribution By Company
            </div>
            {revenueAnalytics.revenueByCompany.map(item => (
              <div key={item.name} className="p-4 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">{item.name}</span>
                <span className="font-extrabold text-emerald-600">${item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: TEAM & USER PERFORMANCE */}
      {activeSubTab === 'teams' && (
        <div className="space-y-6">
          {/* Team Performance Cards */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden divide-y divide-gray-100">
            <div className="p-4 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider flex justify-between">
              <span>Department Team Workload & SLA Performance</span>
              <span>{teamPerformance.length} Active Teams</span>
            </div>
            {teamPerformance.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center">
                    {t.badge}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <span className="text-[11px] text-gray-500">{t.completedTasks} completed / {t.totalTasks} total tasks</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-gray-900 text-sm block">{t.completionRate}% SLA</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{t.inProgress} In Progress</span>
                </div>
              </div>
            ))}
          </div>

          {/* User Performance Cards */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden divide-y divide-gray-100">
            <div className="p-4 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider flex justify-between">
              <span>User Team Member Performance</span>
              <span>{userPerformance.length} Users</span>
            </div>
            {userPerformance.map(u => (
              <div key={u.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{u.name}</h4>
                  <span className="text-[11px] text-gray-500 font-mono">{u.email}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 text-sm block">{u.completionRate}%</span>
                  <span className="text-[10px] text-gray-400">{u.completedTasks} / {u.totalTasks} tasks completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
