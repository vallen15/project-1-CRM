import { apiRevenues } from '../lib/supabase';

export const revenueService = {
  async fetchAll() {
    return await apiRevenues.fetchAll();
  },

  async create(revenueData) {
    return await apiRevenues.insert({
      company_id: revenueData.company_id || null,
      amount: parseFloat(revenueData.amount) || 0,
      period: revenueData.period || 'This Month',
      year: parseInt(revenueData.year) || new Date().getFullYear(),
      transaction_date: revenueData.transaction_date || new Date().toISOString().split('T')[0]
    });
  },

  async delete(id) {
    return await apiRevenues.delete(id);
  }
};
