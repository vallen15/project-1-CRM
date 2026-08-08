import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/views/DashboardView';
import TasksView from './components/views/TasksView';
import NotesView from './components/views/NotesView';
import ContactsView from './components/views/ContactsView';
import SettingsView from './components/views/SettingsView';
import NotificationsView from './components/views/NotificationsView';
import EmailsView from './components/views/EmailsView';
import CalendarView from './components/views/CalendarView';
import AnalyticsView from './components/views/AnalyticsView';
import CompaniesView from './components/views/CompaniesView';
import IntegrationsView from './components/views/IntegrationsView';
import LoginView from './components/views/LoginView';

import SearchModal from './components/SearchModal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import HelpCenterModal from './components/HelpCenterModal';

import { initialDashboardData, initialTaskList, initialNotesList, initialContactsList, initialCompanyList } from './lib/initialData';
import { supabase, getSupabaseStatus, apiAuth, subscribeToRealtimeChanges } from './lib/supabase';

import { taskService } from './services/taskService';
import { companyService } from './services/companyService';
import { contactService } from './services/contactService';
import { noteService } from './services/noteService';
import { emailService } from './services/emailService';
import { calendarService } from './services/calendarService';
import { notificationService } from './services/notificationService';
import { dashboardService } from './services/dashboardService';
import { preferenceService } from './services/preferenceService';

export default function App() {
  // Purge any legacy localStorage keys once on startup
  useEffect(() => {
    [
      'dashboard_auth_user',
      'dashboard_active_tab',
      'dashboard_sidebar_collapsed',
      'dashboard_email_folder',
      'dashboard_db_tasks',
      'dashboard_db_notes',
      'dashboard_db_contacts',
      'dashboard_db_companies',
      'dashboard_db_emails',
      'dashboard_db_notifications',
      'dashboard_db_users',
      'dashboard_db_teams'
    ].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }, []);

  // Default Admin user object
  const defaultAdminUser = {
    id: 'p0000000-0000-0000-0000-000000000000',
    user_id: '00000000-0000-0000-0000-000000000000',
    email: 'admin@gmail.com',
    full_name: 'System Admin',
    role: 'admin',
    team_id: null,
    team_name: null,
    job_title: 'System Administrator'
  };

  const getInitialUser = () => {
    try {
      const saved = sessionStorage.getItem('crm_session_user');
      if (saved && saved.startsWith('{')) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return defaultAdminUser;
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('crm_is_authenticated') !== 'false';
    } catch (e) {
      return true;
    }
  });

  // UI Preference States (Stored in Supabase user_preferences table)
  const [activeTab, setActiveTabState] = useState('dashboard');
  const [isCollapsed, setIsCollapsedState] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(initialDashboardData.teams[0]);

  // DATABASE STATE ENGINE (Supabase Single Source of Truth)
  const [tasks, setTasks] = useState(initialTaskList);
  const [notes, setNotes] = useState(initialNotesList);
  const [contacts, setContacts] = useState(initialContactsList);
  const [companies, setCompanies] = useState(initialCompanyList);

  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const supabaseStatus = getSupabaseStatus();

  // NATIVE SUPABASE AUTH SESSION LISTENER
  useEffect(() => {
    if (!supabaseStatus.isConfigured) return;

    // Load initial native Supabase Auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserSessionAndPreferences(session.user);
      }
    });

    // Listen to native auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUserSessionAndPreferences(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabaseStatus.isConfigured]);

  // Helper to sync user profile and user_preferences from Supabase PostgreSQL
  const syncUserSessionAndPreferences = async (authUser) => {
    try {
      const profile = await apiAuth.getUserProfile(authUser.id);
      const userObj = {
        id: profile?.id || authUser.id,
        user_id: authUser.id,
        email: authUser.email,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        role: (profile?.role || authUser.user_metadata?.role || 'admin').toLowerCase(),
        team_id: profile?.team_id || null,
        team_name: profile?.teams?.name || null,
        job_title: profile?.job_title || 'Workspace User'
      };

      setCurrentUser(userObj);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('crm_session_user', JSON.stringify(userObj));
        sessionStorage.setItem('crm_is_authenticated', 'true');
      } catch (e) {}

      // Load user preferences live from Supabase user_preferences table
      const prefs = await preferenceService.getPreferences(authUser.id);
      if (prefs) {
        if (prefs.active_tab) setActiveTabState(prefs.active_tab);
        if (prefs.sidebar_collapsed !== undefined) setIsCollapsedState(Boolean(prefs.sidebar_collapsed));
      }
    } catch (err) {
      console.warn("syncUserSessionAndPreferences notice:", err.message);
    }
  };

  // Synchronized Setter for Active Tab
  const setActiveTab = (tabName) => {
    setActiveTabState(tabName);
    const targetUserId = currentUser?.user_id || currentUser?.id;
    if (supabaseStatus.isConfigured && targetUserId && targetUserId.length > 20) {
      preferenceService.updateActiveTab(targetUserId, tabName);
    }
  };

  // Synchronized Setter for Sidebar Collapsed
  const setIsCollapsed = (collapsedVal) => {
    setIsCollapsedState(collapsedVal);
    const targetUserId = currentUser?.user_id || currentUser?.id;
    if (supabaseStatus.isConfigured && targetUserId && targetUserId.length > 20) {
      preferenceService.updateSidebarCollapsed(targetUserId, Boolean(collapsedVal));
    }
  };

  // Re-calculate dashboard metrics whenever companies or tasks change
  useEffect(() => {
    refreshDashboardMetrics();
  }, [companies, tasks]);

  // MASTER SUPABASE DATA LOADER & REALTIME SUBSCRIPTION
  useEffect(() => {
    if (isAuthenticated) {
      if (supabaseStatus.isConfigured) {
        loadMasterSupabaseData();
        const channel = subscribeToRealtimeChanges(() => {
          loadMasterSupabaseData();
        });
        return () => {
          if (channel) supabase.removeChannel(channel);
        };
      } else {
        refreshDashboardMetrics();
      }
    }
  }, [isAuthenticated, supabaseStatus.isConfigured]);

  const loadMasterSupabaseData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Tasks from Supabase PostgreSQL
      const dbTasks = await taskService.fetchAll();
      setTasks((dbTasks || []).map(t => ({
        id: t.id,
        title: t.title,
        team: t.team || "Marketing",
        status: t.status ? (t.status === 'completed' || t.status === 'Done' ? 'Completed' : t.status === 'in_progress' || t.status === 'In Progress' ? 'In Progress' : 'Todo') : 'Todo',
        date: t.due_date || t.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        company_id: t.company_id || null,
        company: t.company || ''
      })));

      // 2. Fetch Companies from Supabase PostgreSQL
      const dbCompanies = await companyService.fetchAll();
      setCompanies((dbCompanies || []).map(c => ({
        id: c.id,
        name: c.name,
        category: c.category || 'General',
        transactions: c.total_transactions || '0',
        status: c.status || 'Active',
        is_featured: c.is_featured || false,
        logo_bg: c.logo_bg || 'bg-black',
        website: c.website || null,
        email: c.email || null,
        phone: c.phone || null,
        address: c.address || null,
        team_id: c.team_id || null,
        created_by: c.created_by || null
      })));

      // 3. Fetch Contacts from Supabase PostgreSQL
      const dbContacts = await contactService.fetchAll();
      setContacts((dbContacts || []).map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.position || 'Member',
        company: c.company_name || '',
        company_id: c.company_id || null
      })));

      // 4. Fetch Notes from Supabase PostgreSQL
      const dbNotes = await noteService.fetchAll();
      setNotes((dbNotes || []).map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        date: n.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      })));

      // 5. Fetch Dashboard Aggregations from Supabase PostgreSQL
      const aggData = await dashboardService.fetchAggregatedMetrics();
      setDashboardData(aggData);

    } catch (err) {
      console.warn("Supabase fetch fallback to local store:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem('crm_session_user', JSON.stringify(user));
      sessionStorage.setItem('crm_is_authenticated', 'true');
    } catch (e) {}

    if (user.team_name) {
      const found = dashboardData.teams.find(t => t.name === user.team_name || t.id === user.team_id);
      if (found) setSelectedTeam(found);
    }

    // Load user preferences from Supabase PostgreSQL
    const targetUserId = user.user_id || user.id;
    if (supabaseStatus.isConfigured && targetUserId && targetUserId.length > 20) {
      const prefs = await preferenceService.getPreferences(targetUserId);
      if (prefs) {
        if (prefs.active_tab) setActiveTabState(prefs.active_tab);
        if (prefs.sidebar_collapsed !== undefined) setIsCollapsedState(Boolean(prefs.sidebar_collapsed));
      }
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('crm_session_user');
      sessionStorage.setItem('crm_is_authenticated', 'false');
    } catch (e) {}
    if (supabaseStatus.isConfigured) {
      await apiAuth.signOut();
    }
  };

  const handleUpdateUserProfile = async (updatedFields) => {
    const targetId = updatedFields.userId || currentUser?.id;
    const targetEmail = updatedFields.userEmail || null;
    const isCurrentActiveUser = (
      !updatedFields.userId ||
      targetId === currentUser?.id ||
      targetId === currentUser?.user_id ||
      (targetEmail && currentUser?.email && targetEmail.toLowerCase() === currentUser.email.toLowerCase())
    );

    if (isCurrentActiveUser) {
      const nextUser = { ...currentUser, ...updatedFields };
      setCurrentUser(nextUser);
      try {
        sessionStorage.setItem('crm_session_user', JSON.stringify(nextUser));
      } catch (e) {}
    }

    if (supabaseStatus.isConfigured && targetId) {
      if (updatedFields.role) {
        await apiProfiles.updateRole(targetId, updatedFields.role);
      }
      if (updatedFields.team_id !== undefined) {
        await apiProfiles.updateTeam(targetId, updatedFields.team_id);
      }
    }
  };

  // Task Actions
  const handleAddTask = async (newTask) => {
    if (supabaseStatus.isConfigured) {
      try {
        await taskService.create(newTask);
      } catch (err) {
        console.warn("Error creating task in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setTasks(prev => [ { ...newTask, id: Date.now().toString() }, ...prev]);
      await refreshDashboardMetrics();
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (supabaseStatus.isConfigured) {
      try {
        await taskService.updateStatus(taskId, newStatus, targetTask?.title || 'Task');
      } catch (err) {
        console.warn("Error updating task status in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await refreshDashboardMetrics();
    }
  };

  const handleEditTask = async (taskId, updatedTaskData) => {
    const normStatus = taskService.normalizeStatus(updatedTaskData.status);
    if (supabaseStatus.isConfigured) {
      try {
        await apiTasks.updateStatus(taskId, normStatus);
      } catch (err) {
        console.warn("Error editing task in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedTaskData } : t));
      await refreshDashboardMetrics();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (supabaseStatus.isConfigured) {
      try {
        await taskService.delete(taskId);
      } catch (err) {
        console.warn("Error deleting task in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await refreshDashboardMetrics();
    }
  };

  // Company Actions
  const handleAddCompany = async (newCompany) => {
    if (supabaseStatus.isConfigured) {
      try {
        await companyService.create(newCompany);
      } catch (err) {
        console.warn("Error creating company in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      const localCompany = { ...newCompany, id: Date.now().toString() };
      setCompanies(prev => [localCompany, ...prev]);
      await refreshDashboardMetrics();
    }
  };

  const handleEditCompany = async (id, updatedFields) => {
    if (supabaseStatus.isConfigured) {
      try {
        await companyService.update(id, updatedFields);
      } catch (err) {
        console.warn("Error updating company in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
      await refreshDashboardMetrics();
    }
  };

  const handleDeleteCompany = async (id) => {
    if (supabaseStatus.isConfigured) {
      try {
        await companyService.delete(id);
      } catch (err) {
        console.warn("Error deleting company in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setCompanies(prev => prev.filter(c => c.id !== id));
      await refreshDashboardMetrics();
    }
  };

  const handleSetFeaturedCompany = async (id) => {
    if (supabaseStatus.isConfigured) {
      try {
        await companyService.setFeatured(id);
      } catch (err) {
        console.warn("Error setting featured company in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setCompanies(prev => prev.map(c => ({
        ...c,
        is_featured: c.id === id,
        status: c.id === id ? 'Featured' : 'Active'
      })));
      await refreshDashboardMetrics();
    }
  };

  // Contact Actions
  const handleAddContact = async (newContact) => {
    if (supabaseStatus.isConfigured) {
      try {
        await contactService.create(newContact);
      } catch (err) {
        console.warn("Error creating contact in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setContacts(prev => [ { ...newContact, id: Date.now().toString() }, ...prev]);
    }
  };

  const handleDeleteContact = async (id) => {
    if (supabaseStatus.isConfigured) {
      try {
        await contactService.delete(id);
      } catch (err) {
        console.warn("Error deleting contact in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  // Note Actions
  const handleAddNote = async (newNote) => {
    if (supabaseStatus.isConfigured) {
      try {
        await noteService.create(newNote);
      } catch (err) {
        console.warn("Error creating note in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setNotes(prev => [ { ...newNote, id: Date.now().toString() }, ...prev]);
    }
  };

  const handleDeleteNote = async (id) => {
    if (supabaseStatus.isConfigured) {
      try {
        await noteService.delete(id);
      } catch (err) {
        console.warn("Error deleting note in Supabase:", err.message);
      }
      await loadMasterSupabaseData();
    } else {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const refreshDashboardMetrics = async () => {
    if (supabaseStatus.isConfigured) {
      const agg = await dashboardService.fetchAggregatedMetrics();
      setDashboardData(agg);
    } else {
      // Dynamic recalculation
      const completedTasksCount = tasks.filter(t => t.status === 'Completed' || t.status === 'Done' || t.status === 'completed' || t.status === 'done').length;
      const totalTasksCount = tasks.length;
      const taskProgressPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

      const activeFeaturedCompany = companies.find(c => c.is_featured || c.status === 'Featured') || companies[0] || null;

      setDashboardData(prev => ({
        ...prev,
        taskProgress: {
          completed: completedTasksCount,
          total: totalTasksCount,
          percentage: taskProgressPercentage,
          month: 'This Month',
        },
        totalExpenses: {
          ...prev.totalExpenses,
          amount: 0,
          formatted: '$0'
        },
        totalRevenue: {
          ...prev.totalRevenue,
          amountFormatted: '$0k'
        },
        expensesAllocation: {
          ...prev.expensesAllocation,
          amountFormatted: '$0k'
        },
        highlightedCompany: {
          name: activeFeaturedCompany ? activeFeaturedCompany.name : 'No Company Available',
          category: activeFeaturedCompany ? (activeFeaturedCompany.category || 'General') : 'General',
          totalTransactions: activeFeaturedCompany ? (activeFeaturedCompany.transactions || '0') : '0',
          formattedTransactions: activeFeaturedCompany ? (activeFeaturedCompany.transactions || '0') : '0',
          logo_bg: activeFeaturedCompany ? (activeFeaturedCompany.logo_bg || 'bg-black') : 'bg-gray-300',
          sparkline: []
        },
        completedTasksCount: completedTasksCount
      }));
    }
  };

  // RENDER LOGIN VIEW IF UNAUTHENTICATED
  if (!isAuthenticated) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  // RENDER MAIN CRM LAYOUT
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans antialiased text-gray-900">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        teams={dashboardData.teams}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              dashboardData={dashboardData}
              tasks={tasks}
              onNavigateTasks={() => setActiveTab('tasks')}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView currentUser={currentUser} />
          )}

          {activeTab === 'notes' && (
            <NotesView
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateStatus={handleUpdateTaskStatus}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              teams={dashboardData.teams}
            />
          )}

          {['emails', 'inbox', 'sent'].includes(activeTab) && (
            <EmailsView activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
          )}

          {activeTab === 'calendars' && (
            <CalendarView />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              tasks={tasks}
              companies={companies}
              dashboardData={dashboardData}
              currentUser={currentUser}
              teams={dashboardData.teams}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'companies' && (
            <CompaniesView
              companies={companies}
              onAddCompany={handleAddCompany}
              onEditCompany={handleEditCompany}
              onDeleteCompany={handleDeleteCompany}
              onSetFeaturedCompany={handleSetFeaturedCompany}
              dashboardData={dashboardData}
              currentUser={currentUser}
              teams={dashboardData.teams}
              tasks={tasks}
              contacts={contacts}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} currentUser={currentUser} />
          )}

          {activeTab === 'settings' && (
            <SettingsView currentUser={currentUser} onUpdateUserProfile={handleUpdateUserProfile} />
          )}
        </main>
      </div>

      {/* Command Palette Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveTab={setActiveTab}
      />

      {/* Help Center Modal */}
      <HelpCenterModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Supabase Config Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
