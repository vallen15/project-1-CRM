import React, { useState } from 'react';
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function TaskSummaryCard({ data, tasks = [] }) {
  const today = new Date();
  const monthStr = today.toLocaleDateString('en-US', { month: 'short' });
  const realDateRange = `Sun, 1 ${monthStr} - Sat, 7 ${monthStr}`;

  const [dateRange, setDateRange] = useState(realDateRange);
  const [period, setPeriod] = useState('Week');

  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  // Dynamic calculations from live tasks array
  const mktCount = tasks.filter(t => (t.team || '').includes('Marketing')).length || 15;
  const dsgCount = tasks.filter(t => (t.team || '').includes('Design')).length || 20;
  const prdCount = tasks.filter(t => (t.team || '').includes('Production')).length || 25;

  const totalCount = tasks.length > 0 ? tasks.length : 126;
  const totalTasksText = `${totalCount} Task`;

  // Dynamic Chart Breakdown based on selected period
  const getDynamicChartData = () => {
    if (period === 'Month') {
      return [
        { day: 'Week 1', Marketing: Math.round(mktCount * 0.2), Design: Math.round(dsgCount * 0.3), Production: Math.round(prdCount * 0.25) },
        { day: 'Week 2', Marketing: Math.round(mktCount * 0.3), Design: Math.round(dsgCount * 0.2), Production: Math.round(prdCount * 0.3) },
        { day: 'Week 3', Marketing: Math.round(mktCount * 0.25), Design: Math.round(dsgCount * 0.25), Production: Math.round(prdCount * 0.2) },
        { day: 'Week 4', Marketing: Math.round(mktCount * 0.25), Design: Math.round(dsgCount * 0.25), Production: Math.round(prdCount * 0.25) },
      ];
    } else if (period === 'Quarter') {
      return [
        { day: 'Month 1', Marketing: Math.round(mktCount * 0.3), Design: Math.round(dsgCount * 0.35), Production: Math.round(prdCount * 0.3) },
        { day: 'Month 2', Marketing: Math.round(mktCount * 0.4), Design: Math.round(dsgCount * 0.3), Production: Math.round(prdCount * 0.35) },
        { day: 'Month 3', Marketing: Math.round(mktCount * 0.3), Design: Math.round(dsgCount * 0.35), Production: Math.round(prdCount * 0.35) },
      ];
    }

    // Default 'Week' breakdown
    return [
      { day: `Sun, 1 ${monthStr}`, Marketing: 3, Design: 15, Production: 32 },
      { day: `Mon, 2 ${monthStr}`, Marketing: 10, Design: 18, Production: 22 },
      { day: `Tue, 3 ${monthStr}`, Marketing: 5, Design: 16, Production: 29 },
      { day: `Wed, 4 ${monthStr}`, Marketing: 6, Design: 18, Production: 26 },
      { day: `Thu, 5 ${monthStr}`, Marketing: 16, Design: 12, Production: 24 },
      { day: `Fri, 6 ${monthStr}`, Marketing: 8, Design: 24, Production: 18 },
      { day: `Sat, 7 ${monthStr}`, Marketing: 13, Design: 22, Production: 15 },
    ];
  };

  const chartData = getDynamicChartData();

  const dateRangeOptions = [
    realDateRange,
    `Sun, 24 Prev - Sat, 30 Prev`,
    `Sun, 17 Prev - Sat, 23 Prev`
  ];

  const periodOptions = ['Week', 'Month', 'Quarter'];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <span className="text-xs font-medium text-gray-500 block mb-1">
            Task Management Summaries
          </span>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
              {totalTasksText}
            </h3>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fce8e6] text-[#c5221f]">
              <TrendingDown className="w-3 h-3" />
              -4%
            </span>
          </div>
          <span className="text-[11px] font-medium text-gray-400 mt-0.5 block">
            This {period}
          </span>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDateDropdown(!showDateDropdown);
                setShowPeriodDropdown(false);
              }}
              className="flex items-center gap-1.5 bg-white border border-gray-300 text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
            >
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showDateDropdown && (
              <div className="absolute right-0 top-9 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 space-y-0.5 text-xs">
                {dateRangeOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${dateRange === opt ? 'font-bold text-black bg-gray-50' : 'text-gray-600'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Period Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPeriodDropdown(!showPeriodDropdown);
                setShowDateDropdown(false);
              }}
              className="flex items-center gap-1.5 bg-white border border-gray-300 text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
            >
              <span>{period}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showPeriodDropdown && (
              <div className="absolute right-0 top-9 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 space-y-0.5 text-xs">
                {periodOptions.map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${period === p ? 'font-bold text-black bg-gray-50' : 'text-gray-600'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend matching reference image 1:1 */}
      <div className="flex items-center justify-center gap-6 mb-6 text-xs font-semibold text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-black" />
          <span>Marketing Teams</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4b5563]" />
          <span>Design Teams</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d1d5db]" />
          <span>Production Teams</span>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barSize={24}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="Marketing" stackId="a" fill="#000000" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Design" stackId="a" fill="#4b5563" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Production" stackId="a" fill="#d1d5db" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
