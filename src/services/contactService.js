import { apiContacts } from '../lib/supabase';

export const contactService = {
  async fetchAll() {
    return await apiContacts.fetchAll();
  },

  async create(contactData) {
    return await apiContacts.insert(contactData);
  },

  async delete(id) {
    return await apiContacts.delete(id);
  }
};
