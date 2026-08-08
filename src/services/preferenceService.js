import { apiPreferences } from '../lib/supabase';

export const preferenceService = {
  async getPreferences(userId) {
    if (!userId) return null;
    try {
      let pref = await apiPreferences.getByUserId(userId);
      if (!pref) {
        // Auto-create default user preference row in Supabase PostgreSQL
        pref = await apiPreferences.upsert({
          user_id: userId,
          active_tab: 'dashboard',
          sidebar_collapsed: false,
          email_folder: 'inbox'
        });
      }
      return pref;
    } catch (err) {
      console.warn("preferenceService.getPreferences notice:", err.message);
      return null;
    }
  },

  async updateActiveTab(userId, activeTab) {
    if (!userId) return null;
    try {
      return await apiPreferences.upsert({ user_id: userId, active_tab: activeTab });
    } catch (err) {
      console.warn("preferenceService.updateActiveTab notice:", err.message);
    }
  },

  async updateSidebarCollapsed(userId, sidebarCollapsed) {
    if (!userId) return null;
    try {
      return await apiPreferences.upsert({ user_id: userId, sidebar_collapsed: Boolean(sidebarCollapsed) });
    } catch (err) {
      console.warn("preferenceService.updateSidebarCollapsed notice:", err.message);
    }
  },

  async updateEmailFolder(userId, emailFolder) {
    if (!userId) return null;
    try {
      return await apiPreferences.upsert({ user_id: userId, email_folder: emailFolder });
    } catch (err) {
      console.warn("preferenceService.updateEmailFolder notice:", err.message);
    }
  }
};
