import { apiContacts } from '../lib/supabase';

export const contactService = {
  async fetchAll() {
    return await apiContacts.fetchAll();
  },

  async create(contactData) {
    const cleanContact = {
      name: contactData.name,
      email: contactData.email,
      role: contactData.role || contactData.position || 'Member',
      company_name: contactData.company || contactData.company_name || null
    };

    return await apiContacts.insert(cleanContact);
  },

  async delete(id) {
    return await apiContacts.delete(id);
  }
};
