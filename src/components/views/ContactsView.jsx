import React, { useState } from 'react';
import { Mail, Building2, User, Plus, Trash2, Search, X, ShieldCheck } from 'lucide-react';

export default function ContactsView({ contacts, onAddContact, onDeleteContact, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');

  const isAdmin = (currentUser?.role || currentUser?.user_metadata?.role || '').toLowerCase() === 'admin';

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAddContact({
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || 'Member',
      company: company.trim() || 'Partner'
    });

    setName('');
    setEmail('');
    setRole('');
    setCompany('');
    setShowAddModal(false);
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Contacts Directory</h1>
            {isAdmin ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-600" /> ADMIN MANAGEMENT ACCESS
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                READ-ONLY ACCESS
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium">Team members, client representatives, and enterprise partners</p>
        </div>

        {/* Add Contact Button (ONLY VISIBLE TO ADMIN) */}
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Contact (Admin Only)</span>
          </button>
        )}
      </div>

      {/* Search Input Box */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search contacts by name, email, role, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-black shadow-2xs"
        />
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4 relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-sm text-black shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{c.name}</h4>
                    <span className="text-xs font-semibold text-gray-500">{c.role}</span>
                  </div>
                </div>

                {/* Delete Button (ONLY VISIBLE TO ADMIN) */}
                {isAdmin && (
                  <button
                    onClick={() => onDeleteContact(c.id)}
                    className="text-gray-300 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50"
                    title="Delete Contact (Admin Only)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-800">{c.company}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <a href={`mailto:${c.email}`} className="text-gray-700 hover:text-black hover:underline truncate">
                    {c.email}
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-3 bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200 text-xs font-medium">
            No contacts match the current search query.
          </div>
        )}
      </div>

      {/* Add New Contact Modal (ONLY ACCESSIBLE TO ADMIN) */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Add New Contact (Admin Only)</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@acme.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Position / Job Role</label>
                <input
                  type="text"
                  placeholder="e.g. Product Manager"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Product design, Acme Corp, TechLabs Inc"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 text-xs shadow-2xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
