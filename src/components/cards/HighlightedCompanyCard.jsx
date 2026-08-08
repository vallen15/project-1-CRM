import React from 'react';
import { Info } from 'lucide-react';

export default function HighlightedCompanyCard({ data }) {
  // Bar height proportions matching reference image sparkline
  const bars = data?.sparkline || [3, 8, 4, 9, 2, 7, 3, 10, 5, 8, 2, 5];
  
  // Dynamic Initial Letter (e.g., 'Product design' -> 'P', 'Acme Corp' -> 'A')
  const initialLetter = data?.name ? data.name.trim()[0].toUpperCase() : 'P';
  const logoBg = data?.logo_bg || 'bg-[#d94e34]';

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200/80 shadow-2xs flex flex-col justify-between h-full">
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
            {data?.name || 'Product design'}
          </h4>
          <span className="text-xs font-medium text-gray-400">
            {data?.category || 'Web Design'}
          </span>
        </div>

        {/* Big Number & Subtitle */}
        <div className="text-center my-4">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {data?.formattedTransactions || '1,641'}
          </h2>
          <p className="text-[11px] font-medium text-gray-500 max-w-[190px] mx-auto mt-1">
            Total Transaction & Activities in Last Month
          </p>
        </div>
      </div>

      {/* Vertical Histogram Bars */}
      <div className="flex items-end justify-center gap-1.5 h-14 pt-2">
        {bars.map((h, idx) => (
          <div
            key={idx}
            style={{ height: `${(h / 10) * 100}%` }}
            className={`w-2.5 rounded-[2px] ${idx % 2 === 0 ? 'bg-black' : 'bg-[#4b5563]'}`}
          />
        ))}
      </div>
    </div>
  );
}
