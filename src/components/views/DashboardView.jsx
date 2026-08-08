import React from 'react';
import TaskProgressCard from '../cards/TaskProgressCard';
import TotalExpensesCard from '../cards/TotalExpensesCard';
import AverageFinishedTaskCard from '../cards/AverageFinishedTaskCard';
import TaskSummaryCard from '../cards/TaskSummaryCard';
import HighlightedCompanyCard from '../cards/HighlightedCompanyCard';
import TotalRevenueCard from '../cards/TotalRevenueCard';
import ExpensesAllocationCard from '../cards/ExpensesAllocationCard';
import CompletedTaskCard from '../cards/CompletedTaskCard';

export default function DashboardView({ dashboardData, tasks = [], onNavigateTasks }) {
  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
      </div>

      {/* Main Grid matching reference layout 1:1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Row Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TaskProgressCard
              data={dashboardData?.taskProgress}
              onNavigateTasks={onNavigateTasks}
            />
            <TotalExpensesCard
              data={dashboardData?.totalExpenses}
            />
          </div>

          {/* Middle Row (Task Management Summaries Stacked Bar Chart) */}
          <TaskSummaryCard
            data={dashboardData?.taskSummaries}
            tasks={tasks}
          />

          {/* Bottom Left Row (Total Revenue + Expenses Allocation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TotalRevenueCard
              data={dashboardData?.totalRevenue}
            />
            <ExpensesAllocationCard
              data={dashboardData?.expensesAllocation}
            />
          </div>

        </div>

        {/* Rightmost Column */}
        <div className="space-y-6 flex flex-col justify-between">
          <AverageFinishedTaskCard
            data={dashboardData?.averageFinishedTask}
            tasks={tasks}
          />

          <HighlightedCompanyCard
            data={dashboardData?.highlightedCompany}
          />

          <CompletedTaskCard
            data={dashboardData?.completedTasksCount}
            onNavigateTasks={onNavigateTasks}
          />
        </div>

      </div>
    </div>
  );
}
