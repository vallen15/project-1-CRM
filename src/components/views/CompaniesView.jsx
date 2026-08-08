import React, { useState } from 'react';
import { Building2, Plus, Search, Star, Trash2, X, DollarSign, TrendingUp, ArrowUpRight, PieChart, Layers, Edit2, ShieldCheck, UserCheck, Mail, Phone, Globe, MapPin, AlertTriangle, FileText, CheckSquare, Calendar, Users } from 'lucide-react';

export default function CompaniesView({
  companies,
  onAddCompany,
  onEditCompany,
  onDeleteCompany,
  onSetFeaturedCompany,
  dashboardData,
  currentUser,
  teams = [],
  tasks = [],
  contacts = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');

  const isAdmin = (currentUser?.role || currentUser?.user_metadata?.role || '').toLowerCase() === 'admin';
  const currentUserId = currentUser?.id || currentUser?.user_id || 'p0000000-0000-0000-0000-000000000000';

  // Add Company Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Web Design');
  const [transactions, setTransactions] = useState('1,641');
  const [revenue, setRevenue] = useState('$15,000');
  const [expenses, setExpenses] = useState('$2,100');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || 'a2222222-2222-2222-2222-222222222222');

  // Edit Company Form State
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTransactions, setEditTransactions] = useState('');
  const [editRevenue, setEditRevenue] = useState('');
  const [editExpenses, setEditExpenses] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTeamId, setEditTeamId] = useState('');
  const [editOwnerId, setEditOwnerId] = useState('');

  // Default team options list if not passed
  const availableTeams = teams.length > 0 ? teams : [
    { id: 't1111111-1111-1111-1111-111111111111', name: "Marketing Team's", badge: 'M' },
    { id: 't2222222-2222-2222-2222-222222222222', name: "Design Team's", badge: 'D' },
    { id: 't3333333-3333-3333-3333-333333333333', name: "Production Team's", badge: 'P' },
    { id: 't4444444-4444-4444-4444-444444444444', name: "Development Team's", badge: 'DEV' },
    { id: 't5555555-5555-5555-5555-555555555555', name: "Operations Team's", badge: 'OPS' },
  ];

  // Helper: check if current user can edit a company
  const canEdit = (company) => {
    if (isAdmin) return true;
    return company.created_by === currentUserId || company.created_by === currentUser?.id;
  };

  // Helper: check if current user can delete a company
  const canDelete = (company) => {
    if (isAdmin) return true;
    return company.created_by === currentUserId || company.created_by === currentUser?.id;
  };

  const handleAddCompanySubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCompany({
      name: name.trim(),
      category: category.trim() || 'Web Design',
      transactions: transactions.trim() || '1,000',
      revenue: revenue || '$15,000',
      expenses: expenses || '$2,100',
      website: website.trim() || 'https://' + name.trim().toLowerCase().replace(/\s+/g, '') + '.com',
      email: email.trim() || 'contact@' + name.trim().toLowerCase().replace(/\s+/g, '') + '.com',
      phone: phone.trim() || '+1-555-0100',
      status: 'Active',
      is_featured: false,
      logo_bg: 'bg-black',
      team_id: isAdmin ? selectedTeamId : currentUser?.team_id,
      created_by: currentUser?.id || currentUser?.user_id
    });

    setShowAddCompanyModal(false);
    setName('');
    setCategory('Web Design');
    setTransactions('1,641');
    setRevenue('$15,000');
    setExpenses('$2,100');
  };

  const startEditCompany = (c) => {
    setEditingCompany(c);
    setEditName(c.name);
    setEditCategory(c.category || 'Web Design');
    setEditTransactions(c.transactions || '1,641');
    setEditRevenue(c.revenue || '$15,000');
    setEditExpenses(c.expenses || '$2,100');
    setEditWebsite(c.website || '');
    setEditEmail(c.email || '');
    setEditPhone(c.phone || '');
    setEditTeamId(c.team_id || availableTeams[0]?.id);
    setEditOwnerId(c.created_by || currentUserId);
  };

  const handleEditCompanySubmit = (e) => {
    e.preventDefault();
    if (!editingCompany || !editName.trim()) return;

    const updatedFields = {
      name: editName.trim(),
      category: editCategory.trim(),
      transactions: editTransactions.trim(),
      revenue: editRevenue.trim(),
      expenses: editExpenses.trim(),
      website: editWebsite.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      ...(isAdmin && { team_id: editTeamId }),
      ...(isAdmin && editOwnerId && { created_by: editOwnerId })
    };

    if (onEditCompany) {
      onEditCompany(editingCompany.id, updatedFields);
    }
    setEditingCompany(null);
  };

  const confirmDelete = () => {
    if (deletingCompany && onDeleteCompany) {
      onDeleteCompany(deletingCompany.id);
      setDeletingCompany(null);
    }
  };

  const filtered = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (isAdmin) return matchesSearch;
    // For regular users, show all viewable companies
    return matchesSearch;
  });

  const featuredCompany = companies.find(c => c.is_featured || c.status === 'Featured') || companies[0];

  const getTeamName = (teamId) => {
    const t = availableTeams.find(item => item.id === teamId);
    return t ? t.name : "Design Team's";
  };

  const getOwnerName = (createdBy) => {
    if (!createdBy || createdBy === 'p0000000-0000-0000-0000-000000000000' || createdBy.includes('0000')) return 'System Admin';
    if (createdBy === 'p1111111-1111-1111-1111-111111111111' || createdBy.includes('1111')) return 'John Doe';
    if (createdBy === 'p2222222-2222-2222-2222-222222222222' || createdBy.includes('2222')) return 'Sarah Connor';
    if (createdBy === 'p3333333-3333-3333-3333-333333333333' || createdBy.includes('3333')) return 'Alex Rivera';
    return 'Team Member';
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Companies & Corporate Directory</h1>
            {isAdmin ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> FULL ADMIN ACCESS
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                USER ACCESS (OWNED & ASSIGNED PERMISSION)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">Manage partner organizations, financial revenues, expenses, and team assignments</p>
        </div>

        <button
          onClick={() => setShowAddCompanyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Company</span>
        </button>
      </div>

      {/* Financial Overview Metric Banner Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              ★ Highlighted Company
            </span>
            <h4 className="text-base font-bold text-gray-900 truncate max-w-[140px]">{featuredCompany?.name || 'Product design'}</h4>
            <span className="text-xs font-extrabold text-black block mt-0.5">{featuredCompany?.transactions || '1,641'} Tx</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              Total Expenses
            </span>
            <h4 className="text-base font-bold text-gray-900">{dashboardData?.totalExpenses?.formatted || '$8,414'}</h4>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12% Growth
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              Expenses Allocation
            </span>
            <h4 className="text-base font-bold text-gray-900">{dashboardData?.expensesAllocation?.amountFormatted || '$44,171k'}</h4>
            <span className="text-[11px] font-medium text-gray-500 block mt-0.5">4 Core Categories</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <PieChart className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              Total Revenue
            </span>
            <h4 className="text-base font-bold text-gray-900">{dashboardData?.totalRevenue?.amountFormatted || '$56,123k'}</h4>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12% Growth
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter companies by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-black shadow-2xs font-medium"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => {
          const isUserEditable = canEdit(c);
          const isUserDeletable = canDelete(c);
          const teamName = getTeamName(c.team_id);
          const ownerName = getOwnerName(c.created_by);

          return (
            <div key={c.id} className={`bg-white rounded-2xl p-5 border shadow-2xs space-y-4 hover:shadow-xs transition-all relative flex flex-col justify-between ${
              c.is_featured || c.status === 'Featured' ? 'border-black ring-1 ring-black' : 'border-gray-200'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCompanyDetail(c)}>
                    <div className={`w-10 h-10 rounded-xl ${c.logo_bg || 'bg-black'} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
                      {c.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 hover:underline">{c.name}</h4>
                      <span className="text-xs text-gray-500 font-medium">{c.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Featured Star Button (Admin Only or Editable) */}
                    {isAdmin && (
                      <button
                        onClick={() => onSetFeaturedCompany(c.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          c.is_featured || c.status === 'Featured'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                        title="Set as Highlighted Company on Dashboard"
                      >
                        <Star className={`w-3.5 h-3.5 ${c.is_featured || c.status === 'Featured' ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    )}

                    {/* Edit Button */}
                    {isUserEditable && (
                      <button
                        onClick={() => startEditCompany(c)}
                        className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit Company"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete Button */}
                    {isUserDeletable && (
                      <button
                        onClick={() => setDeletingCompany(c)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Team & Owner Badges (Clean UI without locks) */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-semibold block text-[9px] uppercase">Team</span>
                    <span className="font-bold text-gray-800 truncate block">{teamName}</span>
                  </div>

                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-semibold block text-[9px] uppercase">Owner</span>
                    <span className="font-bold text-gray-800 truncate block">{ownerName}</span>
                  </div>
                </div>

                {/* Financial Ledger Breakdown per Company */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Monthly Transactions</span>
                    <span className="font-extrabold text-gray-900">{c.transactions || '1,641'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">Est. Monthly Revenue</span>
                    <span className="font-bold text-emerald-600">{c.revenue || '$15,000'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">Est. Monthly Expenses</span>
                    <span className="font-bold text-rose-600">{c.expenses || '$2,100'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedCompanyDetail(c)}
                  className="w-full text-center py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-all"
                >
                  View Company Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD COMPANY MODAL */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Add New Company & Financials</h3>
              <button onClick={() => setShowAddCompanyModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCompanySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Studio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category / Industry</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Web Design"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
                />
              </div>

              {/* ADMIN ONLY TEAM ASSIGNMENT DROPDOWN */}
              {isAdmin ? (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assign to Team (Admin Control)</label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-bold"
                  >
                    {availableTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Team</label>
                  <div className="px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-700">
                    {getTeamName(currentUser?.team_id || 'a2222222-2222-2222-2222-222222222222')}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Est. Revenue</label>
                  <input
                    type="text"
                    placeholder="e.g. $15,000"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Est. Expenses</label>
                  <input
                    type="text"
                    placeholder="e.g. $2,100"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 shadow-2xs"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COMPANY MODAL */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Edit Company: {editingCompany.name}</h3>
              <button onClick={() => setEditingCompany(null)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCompanySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category / Industry</label>
                <input
                  type="text"
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
                />
              </div>

              {/* ADMIN CAN CHANGE TEAM; USER SEES INFORMATIVE TEXT WITHOUT LOCK */}
              {isAdmin ? (
                <div>
                  <label className="block font-semibold text-amber-800 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Change Team (Admin Control)
                  </label>
                  <select
                    value={editTeamId}
                    onChange={(e) => setEditTeamId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:border-amber-500 font-bold text-amber-900"
                  >
                    {availableTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Team</label>
                  <div className="px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-700">
                    {getTeamName(editingCompany.team_id)}
                  </div>
                </div>
              )}

              {/* ADMIN CAN CHANGE OWNER; USER SEES INFORMATIVE TEXT */}
              {isAdmin ? (
                <div>
                  <label className="block font-semibold text-amber-800 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Change Owner (Admin Control)
                  </label>
                  <select
                    value={editOwnerId}
                    onChange={(e) => setEditOwnerId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:border-amber-500 font-bold text-amber-900"
                  >
                    <option value="p0000000-0000-0000-0000-000000000000">System Admin</option>
                    <option value="p1111111-1111-1111-1111-111111111111">John Doe</option>
                    <option value="p2222222-2222-2222-2222-222222222222">Sarah Connor</option>
                    <option value="p3333333-3333-3333-3333-333333333333">Alex Rivera</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company Owner</label>
                  <div className="px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-700">
                    {getOwnerName(editingCompany.created_by)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Est. Revenue</label>
                  <input
                    type="text"
                    value={editRevenue}
                    onChange={(e) => setEditRevenue(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Est. Expenses</label>
                  <input
                    type="text"
                    value={editExpenses}
                    onChange={(e) => setEditExpenses(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 shadow-2xs"
                >
                  Update Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Company?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deletingCompany.name}"</span>? Associated revenue, expenses, and records will be cleanly cascade-removed.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCompany(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 text-xs shadow-2xs"
              >
                Delete Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPANY DETAIL OVERVIEW MODAL */}
      {selectedCompanyDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col font-sans">
            <div className="p-6 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${selectedCompanyDetail.logo_bg || 'bg-[#d94a28]'} text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md`}>
                  {selectedCompanyDetail.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedCompanyDetail.name}</h2>
                  <p className="text-xs text-gray-300 font-medium">{selectedCompanyDetail.category}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span>Team: <strong className="text-white">{getTeamName(selectedCompanyDetail.team_id)}</strong></span>
                    <span>•</span>
                    <span>Owner: <strong className="text-white">{getOwnerName(selectedCompanyDetail.created_by)}</strong></span>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedCompanyDetail(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtab Navigation */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-gray-200 bg-gray-50 text-xs overflow-x-auto">
              <button
                onClick={() => setDetailTab('overview')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                  detailTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDetailTab('financials')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                  detailTab === 'financials' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                Revenue & Expenses
              </button>
              <button
                onClick={() => setDetailTab('tasks')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                  detailTab === 'tasks' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                Tasks ({tasks.filter(t => t.company === selectedCompanyDetail.name || t.company_id === selectedCompanyDetail.id).length})
              </button>
              <button
                onClick={() => setDetailTab('contacts')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
                  detailTab === 'contacts' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                Contacts ({contacts.filter(c => c.company === selectedCompanyDetail.name || c.company_id === selectedCompanyDetail.id).length})
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-gray-700">
              {detailTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Transactions</span>
                      <span className="text-lg font-black text-gray-900">{selectedCompanyDetail.transactions || '1,641'}</span>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Monthly Revenue</span>
                      <span className="text-lg font-black text-emerald-800">{selectedCompanyDetail.revenue || '$15,000'}</span>
                    </div>

                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                      <span className="text-rose-700 font-semibold block text-[10px] uppercase">Monthly Expenses</span>
                      <span className="text-lg font-black text-rose-800">{selectedCompanyDetail.expenses || '$2,100'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm">Company Info & Contacts</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Website</span>
                        <a href={selectedCompanyDetail.website || '#'} target="_blank" rel="noreferrer" className="text-black font-bold hover:underline">
                          {selectedCompanyDetail.website || 'https://company.com'}
                        </a>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Email</span>
                        <span className="font-semibold text-gray-800">{selectedCompanyDetail.email || 'contact@company.com'}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Phone</span>
                        <span className="font-semibold text-gray-800">{selectedCompanyDetail.phone || '+1-555-0101'}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">Address</span>
                        <span className="font-semibold text-gray-800">{selectedCompanyDetail.address || 'San Francisco, CA'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'financials' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Net Profit Estimation</h4>
                      <p className="text-[11px] text-gray-500">Revenue minus operating expenses</p>
                    </div>
                    <span className="text-xl font-black text-emerald-600">$12,900 / mo</span>
                  </div>
                </div>
              )}

              {detailTab === 'tasks' && (
                <div className="space-y-2">
                  {tasks.filter(t => t.company === selectedCompanyDetail.name || t.company_id === selectedCompanyDetail.id).length > 0 ? (
                    tasks.filter(t => t.company === selectedCompanyDetail.name || t.company_id === selectedCompanyDetail.id).map(t => (
                      <div key={t.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                        <span className="font-bold text-gray-900">{t.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black text-white">{t.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">No tasks linked to this company yet.</p>
                  )}
                </div>
              )}

              {detailTab === 'contacts' && (
                <div className="space-y-2">
                  {contacts.filter(c => c.company === selectedCompanyDetail.name || c.company_id === selectedCompanyDetail.id).length > 0 ? (
                    contacts.filter(c => c.company === selectedCompanyDetail.name || c.company_id === selectedCompanyDetail.id).map(c => (
                      <div key={c.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block">{c.name}</span>
                          <span className="text-[11px] text-gray-500">{c.role} • {c.email}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">No contacts linked to this company yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
