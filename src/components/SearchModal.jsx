import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, FileText, Users, Building2 } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, setActiveTab }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled outside or state toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'Dashboard Overview', tab: 'dashboard', category: 'Views', icon: CheckSquare },
    { label: 'Tasks Management', tab: 'tasks', category: 'Tasks', icon: CheckSquare },
    { label: 'Notes & Documentation', tab: 'notes', category: 'Docs', icon: FileText },
    { label: 'Contacts & Leads', tab: 'contacts', category: 'Database', icon: Users },
    { label: 'Companies Overview', tab: 'companies', category: 'Database', icon: Building2 },
  ];

  const filteredLinks = quickLinks.filter(l =>
    l.label.toLowerCase().includes(query.toLowerCase()) ||
    l.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, notes, contacts, companies..."
            className="w-full text-base outline-none text-gray-900 placeholder:text-gray-400 bg-transparent font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(item.tab);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-white text-gray-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <span className="text-xs text-gray-400 font-medium">{item.category}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-black">
                    Jump to →
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm font-medium">
              No matching search results found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>Navigation shortcut palette</span>
          <span>Press <kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
