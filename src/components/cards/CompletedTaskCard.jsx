import React from 'react';

export default function CompletedTaskCard({ data, tasks = [], onNavigateTasks }) {
  const completedFromTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
  const completedCount = data !== undefined && data !== null ? data : completedFromTasks;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between">
      <div>
        <span className="text-xs font-medium text-gray-500 block mb-1">Completed Task</span>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
          {completedCount} Task
        </h3>
      </div>

      <button
        onClick={onNavigateTasks}
        className="px-4 py-1.5 bg-white border border-gray-300 text-xs font-semibold text-gray-800 rounded-lg hover:bg-gray-50 transition-all"
      >
        View All
      </button>
    </div>
  );
}
