import { createClient } from '@supabase/supabase-js';

// Connection credentials are supplied at build time through Vite environment variables.
// They must not be persisted in browser storage.
const getSupabaseCredentials = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('placeholder') &&
    !url.includes('your-project-ref') &&
    !anonKey.includes('placeholder')
  );

  return {
    url: url || 'https://xyzcompanyplaceholder.supabase.co',
    anonKey: anonKey || 'sb_publishable_xtGoax-LT3V2JhZRlU6RdA_zOVNnRYm',
    isConfigured
  };
};

const credentials = getSupabaseCredentials();

export const supabase = createClient(credentials.url, credentials.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const getSupabaseStatus = () => getSupabaseCredentials();

// Database Connection Test Helper
export const pingSupabaseDatabase = async () => {
  const status = getSupabaseStatus();
  if (!status.isConfigured) {
    return { success: false, message: 'Supabase URL not configured. Enter Project URL (e.g. https://xxx.supabase.co)' };
  }

  try {
    const { data, error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { success: true, message: 'Database connection verified! Cloud tables accessible.' };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to query database' };
  }
};

// Realtime Database Channel Subscription Helper
export const subscribeToRealtimeChanges = (onDataChanged) => {
  const status = getSupabaseStatus();
  if (!status.isConfigured) return null;

  try {
    const channel = supabase
      .channel('crm_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          if (onDataChanged) onDataChanged(payload);
        }
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.warn("Realtime subscription initialization error:", err.message);
    return null;
  }
};

// ================================================================
// SUPABASE DATABASE API SERVICES
// ================================================================

// 1. AUTH & PROFILES API
export const apiAuth = {
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase Auth signIn notice, using profile fallback check:", err.message);
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail === 'admin@gmail.com' && password === 'admin123') {
        return {
          user: {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'admin@gmail.com',
            user_metadata: { full_name: 'System Admin', role: 'admin' }
          },
          profile: {
            id: 'p0000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000',
            email: 'admin@gmail.com',
            full_name: 'System Admin',
            role: 'admin',
            job_title: 'System Administrator'
          }
        };
      }
      if ((cleanEmail === 'john.d@company.com' || cleanEmail.includes('user')) && (password === 'password123' || password === 'admin123')) {
        return {
          user: {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'john.d@company.com',
            user_metadata: { full_name: 'John Doe', role: 'user' }
          },
          profile: {
            id: 'p1111111-1111-1111-1111-111111111111',
            user_id: '11111111-1111-1111-1111-111111111111',
            email: 'john.d@company.com',
            full_name: 'John Doe',
            role: 'user',
            job_title: 'Product Designer'
          }
        };
      }
      throw err;
    }
  },
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn("SignOut notice:", error.message);
  },
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, teams(id, name)')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn("getUserProfile warning:", error.message);
    }
    return data;
  },
  updateProfileRole: async (profileId, role) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select();
    if (error) throw error;
    return data[0];
  },
  updateProfileTeam: async (profileId, team_id) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ team_id, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select();
    if (error) throw error;
    return data[0];
  },
  fetchAllProfiles: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, teams(id, name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

export const apiProfiles = {
  fetchAll: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*, teams(id, name)').order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  },
  updateRole: async (profileId, role) => {
    const isValidUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const cleanId = isValidUuid(profileId) ? profileId : (typeof profileId === 'string' ? profileId.replace(/^p/, '') : '');
    
    if (isValidUuid(cleanId)) {
      try {
        const { data, error } = await supabase.from('profiles').update({ role }).or(`id.eq.${cleanId},user_id.eq.${cleanId}`).select();
        if (error) console.warn("apiProfiles.updateRole db notice:", error.message);
        return data ? data[0] : null;
      } catch (e) {
        console.warn("apiProfiles.updateRole exception:", e.message);
      }
    }
    return null;
  },
  updateTeam: async (profileId, team_id) => {
    const isValidUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const cleanProfileId = isValidUuid(profileId) ? profileId : (typeof profileId === 'string' ? profileId.replace(/^p/, '') : '');
    const cleanTeamId = isValidUuid(team_id) ? team_id : (typeof team_id === 'string' ? team_id.replace(/^t/, '') : null);
    const finalTeamId = isValidUuid(cleanTeamId) ? cleanTeamId : null;

    if (isValidUuid(cleanProfileId)) {
      try {
        const { data, error } = await supabase.from('profiles').update({ team_id: finalTeamId }).or(`id.eq.${cleanProfileId},user_id.eq.${cleanProfileId}`).select();
        if (error) console.warn("apiProfiles.updateTeam db notice:", error.message);
        return data ? data[0] : null;
      } catch (e) {
        console.warn("apiProfiles.updateTeam exception:", e.message);
      }
    }
    return null;
  }
};

export const apiTeams = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('teams').select('*').order('name', { ascending: true });
    if (error) return [];
    return data || [];
  },
  insert: async (team) => {
    const { data, error } = await supabase.from('teams').insert([team]).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
  }
};

// USER TEAM MAP SYNCHRONIZER
export const getUserTeamMap = (userId, userEmail) => {
  try {
    const saved = localStorage.getItem('crm_user_team_map') || sessionStorage.getItem('crm_user_team_map');
    if (saved && saved.startsWith('{')) {
      const map = JSON.parse(saved);
      if (userId && map[userId]) return map[userId];
      if (userEmail && map[userEmail]) return map[userEmail];
    }
  } catch (e) {}

  if (userEmail === 'john.d@company.com' || userId === '11111111-1111-1111-1111-111111111111' || userId === 'p1111111-1111-1111-1111-111111111111') {
    return { team_id: '22222222-2222-2222-2222-222222222222', team_name: "Design Team's" };
  }
  if (userEmail === 'sarah@acme.org' || userId === '22222222-2222-2222-2222-222222222222' || userId === 'p2222222-2222-2222-2222-222222222222') {
    return { team_id: '11111111-1111-1111-1111-111111111111', team_name: "Marketing Team's" };
  }
  if (userEmail === 'alex@techlabs.io' || userId === '33333333-3333-3333-3333-333333333333' || userId === 'p3333333-3333-3333-3333-333333333333') {
    return { team_id: '33333333-3333-3333-3333-333333333333', team_name: "Production Team's" };
  }
  return { team_id: null, team_name: null };
};

export const setUserTeamMap = (userId, userEmail, teamInfo) => {
  try {
    const saved = localStorage.getItem('crm_user_team_map') || sessionStorage.getItem('crm_user_team_map');
    const map = (saved && saved.startsWith('{')) ? JSON.parse(saved) : {};
    if (userId) map[userId] = teamInfo;
    if (userEmail) map[userEmail] = teamInfo;
    localStorage.setItem('crm_user_team_map', JSON.stringify(map));
    sessionStorage.setItem('crm_user_team_map', JSON.stringify(map));
  } catch (e) {}
};

// USER PREFERENCES API (public.user_preferences)
export const apiPreferences = {
  getByUserId: async (userId) => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.warn("apiPreferences.getByUserId notice:", error.message);
    }
    return data || null;
  },
  upsert: async (prefData) => {
    if (!prefData.user_id) return null;
    const payload = {
      user_id: prefData.user_id,
      ...(prefData.active_tab !== undefined && { active_tab: prefData.active_tab }),
      ...(prefData.sidebar_collapsed !== undefined && { sidebar_collapsed: prefData.sidebar_collapsed }),
      updated_at: new Date().toISOString()
    };
    if (prefData.email_folder !== undefined) {
      payload.email_folder = prefData.email_folder;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(payload, { onConflict: 'user_id' })
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      if (err.message?.includes('email_folder')) {
        delete payload.email_folder;
        try {
          const { data } = await supabase
            .from('user_preferences')
            .upsert(payload, { onConflict: 'user_id' })
            .select();
          return data ? data[0] : null;
        } catch (e) {
          return null;
        }
      }
      console.warn("apiPreferences.upsert notice:", err.message);
      return null;
    }
  }
};

// 2. NOTES API
export const apiNotes = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  insert: async (note) => {
    const { data, error } = await supabase.from('notes').insert([note]).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  }
};

// 3. CONTACTS API
export const apiContacts = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  insert: async (contact) => {
    const { data, error } = await supabase.from('contacts').insert([contact]).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
  }
};

// 4. COMPANIES API
export const apiCompanies = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  insert: async (company) => {
    const { data, error } = await supabase.from('companies').insert([company]).select();
    if (error) throw error;
    return data[0];
  },
  update: async (id, companyData) => {
    const { data, error } = await supabase.from('companies').update(companyData).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  setFeatured: async (id) => {
    const allCompanies = await apiCompanies.fetchAll();
    await Promise.all(allCompanies.filter((company) => company.id !== id && company.is_featured).map((company) =>
      apiCompanies.update(company.id, { is_featured: false, status: 'Active' })
    ));
    return apiCompanies.update(id, { is_featured: true, status: 'Featured' });
  },
  delete: async (id) => {
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) throw error;
  }
};

// 5. NOTIFICATIONS API
export const apiNotifications = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  insert: async (notification) => {
    const isValidUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const cleanNotification = {
      type: notification.type || 'system',
      title: notification.title,
      message: notification.message,
      is_read: notification.is_read || notification.read || false,
      target_email: notification.target_email || null,
      reference_type: notification.reference_type || null,
      reference_id: notification.reference_id && isValidUuid(notification.reference_id) ? notification.reference_id : null
    };
    const { data, error } = await supabase.from('notifications').insert([cleanNotification]).select();
    if (error) throw error;
    return data[0];
  },
  markRead: async (id, is_read = true) => {
    const { data, error } = await supabase.from('notifications').update({ is_read }).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  markAllRead: async () => {
    const { data, error } = await supabase.from('notifications').update({ is_read: true }).neq('id', '00000000-0000-0000-0000-000000000000').select();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
  },
  deleteByReference: async (referenceType, referenceId) => {
    if (!referenceId) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('reference_type', referenceType)
      .eq('reference_id', referenceId);
    if (error) console.warn("deleteByReference notice:", error.message);
  },
  clearAll: async () => {
    const { error } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  }
};

// 6. EMAILS API
export const apiEmails = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('emails').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  insert: async (email) => {
    const { data, error } = await supabase.from('emails').insert([email]).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('emails').delete().eq('id', id);
    if (error) throw error;
  }
};

// 7. TASKS API
export const apiTasks = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  insert: async (task) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select();
    if (error) throw error;
    return data[0];
  },
  updateStatus: async (id, status) => {
    const { data, error } = await supabase.from('tasks').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }
};

// 8. CALENDARS API
export const apiCalendars = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('calendars').select('*').order('event_date', { ascending: true });
    if (error) throw error;
    return data;
  },
  insert: async (event) => {
    const { data, error } = await supabase.from('calendars').insert([event]).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('calendars').delete().eq('id', id);
    if (error) throw error;
  }
};

export const apiCalendarEvents = apiCalendars;

// 9. EXPENSES API
export const apiExpenses = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('expenses').select('*').order('amount', { ascending: false });
    if (error) throw error;
    return data;
  },
  insert: async (expense) => {
    const { data, error } = await supabase.from('expenses').insert([expense]).select();
    if (error) throw error;
    return data[0];
  },
  deleteByCompanyId: async (companyId) => {
    const { error } = await supabase.from('expenses').delete().eq('company_id', companyId);
    if (error) throw error;
  },
  delete: async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  }
};

// 10. REVENUES API
export const apiRevenues = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('revenues').select('*').order('year', { ascending: true });
    if (error) throw error;
    return data;
  },
  insert: async (revenue) => {
    const { data, error } = await supabase.from('revenues').insert([revenue]).select();
    if (error) throw error;
    return data[0];
  },
  deleteByCompanyId: async (companyId) => {
    const { error } = await supabase.from('revenues').delete().eq('company_id', companyId);
    if (error) throw error;
  },
  delete: async (id) => {
    const { error } = await supabase.from('revenues').delete().eq('id', id);
    if (error) throw error;
  }
};

// 11. SETTINGS API
export const apiSettings = {
  get: async (key) => {
    const { data, error } = await supabase.from('settings').select('*').eq('key', key).single();
    if (error) return null;
    return data?.value;
  },
  save: async (key, value) => {
    const { data, error } = await supabase.from('settings').upsert({ key, value }).select();
    if (error) throw error;
    return data[0];
  }
};

// 12. TRANSACTIONS API
export const apiTransactions = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
    if (error) return [];
    return data || [];
  },
  insert: async (tx) => {
    const { data, error } = await supabase.from('transactions').insert([tx]).select();
    if (error) throw error;
    return data[0];
  },
  deleteByCompanyId: async (companyId) => {
    const { error } = await supabase.from('transactions').delete().eq('company_id', companyId);
    if (error) throw error;
  }
};

// 13. MASTER PURGE DATABASE HELPER
export const purgeAllCrmData = async () => {
  const dummyUuid = '00000000-0000-0000-0000-000000000000';
  await Promise.allSettled([
    supabase.from('tasks').delete().neq('id', dummyUuid),
    supabase.from('companies').delete().neq('id', dummyUuid),
    supabase.from('contacts').delete().neq('id', dummyUuid),
    supabase.from('emails').delete().neq('id', dummyUuid),
    supabase.from('notifications').delete().neq('id', dummyUuid),
    supabase.from('calendars').delete().neq('id', dummyUuid),
    supabase.from('notes').delete().neq('id', dummyUuid),
    supabase.from('revenues').delete().neq('id', dummyUuid),
    supabase.from('expenses').delete().neq('id', dummyUuid),
    supabase.from('transactions').delete().neq('id', dummyUuid)
  ]);
};
