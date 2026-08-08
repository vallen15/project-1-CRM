import { apiCompanies, apiRevenues, apiExpenses, apiNotifications } from '../lib/supabase';

export const companyService = {
  async fetchAll() {
    return await apiCompanies.fetchAll();
  },

  async create(companyData) {
    // 1. Insert Company Record
    const createdCompany = await apiCompanies.insert({
      name: companyData.name,
      category: companyData.category || companyData.industry || 'Web Design',
      total_transactions: companyData.transactions || '1,000',
      status: companyData.status || 'Active',
      is_featured: companyData.is_featured || false,
      logo_bg: companyData.logo_bg || 'bg-black',
      website: companyData.website || null,
      email: companyData.email || null,
      phone: companyData.phone || null,
      address: companyData.address || null,
      team_id: companyData.team_id || null,
      created_by: companyData.created_by || null
    });

    const companyId = createdCompany?.id;

    // Helper to parse currency string into clean numeric value
    const parseAmount = (valStr) => {
      if (!valStr) return 0;
      const cleaned = valStr.toString().replace(/[^0-9.]/g, '');
      return parseFloat(cleaned) || 0;
    };

    const revAmount = parseAmount(companyData.revenue || '15000');
    const expAmount = parseAmount(companyData.expenses || '2100');

    // 2. Insert Linked Revenue Record
    if (companyId && revAmount > 0) {
      try {
        await apiRevenues.insert({
          company_id: companyId,
          amount: revAmount,
          period: 'August 2026',
          year: 2026,
          transaction_date: '2026-08-08'
        });
      } catch (e) {
        console.warn("Auto insert revenue link warning:", e.message);
      }
    }

    // 3. Insert Linked Expense Record
    if (companyId && expAmount > 0) {
      try {
        await apiExpenses.insert({
          company_id: companyId,
          category_id: 'e2222222-2222-2222-2222-222222222222', // Marketing Category
          department_id: 'd1111111-1111-1111-1111-111111111111',
          amount: expAmount,
          description: `Initial operational expenses for ${companyData.name}`,
          expense_date: '2026-08-08'
        });
      } catch (e) {
        console.warn("Auto insert expense link warning:", e.message);
      }
    }

    // 4. Auto-create notification for new company onboarding
    try {
      await apiNotifications.insert({
        type: 'company',
        title: 'New Company Onboarded',
        message: `Company "${companyData.name}" has been onboarded with revenue $${revAmount.toLocaleString()} & expenses $${expAmount.toLocaleString()}.`,
        reference_type: 'company',
        reference_id: companyId || null
      });
    } catch (e) {
      console.warn("Auto notification company trigger warning:", e.message);
    }

    return createdCompany;
  },

  async update(id, updatedFields) {
    return await apiCompanies.update(id, updatedFields);
  },

  async setFeatured(id) {
    return await apiCompanies.setFeatured(id);
  },

  async delete(id) {
    try {
      await apiRevenues.deleteByCompanyId(id);
      await apiExpenses.deleteByCompanyId(id);
    } catch (e) {
      console.warn("Delete company linked financial records warning:", e.message);
    }
    return await apiCompanies.delete(id);
  }
};
