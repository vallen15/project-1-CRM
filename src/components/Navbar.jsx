import React, { useState } from 'react';
import { Search, HelpCircle, ChevronDown, User, Database, LogOut, Shield } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenSearch, onOpenHelp, onOpenSupabaseModal, setActiveTab }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'John Doe';
  const displayEmail = user?.email || 'john.d@company.com';
  const userRole = (user?.role || user?.user_metadata?.role || 'user').toLowerCase();
  const isAdmin = userRole === 'admin';

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 font-sans">
      {/* Search Input Box */}
      <div className="w-72">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-gray-300 text-gray-400 rounded-lg px-3 py-1.5 text-xs transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="text-gray-400 font-normal">Search</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-mono text-gray-400">
              ⌘
            </kbd>
            <kbd className="bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-mono text-gray-400">
              F
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Navbar Links */}
      <div className="flex items-center gap-6 text-xs font-semibold text-gray-700 relative">
        {/* Help Center Trigger */}
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 text-gray-600 hover:text-black transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span>Help Center</span>
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-1"
          >
            <span className="font-bold text-gray-900">{displayName}</span>
            {isAdmin ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                <Shield className="w-3 h-3 text-amber-600" /> ADMIN
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200">
                USER
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-30 space-y-1 font-normal text-xs">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-bold text-gray-900 flex items-center justify-between">
                  <span>{displayName}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{userRole}</span>
                </p>
                <span className="text-[10px] text-gray-400 truncate block">{displayEmail}</span>
              </div>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-left font-semibold"
              >
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>Profile & Settings</span>
              </button>

              {/* RESTRICTED SUPABASE CONFIG MODAL BUTTON STRICTLY TO ADMIN */}
              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenSupabaseModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-amber-900 bg-amber-50/70 hover:bg-amber-100 rounded-lg text-left font-bold border border-amber-200/50"
                >
                  <Database className="w-3.5 h-3.5 text-amber-600" />
                  <span>Supabase Config (Admin)</span>
                </button>
              )}

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-left font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
