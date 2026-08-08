import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function TaskProgressCard({ data, onNavigateTasks }) {
  const percentage = data?.percentage !== undefined ? data.percentage : 0;
  const completed = data?.completed !== undefined ? data.completed : 0;
  const total = data?.total !== undefined ? data.total : 0;

  const circumference = 2 * Math.PI * 40; // ~251.3
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between font-sans">
      <div className="flex items-center gap-5">
        {/* Donut Progress Circle */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-gray-200"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="text-black transition-all duration-700 ease-out"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-black">{percentage}%</span>
          </div>
        </div>

        {/* Text Details */}
        <div>
          <span className="text-xs font-medium text-gray-500 block mb-1">Task Progress</span>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {completed}/{total}
          </h3>
          <span className="text-[11px] font-medium text-gray-400 mt-0.5 block">
            {data?.month || 'This Month'}
          </span>
        </div>
      </div>

      {/* Circle Arrow Right Button */}
      <button
        onClick={onNavigateTasks}
        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-black transition-all shrink-0"
        title="View details"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
