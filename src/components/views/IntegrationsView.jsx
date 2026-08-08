import React, { useState } from 'react';
import { Boxes, Check, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { getSupabaseStatus } from '../../lib/supabase';

export default function IntegrationsView({ onOpenSupabaseModal, currentUser }) {
  const supabaseStatus = getSupabaseStatus();
  const isAdmin = (currentUser?.role || currentUser?.user_metadata?.role || '').toLowerCase() === 'admin';

  const [integrations, setIntegrations] = useState([
    {
      id: 'supabase',
      name: 'Supabase Cloud Database',
      description: 'Cloud PostgreSQL database & Real-time backend (Admin Restricted Access)',
      category: 'Database & Backend',
      active: supabaseStatus.isConfigured,
      isSpecial: true,
    },
    {
      id: 'slack',
      name: 'Slack Notifications',
      description: 'Post automated task updates and daily reports directly to Slack channels',
      category: 'Communication',
      active: true,
    },
    {
      id: 'github',
      name: 'GitHub Repositories',
      description: 'Sync commit activity logs and issue tracking with task management',
      category: 'Developer Tools',
      active: true,
    },
    {
      id: 'google',
      name: 'Google Calendar & Workspace',
      description: 'Bi-directional sync between calendar meetings and project deadlines',
      category: 'Productivity',
      active: true,
    },
    {
      id: 'figma',
      name: 'Figma Design Tokens',
      description: 'Import UI design components and color palettes directly into app state',
      category: 'Design',
      active: true,
    },
    {
      id: 'zapier',
      name: 'Zapier Webhooks',
      description: 'Automate multi-step workflows with 5,000+ web applications',
      category: 'Automation',
      active: false,
    },
  ]);

  const toggleActive = (id) => {
    if (id === 'supabase') {
      if (isAdmin) {
        onOpenSupabaseModal();
      } else {
        alert("Akses Konfigurasi Database Supabase Cloud dibatasi! Hanya ADMIN yang dapat mengonfigurasi kredensial database.");
      }
      return;
    }
    setIntegrations(prev =>
      prev.map(item => item.id === id ? { ...item, active: !item.active } : item)
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Integrations & Connected Services</h1>
        <p className="text-xs text-gray-500 font-medium">Manage backend database configurations and third-party integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {item.category}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${item.active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
              </div>

              <h4 className="text-base font-bold text-gray-900 mb-1 flex items-center justify-between">
                <span>{item.name}</span>
                {item.id === 'supabase' && isAdmin && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" /> ADMIN ONLY
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-xs font-bold ${item.active ? 'text-emerald-700' : 'text-gray-400'}`}>
                {item.active ? 'Connected' : 'Disconnected'}
              </span>

              {item.id === 'supabase' && !isAdmin ? (
                <span className="text-[11px] font-bold text-gray-400 italic">
                  Restricted to Admin
                </span>
              ) : (
                <button
                  onClick={() => toggleActive(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    item.active
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {item.isSpecial ? 'Configure Keys' : item.active ? 'Disconnect' : 'Connect App'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
