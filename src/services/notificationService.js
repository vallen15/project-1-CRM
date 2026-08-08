import { apiNotifications } from '../lib/supabase';

export const notificationService = {
  async fetchAll() {
    try {
      return await apiNotifications.fetchAll();
    } catch (e) {
      return [];
    }
  },

  async markAsRead(id) {
    try {
      if (apiNotifications.markRead) {
        return await apiNotifications.markRead(id, true);
      }
    } catch (e) {
      console.warn("markRead fallback:", e.message);
    }
  },

  async markAllAsRead() {
    try {
      if (apiNotifications.markAllRead) {
        return await apiNotifications.markAllRead();
      }
    } catch (e) {
      console.warn("markAllRead fallback:", e.message);
    }
  },

  async create(notificationData) {
    try {
      return await apiNotifications.insert(notificationData);
    } catch (e) {
      console.warn("insert notification fallback:", e.message);
    }
  }
};
