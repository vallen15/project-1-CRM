import React from 'react';
import { Info } from 'lucide-react';

export default function HighlightedCompanyCard({ data }) {
  const bars = data?.sparkline && data.sparkline.length > 0 ? data.sparkline : [1, 2, 1, 3, 2, 4, 2, 5, 3, 4, 2, 3];
  const initialLetter = data?.name && data.name !== 'No Company Available' ? data.name.trim()[0].toUpperCase() : 'C';
  const logoBg = data?.logo_bg || 'bg-black';

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-2xs flex flex-col justify-between h-full font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500">Highlighted Companies</span>
          <button title="Highest Value / Featured Partner" className="text-gray-400 hover:text-gray-600">
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Logo Circle & Company Title */}
        <div className="flex flex-col items-center text-center my-3">
          <div className={`w-14 h-14 rounded-full ${logoBg} flex items-center justify-center mb-3 shadow-sm transition-all`}>
            <span className="text-white font-bold text-xl tracking-tight">{initialLetter}</span>
          </div>
          <h4 className="text-lg font-bold text-gray-900 tracking-tight">
            {data?.name || 'No Company Available'}
          </h4>
          <span className="text-xs font-medium text-gray-400">
            {data?.category || 'General'}
          </span>
        </div>

        {/* Big Number & Subtitle */}
        <div className="text-center my-4">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {data?.formattedTransactions !== undefined ? data.formattedTransactions : '0'}
          </h2>
          <p className="text-[11px] font-medium text-gray-500 max-w-[190px] mx-auto mt-1">
            Total Transactions & Activities in Database
          </p>
        </div>
      </div>

      {/* Vertical Histogram Bars */}
      <div className="flex items-end justify-center gap-1.5 h-14 pt-2">
        {bars.map((h, idx) => (
          <div
            key={idx}
            style={{ height: `${Math.max((h / 10) * 100, 10)}%` }}
            className={`w-2.5 rounded-[2px] ${idx % 2 === 0 ? 'bg-black' : 'bg-[#4b5563]'}`}
          />
        ))}
      </div>
    </div>
  );
}
