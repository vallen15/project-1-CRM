import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from 'recharts';

export default function TotalExpensesCard({ data }) {
  const sparklineData = data?.sparkline && data.sparkline.length > 0 ? data.sparkline : [
    { value: 0 }, { value: 0 }
  ];

  const defaultFormatted = data?.formatted || '$0';
  const [hoverValue, setHoverValue] = useState(null);

  const displayAmount = hoverValue !== null ? `$${hoverValue.toLocaleString()}` : defaultFormatted;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between font-sans">
      {/* Left Sparkline with Vertical Dashed Gridlines & Interactive Point Hovering */}
      <div className="w-28 h-14 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sparklineData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            onMouseMove={(state) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                setHoverValue(state.activePayload[0].value);
              }
            }}
            onMouseLeave={() => setHoverValue(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#e5e7eb" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#000000"
              strokeWidth={1.8}
              dot={{ r: 2.5, fill: '#000000' }}
              activeDot={{ r: 4.5, fill: '#000000' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Right Details */}
      <div className="text-right">
        <span className="text-xs font-medium text-gray-500 block mb-1">Total Expenses</span>
        <div className="flex items-center justify-end gap-2">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight transition-all">
            {displayAmount}
          </h3>
          <span className="inline-flex items-center gap-0.5 bg-[#e6f4ea] text-[#137333] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {data?.growth || 0}%
          </span>
        </div>
        <span className="text-[11px] font-medium text-gray-400 mt-0.5 block">
          {hoverValue !== null ? 'Selected Point' : (data?.month || 'This Month')}
        </span>
      </div>
    </div>
  );
}
