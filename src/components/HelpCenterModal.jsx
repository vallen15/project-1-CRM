import React from 'react';
import { X, HelpCircle, Keyboard, Database, CheckSquare, Layers } from 'lucide-react';

export default function HelpCenterModal({ isOpen, onClose, onOpenSupabaseModal }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-black flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Help Center & User Guide</h3>
              <p className="text-xs text-gray-500 font-medium">Dashboard features, shortcuts, and Supabase database guide</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-gray-700">
          {/* Shortcuts section */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-black" />
              <span>Keyboard Shortcuts</span>
            </h4>
            <div className="bg-gray-50 p-3 rounded-xl space-y-2 font-medium">
              <div className="flex justify-between items-center">
                <span>Quick Search Palette</span>
                <div className="flex gap-1">
                  <kbd className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-mono">⌘</kbd>
                  <kbd className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-mono">F</kbd>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Close Modals / Drawers</span>
                <kbd className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-mono">ESC</kbd>
              </div>
            </div>
          </div>

          {/* Features section */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-black" />
              <span>Dashboard Interactivity</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 leading-relaxed font-medium">
              <li><strong>Interactive Filters:</strong> Click dropdown buttons (Week, Month, Year) on cards to switch timeframe datasets.</li>
              <li><strong>Team Selector:</strong> Bottom-left team dropdown filters tasks and summary breakdowns by department.</li>
              <li><strong>Task Syncing:</strong> Adding or updating task status instantly recalculates Task Progress and Completed Tasks.</li>
            </ul>
          </div>

          {/* Database Setup */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-black" />
              <span>Supabase Connection</span>
            </h4>
            <p className="text-gray-600 leading-relaxed font-medium">
              The application runs with built-in local state by default. You can connect your live Supabase database anytime by clicking the connection button in the navbar.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenSupabaseModal();
              }}
              className="w-full py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all text-center"
            >
              Configure Supabase Credentials & SQL
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-300"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
