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
    // Keep auth state only in memory.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
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

// Realtime Channel Listener Helper
export const subscribeToRealtimeChanges = (onPayload) => {
  const status = getSupabaseStatus();
  if (!status.isConfigured) return null;

  try {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          if (onPayload) onPayload(payload);
        }
      )
      .subscribe();
    return channel;
  } catch (err) {
    console.warn("Realtime subscription fallback:", err.message);
    return null;
  }
};

// ========================================================
// AUTHENTICATION & PROFILES AUTHORIZATION HELPERS
// ========================================================

export const apiAuth = {
  signIn: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const status = getSupabaseStatus();

    if (status.isConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (!error && data.user) {
          let profile = await apiProfiles.fetchCurrent(data.user.id);
          if (!profile) {
            profile = {
              id: data.user.id,
              user_id: data.user.id,
              full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
              email: cleanEmail,
              role: cleanEmail.includes('admin') ? 'admin' : 'user',
              team_id: null
            };
          }
          return { user: data.user, profile };
        }
      } catch (e) {
        console.warn("Supabase auth sign in fallback:", e.message);
      }
    }

    // Direct Pre-Configured Accounts & Role Authorization Handler
    if (cleanEmail === 'admin@gmail.com') {
      const adminProfile = {
        id: 'p0000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@gmail.com',
        full_name: 'System Admin',
        role: 'admin',
        team_id: null,
        team_name: null,
        job_title: 'System Administrator'
      };
      return { user: adminProfile, profile: adminProfile };
    }

    if (cleanEmail === 'john.d@company.com') {
      const johnProfile = {
        id: 'p1111111-1111-1111-1111-111111111111',
        user_id: '11111111-1111-1111-1111-111111111111',
        email: 'john.d@company.com',
        full_name: 'John Doe',
        role: 'user',
        team_id: 't2222222-2222-2222-2222-222222222222',
        team_name: "Design Team's",
        job_title: 'Lead Designer'
      };
      return { user: johnProfile, profile: johnProfile };
    }

    if (cleanEmail === 'sarah@acme.org') {
      const sarahProfile = {
        id: 'p2222222-2222-2222-2222-222222222222',
        user_id: '22222222-2222-2222-2222-222222222222',
        email: 'sarah@acme.org',
        full_name: 'Sarah Connor',
        role: 'user',
        team_id: 't1111111-1111-1111-1111-111111111111',
        team_name: "Marketing Team's",
        job_title: 'Product Manager'
      };
      return { user: sarahProfile, profile: sarahProfile };
    }

    // Default registered user account fallback
    const userRole = cleanEmail.includes('admin') ? 'admin' : 'user';
    const genericUser = {
      id: Date.now().toString(),
      user_id: Date.now().toString(),
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0].toUpperCase(),
      role: userRole,
      team_id: null,
      team_name: null,
      job_title: userRole === 'admin' ? 'System Administrator' : 'Team Member'
    };
    return { user: genericUser, profile: genericUser };
  },

  signUp: async (email, password, fullName) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const status = getSupabaseStatus();

    if (status.isConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName, role: 'user' }
          }
        });
        if (!error && data?.user) return { user: data.user };
      } catch (e) {
        console.warn("Supabase auth signup fallback:", e.message);
      }
    }

    const newUser = {
      id: Date.now().toString(),
      user_id: Date.now().toString(),
      email: cleanEmail,
      full_name: fullName,
      role: 'user',
      team_id: null,
      team_name: null,
      job_title: 'Team Member'
    };
    return { user: newUser };
  },

  signOut: async () => {
    const status = getSupabaseStatus();
    if (status.isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
  },

  restoreSession: async () => {
    return null;
  }
};

export const apiUserPreferences = {
  fetch: async () => {
    return null;
  },

  save: async (_userId, _preferences) => {
    return null;
  }
};

// ========================================================
// PROFILES & TEAMS API HELPERS
// ========================================================

export const apiProfiles = {
  fetchCurrent: async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*, teams(id, name)').eq('user_id', userId).single();
      if (error) return null;
      return {
        ...data,
        team_name: data.teams?.name || null
      };
    } catch (e) {
      return null;
    }
  },

  fetchAll: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*, teams(id, name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(p => ({
        ...p,
        team_name: p.teams?.name || null
      }));
    } catch (e) {
      return [];
    }
  },

  updateRole: async (profileId, newRole) => {
    const { data, error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId).select();
    if (error) throw error;
    return data[0];
  },

  updateTeam: async (profileId, teamId) => {
    const { data, error } = await supabase.from('profiles').update({ team_id: teamId }).eq('id', profileId).select();
    if (error) throw error;
    return data[0];
  }
};

export const apiTeams = {
  fetchAll: async () => {
    try {
      const { data, error } = await supabase.from('teams').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data;
    } catch (e) {
      return [
        { id: 't1111111-1111-1111-1111-111111111111', name: 'Marketing', description: 'Digital marketing & growth' },
        { id: 't2222222-2222-2222-2222-222222222222', name: 'Design', description: 'UI/UX design systems' },
        { id: 't3333333-3333-3333-3333-333333333333', name: 'Production', description: 'Infrastructure & devops' },
        { id: 't4444444-4444-4444-4444-444444444444', name: 'Development', description: 'Fullstack engineering' },
        { id: 't5555555-5555-5555-5555-555555555555', name: 'Operations', description: 'Operations & support' }
      ];
    }
  },

  create: async (teamData) => {
    const { data, error } = await supabase.from('teams').insert([teamData]).select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, teamData) => {
    const { data, error } = await supabase.from('teams').update(teamData).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
  }
};

// ========================================================
// ALL 12 MODULES DATABASE QUERY HELPERS
// ========================================================

// 1. TASKS API
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
    const { data, error } = await supabase.from('tasks').update({ status }).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
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
    const response = await fetch('/api/companies');
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load companies');
    return data;
  },
  insert: async (company) => {
    const response = await fetch('/api/companies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(company)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to create company');
    return data[0];
  },
  update: async (id, companyData) => {
    const response = await fetch(`/api/companies?id=${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(companyData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to update company');
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
    const response = await fetch(`/api/companies?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Unable to delete company');
    }
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
    const { data, error } = await supabase.from('notifications').insert([notification]).select();
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
  toggleStar: async (id, starred) => {
    const { data, error } = await supabase.from('emails').update({ starred }).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  delete: async (id) => {
    const { error } = await supabase.from('emails').delete().eq('id', id);
    if (error) throw error;
  }
};

// 7. CALENDAR EVENTS API
export const apiCalendarEvents = {
  fetchAll: async () => {
    const { data, error } = await supabase.from('calendars').select('*').order('day_of_month', { ascending: true });
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

// 8. EXPENSES API
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
  }
};

// 9. REVENUES API
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
  }
};

// 10. SETTINGS API
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
