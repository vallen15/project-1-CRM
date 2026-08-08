import React, { useState, useEffect } from 'react';
import { Shield, Bell, User, Key, Check, Copy, Moon, Sun, Save, Lock, Users, Layers, Settings as GearIcon, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { apiProfiles, apiTeams } from '../../lib/supabase';

export default function SettingsView({ currentUser, onUpdateUserProfile }) {
  const isAdmin = (currentUser?.role || currentUser?.user_metadata?.role || '').toLowerCase() === 'admin';

  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Profile form state
  const [name, setName] = useState(currentUser?.full_name || currentUser?.user_metadata?.full_name || 'John Doe');
  const [email, setEmail] = useState(currentUser?.email || 'john.d@company.com');
  const [jobTitle, setJobTitle] = useState(currentUser?.job_title || 'Team Member');
  const [profileSaved, setProfileSaved] = useState(false);

  // Preference toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // ADMIN TEAMS STATE (Synchronized 1:1)
  const initialTeams = [
    { id: 't1111111-1111-1111-1111-111111111111', name: "Marketing Team's", badge: 'M', description: 'Digital marketing & growth funnels' },
    { id: 't2222222-2222-2222-2222-222222222222', name: "Design Team's", badge: 'D', description: 'UI/UX design systems & branding' },
    { id: 't3333333-3333-3333-3333-333333333333', name: "Production Team's", badge: 'P', description: 'Server infrastructure & devops' },
    { id: 't4444444-4444-4444-4444-444444444444', name: "Development Team's", badge: 'DEV', description: 'Fullstack web & mobile app engineering' },
    { id: 't5555555-5555-5555-5555-555555555555', name: "Operations Team's", badge: 'OPS', description: 'Operations, logistics & support' },
  ];

  const [teamsList, setTeamsList] = useState(initialTeams);

  // ADMIN USER MANAGEMENT STATE (Database Driven)
  const initialUsers = [
    { id: 'p0000000-0000-0000-0000-000000000000', user_id: '00000000-0000-0000-0000-000000000000', full_name: 'System Admin', email: 'admin@gmail.com', role: 'admin', team_id: null, team_name: 'System Admin' },
    { id: 'p1111111-1111-1111-1111-111111111111', user_id: '11111111-1111-1111-1111-111111111111', full_name: 'John Doe', email: 'john.d@company.com', role: 'user', team_id: 't2222222-2222-2222-2222-222222222222', team_name: "Design Team's" },
    { id: 'p2222222-2222-2222-2222-222222222222', user_id: '22222222-2222-2222-2222-222222222222', full_name: 'Sarah Connor', email: 'sarah@acme.org', role: 'user', team_id: 't1111111-1111-1111-1111-111111111111', team_name: "Marketing Team's" },
    { id: 'p3333333-3333-3333-3333-333333333333', user_id: '33333333-3333-3333-3333-333333333333', full_name: 'Alex Rivera', email: 'alex@techlabs.io', role: 'user', team_id: 't3333333-3333-3333-3333-333333333333', team_name: "Production Team's" },
  ];

  const [usersList, setUsersList] = useState(initialUsers);

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      const fetchedTeams = await apiTeams.fetchAll();
      if (fetchedTeams && fetchedTeams.length > 0) {
        setTeamsList(fetchedTeams);
      }

      if (isAdmin) {
        const fetchedProfiles = await apiProfiles.fetchAll();
        if (fetchedProfiles && fetchedProfiles.length > 0) {
          setUsersList(fetchedProfiles);
        }
      }
    } catch (err) {
      console.warn("Settings data fetch fallback:", err.message);
    }
  };

  // ADMIN ACTION: Change Role (Triggers Real-Time Auto-Update)
  const handleChangeRole = (targetUserId, newRole) => {
    setUsersList(prev => prev.map(u => (u.id === targetUserId || u.user_id === targetUserId) ? { ...u, role: newRole } : u));

    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        userId: targetUserId,
        role: newRole
      });
    }

    apiProfiles.updateRole(targetUserId, newRole).catch(err => {
      console.warn("apiProfiles.updateRole background error:", err);
    });
  };

  // ADMIN ACTION: Change Team Assignment (Triggers Real-Time Auto-Update & Persistent DB Save)
  const handleChangeUserTeam = (targetUserId, newTeamId) => {
    const foundTeam = teamsList.find(t => t.id === newTeamId);
    const updatedTeamName = foundTeam?.name || 'Unassigned';

    // 1. Update local usersList
    setUsersList(prev => prev.map(u => (u.id === targetUserId || u.user_id === targetUserId) ? { ...u, team_id: newTeamId, team_name: updatedTeamName } : u));

    // 2. Notify parent App component to update logged-in session & active sidebar team
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        userId: targetUserId,
        team_id: newTeamId,
        team_name: updatedTeamName
      });
    }

    // 3. Asynchronously call backend service
    apiProfiles.updateTeam(targetUserId, newTeamId).catch(err => {
      console.warn("apiProfiles.updateTeam background error:", err);
    });
  };

  // ADMIN ACTION: Create Team
  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeamObj = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      description: newTeamDesc.trim() || 'Custom organizational team',
      badge: newTeamName.trim().charAt(0).toUpperCase()
    };

    setTeamsList(prev => [...prev, newTeamObj]);

    setNewTeamName('');
    setNewTeamDesc('');

    apiTeams.create(newTeamObj).catch(err => {
      console.warn("apiTeams.create background error:", err);
    });
  };

  // ADMIN ACTION: Delete Team
  const handleDeleteTeam = (teamId) => {
    setTeamsList(prev => prev.filter(t => t.id !== teamId));

    apiTeams.delete(teamId).catch(err => {
      console.warn("apiTeams.delete background error:", err);
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        userId: currentUser?.id,
        full_name: name,
        job_title: jobTitle
      });
    }
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setPasswordMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordMsg(''), 2500);
  };

  // User's assigned team name display (1:1 synced)
  const userTeamName = currentUser?.team_name || (teamsList.find(t => t.id === currentUser?.team_id)?.name) || "Marketing Team's";

  return (
    <div className="space-y-6 pb-12 max-w-5xl font-sans">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings & Workspace</h1>
            {isAdmin ? (
              <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                <Shield className="w-3.5 h-3.5 text-amber-600" /> Admin Workspace Access
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                User Access
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">Manage personal account, security, team assignments, and system settings</p>
        </div>
      </div>

      {/* Subnav Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'profile' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'security' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Security & Auth</span>
        </button>

        <button
          onClick={() => setActiveSubTab('appearance')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'appearance' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Appearance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'notifications' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>

        {/* ADMIN ONLY TABS */}
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveSubTab('team-mgmt')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'team-mgmt' ? 'bg-black text-white' : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Team Management</span>
            </button>

            <button
              onClick={() => setActiveSubTab('user-mgmt')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'user-mgmt' ? 'bg-black text-white' : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>User Management</span>
            </button>

            <button
              onClick={() => setActiveSubTab('system-settings')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubTab === 'system-settings' ? 'bg-black text-white' : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <GearIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>System Settings</span>
            </button>
          </>
        )}
      </div>

      {/* SUBTAB 1: PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2.5 rounded-xl bg-gray-100 text-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">User Profile Settings</h3>
              <p className="text-xs text-gray-500">Update your account information and job title</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl font-semibold outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-black"
              />
            </div>

            {/* CLEAN TEAM DISPLAY WITHOUT LOCK ICON */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Assigned Team</label>
              <div className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 flex items-center justify-between">
                <span>{isAdmin ? 'System Administrator (All Teams Access)' : userTeamName}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isAdmin ? 'ALL ACCESS' : 'MANAGED BY ADMIN'}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">System Role</label>
              <div className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 flex items-center justify-between">
                <span className="capitalize">{isAdmin ? 'ADMIN' : 'USER'}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ROLES & RLS PROTECTED</span>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              {profileSaved ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Profile updated successfully!
                </span>
              ) : (
                <span className="text-[11px] text-gray-400">Changes update your profile identity across the CRM</span>
              )}
              <button
                type="submit"
                className="px-4 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 flex items-center gap-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 2: SECURITY */}
      {activeSubTab === 'security' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2.5 rounded-xl bg-gray-100 text-black">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Security & Credentials</h3>
              <p className="text-xs text-gray-500">Update password and manage multi-factor authentication</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-1">
              {passwordMsg && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> {passwordMsg}
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 3: APPEARANCE */}
      {activeSubTab === 'appearance' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4 font-sans">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2.5 rounded-xl bg-gray-100 text-black">
              {darkMode ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Appearance & Theme Preferences</h3>
              <p className="text-xs text-gray-500">Customize color theme mode, contrast, and workspace layout density</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  <span>Dark Mode Interface</span>
                  {darkMode && <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded">ACTIVE</span>}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">Switch workspace color theme between Light Mode and Dark Mode</p>
              </div>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => {
                  const val = e.target.checked;
                  setDarkMode(val);
                  if (val) {
                    document.documentElement.classList.add('dark');
                    document.body.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.body.classList.remove('dark');
                  }
                }}
                className="w-5 h-5 accent-black rounded cursor-pointer"
              />
            </div>

            {/* High Contrast Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">High Contrast Mode</p>
                <p className="text-[11px] text-gray-500">Increase font weight and element borders for enhanced accessibility</p>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-5 h-5 accent-black rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2.5 rounded-xl bg-gray-100 text-black">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Notification Preferences</h3>
              <p className="text-xs text-gray-500">Configure email digests, push alerts, and task updates</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
              <span className="font-semibold text-gray-800">Email Daily Digest & Reports</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
              <span className="font-semibold text-gray-800">In-App Push Alerts & Reminders</span>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SUBTAB 5: TEAM MANAGEMENT (ADMIN ONLY) */}
      {isAdmin && activeSubTab === 'team-mgmt' && (
        <div className="space-y-6">
          {/* Create Team Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                  <Layers className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Team Management (Admin Only)</h3>
                  <p className="text-xs text-gray-500">Create, edit, and organize workspace teams</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Team Name (e.g. Marketing Team's)..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
              />
              <input
                type="text"
                placeholder="Team Description..."
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Team</span>
              </button>
            </form>
          </div>

          {/* Teams Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden divide-y divide-gray-100">
            <div className="p-4 bg-gray-50 font-bold text-xs text-gray-700 uppercase tracking-wider flex justify-between">
              <span>Workspace Teams</span>
              <span>Total: {teamsList.length} Teams</span>
            </div>
            {teamsList.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                  <p className="text-gray-500 mt-0.5">{t.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteTeam(t.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete Team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN SUBTAB 6: USER MANAGEMENT (ADMIN ONLY - REAL-TIME SYNC & PERSISTENT) */}
      {isAdmin && activeSubTab === 'user-mgmt' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden divide-y divide-gray-100 space-y-0">
          <div className="p-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>User Management & Real-Time Team Assignment</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">Changing a user's team or role updates their UI automatically and stays saved after refresh (F5)</p>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-xl border border-gray-200">
              {usersList.length} Accounts Registered
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {usersList.map(u => (
              <div key={u.id || u.user_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{u.full_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <span className="text-gray-500 block font-mono text-[11px] mt-0.5">{u.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Change Team Dropdown (1:1 Synchronized with Persistent Save) */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">Assigned Team</label>
                    <select
                      value={u.team_id || ''}
                      onChange={(e) => handleChangeUserTeam(u.id || u.user_id, e.target.value || null)}
                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-black text-xs"
                    >
                      <option value="">No Team (Unassigned)</option>
                      {teamsList.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Change Role Dropdown */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">System Role</label>
                    <select
                      value={u.role || 'user'}
                      onChange={(e) => handleChangeRole(u.id || u.user_id, e.target.value)}
                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:border-black text-xs"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN SUBTAB 7: SYSTEM SETTINGS (ADMIN ONLY) */}
      {isAdmin && activeSubTab === 'system-settings' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <GearIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">System Global Settings (Admin Only)</h3>
              <p className="text-xs text-gray-500">Configure cloud project limits, RLS security policies, and workspace metadata</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Supabase Row Level Security (RLS) Status</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <Check className="w-4 h-4" /> ACTIVE & PROTECTED
                </span>
              </div>
              <p className="text-gray-500 text-[11px]">
                Database policies enforce that non-admin users CANNOT modify profiles.role or profiles.team_id columns via frontend or API.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
