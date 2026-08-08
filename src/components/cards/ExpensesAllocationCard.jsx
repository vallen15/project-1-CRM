import React, { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';

export default function ExpensesAllocationCard({ data }) {
  const [monthFilter, setMonthFilter] = useState('Month');
  const [showDropdown, setShowDropdown] = useState(false);

  const amountFormatted = data?.amountFormatted || '$0k';
  const categories = data?.categories && data.categories.length > 0 ? data.categories : [
    { name: 'Production', value: 0, max: 100 },
    { name: 'Marketing', value: 0, max: 100 },
    { name: 'Operational', value: 0, max: 100 },
    { name: 'Design', value: 0, max: 100 },
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Expenses Allocation</span>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 bg-white border border-gray-300 text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-all"
          >
            <span>{monthFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-8 w-28 bg-white border border-gray-200 rounded-lg shadow-md py-1 z-30 space-y-0.5 text-xs">
              {['Month'].map(m => (
                <button
                  key={m}
                  onClick={() => {
                    setMonthFilter(m);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${monthFilter === m ? 'font-bold text-black bg-gray-50' : 'text-gray-600'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Amount & Growth */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
          {amountFormatted}
        </h3>
        <span className="inline-flex items-center gap-0.5 bg-[#e6f4ea] text-[#137333] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" />
          {data?.growth || 0}%
        </span>
      </div>

      {/* Horizontal Progress Bars */}
      <div className="space-y-2.5 mb-3">
        {categories.map((cat) => {
          const maxValue = cat.max || 100;
          const pct = maxValue > 0 ? Math.min(100, (cat.value / maxValue) * 100) : 0;
          return (
            <div key={cat.name} className="flex items-center gap-3 text-xs font-medium">
              <span className="w-20 text-gray-600 font-medium truncate">{cat.name}</span>
              <div className="flex-1 bg-[#e5e7eb] rounded-[2px] h-3.5 overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className="h-full bg-black rounded-[2px] transition-all duration-500"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Ticks */}
      <div className="flex justify-between items-center text-[10px] font-medium text-gray-400 pl-23 pr-0.5">
        <span>0</span>
        <span>Allocated</span>
      </div>
    </div>
  );
}
