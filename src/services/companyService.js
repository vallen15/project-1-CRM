import { apiCompanies, apiRevenues, apiExpenses, apiNotifications } from '../lib/supabase';
import { notificationService } from './notificationService';

const isValidUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const companyService = {
  async fetchAll() {
    return await apiCompanies.fetchAll();
  },

  async create(companyData) {
    // 1. Insert Company Record with UUID Safety Checks
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
      team_id: isValidUuid(companyData.team_id) ? companyData.team_id : null,
      created_by: isValidUuid(companyData.created_by) ? companyData.created_by : null
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

    // 2. Insert Linked Revenue Record (Updates Total Revenue Card 1:1)
    if (companyId && revAmount > 0) {
      try {
        await apiRevenues.insert({
          company_id: companyId,
          amount: revAmount,
          period: 'This Month',
          year: 2026,
          transaction_date: new Date().toISOString().split('T')[0]
        });
      } catch (e) {
        console.warn("Auto insert revenue link warning:", e.message);
      }
    }

    // 3. Insert Linked Expense Record (Updates Total Expenses & Expenses Allocation Cards 1:1)
    if (companyId && expAmount > 0) {
      try {
        await apiExpenses.insert({
          company_id: companyId,
          amount: expAmount,
          description: `Initial operational expenses for ${companyData.name}`,
          expense_date: new Date().toISOString().split('T')[0]
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
        message: `Company "${companyData.name}" onboarded ($${revAmount.toLocaleString()} Rev / $${expAmount.toLocaleString()} Exp).`,
        reference_type: 'company',
        reference_id: companyId || null
      });
    } catch (e) {
      console.warn("Auto notification company trigger warning:", e.message);
    }

    return createdCompany;
  },

  async update(id, updatedFields) {
    if (!isValidUuid(id)) return null;
    const cleanFields = { ...updatedFields };
    if (cleanFields.team_id && !isValidUuid(cleanFields.team_id)) delete cleanFields.team_id;
    if (cleanFields.created_by && !isValidUuid(cleanFields.created_by)) delete cleanFields.created_by;
    return await apiCompanies.update(id, cleanFields);
  },

  async setFeatured(id) {
    if (!isValidUuid(id)) return null;
    return await apiCompanies.setFeatured(id);
  },

  async delete(id) {
    if (!isValidUuid(id)) return null;
    try {
      await notificationService.deleteByReference('company', id);
      await apiRevenues.deleteByCompanyId(id);
      await apiExpenses.deleteByCompanyId(id);
    } catch (e) {
      console.warn("Delete company linked financial records warning:", e.message);
    }
    return await apiCompanies.delete(id);
  }
};
