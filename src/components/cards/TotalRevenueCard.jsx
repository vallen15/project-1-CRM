import React, { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function TotalRevenueCard({ data }) {
  const [yearFilter, setYearFilter] = useState('Year');
  const [showDropdown, setShowDropdown] = useState(false);

  const mainYearlyData = data?.yearlyData || [
    { year: '2019', revenue: 15000 },
    { year: '2020', revenue: 28000 },
    { year: '2021', revenue: 22000 },
    { year: '2022', revenue: 45000 },
    { year: '2023', revenue: 56123 },
  ];

  const datasets = {
    Year: {
      amountFormatted: data?.amountFormatted || '$56,123k',
      growth: 12,
      chartData: mainYearlyData
    },
    '2023': {
      amountFormatted: '$56,123k',
      growth: 12,
      chartData: [
        { year: 'Q1', revenue: 11000 },
        { year: 'Q2', revenue: 14000 },
        { year: 'Q3', revenue: 13500 },
        { year: 'Q4', revenue: 17623 },
      ]
    },
    '2022': {
      amountFormatted: '$45,000k',
      growth: 9,
      chartData: [
        { year: 'Q1', revenue: 9000 },
        { year: 'Q2', revenue: 11500 },
        { year: 'Q3', revenue: 10500 },
        { year: 'Q4', revenue: 14000 },
      ]
    }
  };

  const currentDataset = datasets[yearFilter] || datasets.Year;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Total Revenue</span>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 bg-white border border-gray-300 text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-all"
          >
            <span>{yearFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-8 w-28 bg-white border border-gray-200 rounded-lg shadow-md py-1 z-30 space-y-0.5 text-xs">
              {['Year', '2023', '2022'].map(yr => (
                <button
                  key={yr}
                  onClick={() => {
                    setYearFilter(yr);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${yearFilter === yr ? 'font-bold text-black bg-gray-50' : 'text-gray-600'}`}
                >
                  {yr}
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

      {/* Line Chart with Vertical Gridlines */}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentDataset.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
            />
            <Tooltip
              formatter={(val) => [`$${val.toLocaleString()}k`, 'Revenue']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#000000"
              strokeWidth={2}
              dot={{ r: 3, fill: '#000000' }}
              activeDot={{ r: 5, fill: '#000000' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
