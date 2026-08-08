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
import { supabase, getSupabaseStatus, apiAuth, apiUserPreferences, subscribeToRealtimeChanges } from './lib/supabase';

import { taskService } from './services/taskService';
import { companyService } from './services/companyService';
import { contactService } from './services/contactService';
import { noteService } from './services/noteService';
import { emailService } from './services/emailService';
import { calendarService } from './services/calendarService';
import { notificationService } from './services/notificationService';
import { dashboardService } from './services/dashboardService';

export default function App() {
  // Authentication State with Role-Based Access Control Session
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // UI Preference States
  const [activeTab, setActiveTab] = useState('dashboard');

  const [selectedTeam, setSelectedTeam] = useState(initialDashboardData.teams[0]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

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

  // Restore the authenticated Supabase user from the server-managed HttpOnly cookie.
  useEffect(() => {
    apiAuth.restoreSession()
      .then((session) => {
        if (!session) return;
        const user = {
          id: session.profile?.id || session.user.id,
          user_id: session.profile?.user_id || session.user.id,
          email: session.profile?.email || session.user.email,
          full_name: session.profile?.full_name || session.user.user_metadata?.full_name || session.user.email,
          role: session.profile?.role || 'user',
          team_id: session.profile?.team_id || null,
          team_name: session.profile?.team_name || null,
          job_title: session.profile?.job_title || 'Team Member',
          user_metadata: session.user.user_metadata
        };
        setCurrentUser(user);
        setIsAuthenticated(true);
      })
      .catch((err) => console.warn('Unable to restore authenticated session:', err.message));
  }, []);

  // Load and save UI preferences through Supabase, never through browser storage.
  useEffect(() => {
    if (!currentUser) {
      setPreferencesLoaded(false);
      return;
    }

    let cancelled = false;
    setPreferencesLoaded(false);
    apiUserPreferences.fetch()
      .then((preferences) => {
        if (cancelled) return;
        if (preferences?.active_tab) setActiveTab(preferences.active_tab);
        if (typeof preferences?.sidebar_collapsed === 'boolean') setIsCollapsed(preferences.sidebar_collapsed);
      })
      .catch((err) => console.warn('Failed to load user preferences:', err.message))
      .finally(() => {
        if (!cancelled) setPreferencesLoaded(true);
      });

    return () => { cancelled = true; };
  }, [currentUser]);

  useEffect(() => {
    if (!preferencesLoaded || !currentUser) return;
    apiUserPreferences.save(currentUser.user_id || currentUser.id, {
      active_tab: activeTab,
      sidebar_collapsed: isCollapsed
    }).catch((err) => console.warn('Failed to save user preferences:', err.message));
  }, [activeTab, isCollapsed, currentUser, preferencesLoaded]);

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
      if (dbTasks && dbTasks.length > 0) {
        setTasks(dbTasks.map(t => ({
          id: t.id,
          title: t.title,
          team: t.team || "Marketing Team's",
          status: t.status ? (t.status === 'completed' || t.status === 'Done' ? 'Completed' : t.status === 'in_progress' || t.status === 'In Progress' ? 'In Progress' : 'Todo') : 'Todo',
          date: t.due_date || t.created_at?.split('T')[0] || '2026-08-08',
          company_id: t.company_id || null,
          company: t.company || 'Product design'
        })));
      }

      // 2. Fetch Companies from Supabase PostgreSQL
      const dbCompanies = await companyService.fetchAll();
      if (dbCompanies && dbCompanies.length > 0) {
        setCompanies(dbCompanies.map(c => ({
          id: c.id,
          name: c.name,
          category: c.category || 'Web Design',
          transactions: c.total_transactions || '1,000',
          revenue: c.revenue || '$15,000',
          expenses: c.expenses || '$2,100',
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
      }

      // 3. Fetch Contacts from Supabase PostgreSQL
      const dbContacts = await contactService.fetchAll();
      if (dbContacts && dbContacts.length > 0) {
        setContacts(dbContacts.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          role: c.position || 'Member',
          company: c.company_name || 'Partner',
          company_id: c.company_id || null
        })));
      }

      // 4. Fetch Notes from Supabase PostgreSQL
      const dbNotes = await noteService.fetchAll();
      if (dbNotes && dbNotes.length > 0) {
        setNotes(dbNotes.map(n => ({
          id: n.id,
          title: n.title,
          content: n.content,
          date: n.created_at?.split('T')[0] || '2026-08-08'
        })));
      }

      // 5. Fetch Dashboard Aggregations from Supabase PostgreSQL
      const aggData = await dashboardService.fetchAggregatedMetrics();
      setDashboardData(aggData);

    } catch (err) {
      console.warn("Supabase fetch fallback to local persistent store:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);

    if (user.team_name) {
      const found = dashboardData.teams.find(t => t.name === user.team_name || t.id === user.team_id);
      if (found) setSelectedTeam(found);
    }
  };

  const handleLogout = async () => {
    await apiAuth.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleUpdateUserProfile = ({ userId, team_id, team_name, role, full_name, job_title }) => {
    // Update currentUser ONLY if the user being updated is the currently logged-in user
    setCurrentUser(prev => {
      const isTargetLoggedInUser = (prev?.id === userId || prev?.user_id === userId);
      if (isTargetLoggedInUser) {
        const next = {
          ...prev,
          ...(team_id !== undefined && { team_id }),
          ...(team_name !== undefined && { team_name }),
          ...(role !== undefined && { role }),
          ...(full_name !== undefined && { full_name }),
          ...(job_title !== undefined && { job_title })
        };
        return next;
      }
      return prev;
    });
  };

  // Task Actions (attaches created_by)
  const handleAddTask = async (newTask) => {
    const taskWithAuthor = {
      ...newTask,
      created_by: currentUser?.user_id || currentUser?.id || null
    };
    setTasks(prev => [taskWithAuthor, ...prev]);
    if (supabaseStatus.isConfigured) {
      await taskService.create(taskWithAuthor);
    }
    refreshDashboardMetrics();
  };

  const handleUpdateTaskStatus = async (id, newStatus) => {
    const foundTask = tasks.find(t => t.id === id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (supabaseStatus.isConfigured) {
      await taskService.updateStatus(id, newStatus, foundTask?.title || 'Task');
    }
    refreshDashboardMetrics();
  };

  const handleEditTask = async (id, updatedFields) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
    if (supabaseStatus.isConfigured && updatedFields.status) {
      await taskService.updateStatus(id, updatedFields.status, updatedFields.title || 'Task');
    }
    refreshDashboardMetrics();
  };

  const handleDeleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (supabaseStatus.isConfigured) {
      await taskService.delete(id);
    }
    refreshDashboardMetrics();
  };

  // Company Actions (attaches created_by)
  const handleAddCompany = async (newCompany) => {
    const companyWithAuthor = {
      ...newCompany,
      created_by: currentUser?.user_id || currentUser?.id || null
    };
    setCompanies(prev => [companyWithAuthor, ...prev]);
    if (supabaseStatus.isConfigured) {
      await companyService.create(companyWithAuthor);
    }
    refreshDashboardMetrics();
  };

  const handleEditCompany = async (id, updatedFields) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    if (supabaseStatus.isConfigured) {
      await companyService.update(id, updatedFields);
    }
    refreshDashboardMetrics();
  };

  const handleDeleteCompany = async (id) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    if (supabaseStatus.isConfigured) {
      await companyService.delete(id);
    }
    refreshDashboardMetrics();
  };

  const handleSetFeaturedCompany = async (id) => {
    setCompanies(prev => prev.map(c => ({
      ...c,
      is_featured: c.id === id,
      status: c.id === id ? 'Featured' : 'Active'
    })));
    if (supabaseStatus.isConfigured) {
      await companyService.setFeatured(id);
    }
    refreshDashboardMetrics();
  };

  // Contact Actions (attaches created_by)
  const handleAddContact = async (newContact) => {
    const contactWithAuthor = {
      ...newContact,
      created_by: currentUser?.user_id || currentUser?.id || null
    };
    setContacts(prev => [contactWithAuthor, ...prev]);
    if (supabaseStatus.isConfigured) {
      await contactService.create(contactWithAuthor);
    }
  };

  const handleDeleteContact = async (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    if (supabaseStatus.isConfigured) {
      await contactService.delete(id);
    }
  };

  // Note Actions (attaches created_by)
  const handleAddNote = async (newNote) => {
    const noteWithAuthor = {
      ...newNote,
      created_by: currentUser?.user_id || currentUser?.id || null
    };
    setNotes(prev => [noteWithAuthor, ...prev]);
    if (supabaseStatus.isConfigured) {
      await noteService.create(noteWithAuthor);
    }
  };

  const handleDeleteNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (supabaseStatus.isConfigured) {
      await noteService.delete(id);
    }
  };

  const refreshDashboardMetrics = async () => {
    if (supabaseStatus.isConfigured) {
      const agg = await dashboardService.fetchAggregatedMetrics();
      setDashboardData(agg);
    } else {
      // Local dynamic recalculation for unconfigured mode
      const completedTasksCount = tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
      const totalTasksCount = tasks.length || 1;
      const taskProgressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

      const activeFeaturedCompany = companies.find(c => c.is_featured || c.status === 'Featured') || companies[0] || {
        name: 'Product design',
        category: 'Web Design',
        transactions: '1,641'
      };

      const parseAmount = (valStr) => {
        if (!valStr) return 0;
        const cleaned = valStr.toString().replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
      };

      const sumExpenses = companies.reduce((acc, c) => acc + parseAmount(c.expenses || '$2,100'), 0) + 8414;
      const sumRevenues = companies.reduce((acc, c) => acc + parseAmount(c.revenue || '$15,000'), 0) + 56123;

      const totalRevK = Math.round(sumRevenues / 1000);
      const totalExpK = Math.round(sumExpenses / 1000);

      setDashboardData(prev => ({
        ...prev,
        taskProgress: {
          completed: completedTasksCount,
          total: totalTasksCount,
          percentage: taskProgressPercentage,
          month: 'This Month (2026)',
        },
        totalExpenses: {
          ...prev.totalExpenses,
          amount: sumExpenses,
          formatted: `$${Math.round(sumExpenses).toLocaleString()}`
        },
        averageFinishedTask: {
          ...prev.averageFinishedTask,
          average: `± ${completedTasksCount} Task`
        },
        taskSummaries: {
          ...prev.taskSummaries,
          totalTasks: `${totalTasksCount} Task`
        },
        totalRevenue: {
          ...prev.totalRevenue,
          amountFormatted: `$${totalRevK.toLocaleString()}k`
        },
        expensesAllocation: {
          ...prev.expensesAllocation,
          amountFormatted: `$${totalExpK.toLocaleString()}k`
        },
        highlightedCompany: {
          name: activeFeaturedCompany.name,
          category: activeFeaturedCompany.category,
          totalTransactions: activeFeaturedCompany.transactions || '1,641',
          formattedTransactions: activeFeaturedCompany.transactions || '1,641',
          logo_bg: activeFeaturedCompany.logo_bg || 'bg-[#d94e34]',
          sparkline: [3, 8, 4, 9, 2, 7, 3, 10, 5, 8, 2, 5]
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
            <CalendarView currentUser={currentUser} />
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
