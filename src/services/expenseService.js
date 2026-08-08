import { apiExpenses } from '../lib/supabase';

export const expenseService = {
  async fetchAll() {
    return await apiExpenses.fetchAll();
  },

  async create(expenseData) {
    return await apiExpenses.insert({
      company_id: expenseData.company_id || null,
      category_id: expenseData.category_id || null,
      amount: parseFloat(expenseData.amount) || 0,
      description: expenseData.description || '',
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0]
    });
  },

  async delete(id) {
    return await apiExpenses.delete(id);
  }
};
