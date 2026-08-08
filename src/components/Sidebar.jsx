import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bell,
  FileText,
  CheckSquare,
  Mail,
  Calendar,
  BarChart2,
  Users,
  Building2,
  Grid,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Shield
} from 'lucide-react';

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  selectedTeam,
  setSelectedTeam,
  teams,
  isCollapsed,
  setIsCollapsed
}) {
  const [emailsExpanded, setEmailsExpanded] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const isAdmin = (currentUser?.role || currentUser?.user_metadata?.role || '').toLowerCase() === 'admin';

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'emails', label: 'Emails', icon: Mail, hasExpand: true },
    { id: 'calendars', label: 'Calendars', icon: Calendar },
  ];

  const dbNav = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
  ];

  const bottomNav = [
    { id: 'integrations', label: 'Integrations', icon: Grid },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const cleanId = (val) => (val ? val.toString().replace(/^[atp]/i, '').toLowerCase() : '');

  // Derive active team object from 1:1 synchronized teams array
  const activeTeamObj = teams.find(
    t => (
      (t.id && currentUser?.team_id && cleanId(t.id) === cleanId(currentUser?.team_id)) ||
      (t.name && currentUser?.team_name && t.name.toLowerCase().replace(" team's", "").includes(currentUser?.team_name.toLowerCase().replace(" team's", ""))) ||
      (t.name && currentUser?.team_name && currentUser?.team_name.toLowerCase().replace(" team's", "").includes(t.name.toLowerCase().replace(" team's", "")))
    )
  ) || selectedTeam || teams[0];

  return (
    <aside className={`${
      isCollapsed ? 'w-20' : 'w-64'
    } bg-[#f9fafb] border-r border-gray-200 h-screen sticky top-0 flex flex-col justify-between select-none shrink-0 text-gray-700 font-sans transition-all duration-300 z-20`}>
      
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* LOGO Header with Collapse/Expand Toggle Button (< >) */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          {!isCollapsed && (
            <span className="font-extrabold text-xl tracking-wider text-black">LOGO</span>
          )}

          {/* Toggle Button next to LOGO: Collapse (<) or Expand (>) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-black hover:border-gray-400 transition-all flex items-center justify-center shadow-2xs mx-auto"
            title={isCollapsed ? "Expand Sidebar ( > )" : "Collapse Sidebar ( < )"}
          >
            {isCollapsed ? (
              <div className="flex items-center text-xs font-bold font-mono">
                <ChevronRight className="w-4 h-4 text-black" />
              </div>
            ) : (
              <div className="flex items-center text-xs font-bold font-mono text-gray-400 hover:text-black">
                <ChevronLeft className="w-3.5 h-3.5" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.hasExpand) {
                      setEmailsExpanded(!emailsExpanded);
                    }
                    setActiveTab(item.id);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#eceef2] text-black font-bold'
                      : 'text-gray-600 hover:bg-gray-200/50 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.hasExpand && (
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${emailsExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {!isCollapsed && item.hasExpand && emailsExpanded && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-gray-200 pl-3">
                    <button
                      onClick={() => setActiveTab('inbox')}
                      className={`block w-full text-left text-xs py-1 ${activeTab === 'inbox' ? 'font-bold text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      Inbox
                    </button>
                    <button
                      onClick={() => setActiveTab('sent')}
                      className={`block w-full text-left text-xs py-1 ${activeTab === 'sent' ? 'font-bold text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      Sent
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* DATABASE Section */}
        <div className="pt-2">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              DATABASE
            </p>
          )}
          <nav className="space-y-1">
            {dbNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                  } py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#eceef2] text-black font-bold'
                      : 'text-gray-600 hover:bg-gray-200/50 hover:text-black'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Divider & Bottom Section */}
        <div className="border-t border-gray-200 pt-3">
          <nav className="space-y-1">
            {bottomNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                  } py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#eceef2] text-black font-bold'
                      : 'text-gray-600 hover:bg-gray-200/50 hover:text-black'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* PINNED TEAM DISPLAY AT THE VERY BOTTOM */}
      <div className="sticky bottom-0 bg-[#f9fafb] p-3 border-t border-gray-200 z-30 space-y-1">
        {!isCollapsed && (
          <div className="px-1 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>{isAdmin ? 'System Admin View' : 'Assigned Team'}</span>
            {isAdmin && (
              <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" /> ADMIN
              </span>
            )}
          </div>
        )}

        <div className="relative">
          {isAdmin ? (
            /* ADMIN: Interactive Dropdown Switcher */
            <>
              <button
                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'
                } rounded-xl bg-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-all text-left`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-black shrink-0">
                    {selectedTeam.badge}
                  </div>
                  {!isCollapsed && (
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {selectedTeam.name}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                )}
              </button>

              {showTeamDropdown && (
                <div className={`absolute bottom-12 ${
                  isCollapsed ? 'left-12 w-48' : 'left-0 w-full'
                } bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-40 space-y-0.5`}>
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTeam(t);
                        setShowTeamDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left ${
                        t.id === selectedTeam.id ? 'bg-gray-100 text-black font-bold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center font-bold text-[9px]">
                        {t.badge}
                      </span>
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* USER: Static Assigned Team Info (100% Locked to Database Assigned Team) */
            <div className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'
            } rounded-xl bg-white border border-gray-200 shadow-2xs text-left cursor-default`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-black shrink-0">
                  {activeTeamObj.badge || 'M'}
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {activeTeamObj.name || "Marketing Team's"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}
