import React, { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';

export default function ExpensesAllocationCard({ data }) {
  const [monthFilter, setMonthFilter] = useState('Month');
  const [showDropdown, setShowDropdown] = useState(false);

  const mainCategories = data?.categories || [
    { name: 'Production', value: 10000, max: 40000 },
    { name: 'Marketing', value: 18000, max: 40000 },
    { name: 'Operational', value: 25000, max: 40000 },
    { name: 'Design', value: 32000, max: 40000 },
  ];

  const datasets = {
    Month: {
      amountFormatted: data?.amountFormatted || '$44,171k',
      growth: 12,
      categories: mainCategories
    },
    Q3: {
      amountFormatted: '$120,500k',
      growth: 15,
      categories: [
        { name: 'Production', value: 28000, max: 40000 },
        { name: 'Marketing', value: 35000, max: 40000 },
        { name: 'Operational', value: 30000, max: 40000 },
        { name: 'Design', value: 38000, max: 40000 },
      ]
    },
    Q4: {
      amountFormatted: '$135,200k',
      growth: 18,
      categories: [
        { name: 'Production', value: 32000, max: 40000 },
        { name: 'Marketing', value: 38000, max: 40000 },
        { name: 'Operational', value: 34000, max: 40000 },
        { name: 'Design', value: 39000, max: 40000 },
      ]
    }
  };

  const currentDataset = datasets[monthFilter] || datasets.Month;

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
              {['Month', 'Q3', 'Q4'].map(m => (
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
          {currentDataset.amountFormatted}
        </h3>
        <span className="inline-flex items-center gap-0.5 bg-[#e6f4ea] text-[#137333] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" />
          {currentDataset.growth}%
        </span>
      </div>

      {/* Horizontal Progress Bars */}
      <div className="space-y-2.5 mb-3">
        {currentDataset.categories.map((cat) => {
          const maxValue = cat.max || 40000;
          const pct = Math.min(100, (cat.value / maxValue) * 100);
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
        <span>10k</span>
        <span>20k</span>
        <span>30k</span>
        <span>40k</span>
      </div>
    </div>
  );
}
