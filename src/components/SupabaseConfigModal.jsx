import React, { useState } from 'react';
import { X, Database, Check, Copy, KeyRound, Activity, AlertCircle, Trash2 } from 'lucide-react';
import { getSupabaseStatus, pingSupabaseDatabase, purgeAllCrmData } from '../lib/supabase';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const status = getSupabaseStatus();
  const [url, setUrl] = useState(status.url === 'https://xyzcompanyplaceholder.supabase.co' ? '' : status.url);
  const [anonKey, setAnonKey] = useState(status.anonKey.includes('placeholder') ? '' : status.anonKey);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    alert('Supabase credentials are loaded from the .env file. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file, then restart Vite.');
  };

  const handleTestConnection = async () => {
    setIsPinging(true);
    const res = await pingSupabaseDatabase();
    setPingResult(res);
    setIsPinging(false);
  };

  const handlePurgeDatabase = async () => {
    if (!window.confirm("AKSI KONFIRMASI: Apakah Anda yakin ingin mengosongkan SELURUH RECORD DATA CRM (Companies, Tasks, Contacts, Emails, Notifications, Calendars, Notes, Revenues, Expenses, Transactions) di Supabase Cloud Database menjadi 0 Records?")) {
      return;
    }

    setIsPurging(true);
    try {
      await purgeAllCrmData();
      setPurgeSuccess(true);
      alert("SUKSES: Seluruh data record CRM di Supabase Cloud Database telah dikosongkan menjadi 0 Records!");
      window.location.reload();
    } catch (err) {
      alert("Terjadi kesalahan saat mengosongkan database: " + err.message);
    } finally {
      setIsPurging(false);
    }
  };

  const sqlCode = `-- COMPLETE RESET CRM BUSINESS DATA TO 0 RECORDS
-- Run this script in Supabase SQL Editor: https://app.supabase.com

TRUNCATE TABLE public.tasks CASCADE;
TRUNCATE TABLE public.companies CASCADE;
TRUNCATE TABLE public.contacts CASCADE;
TRUNCATE TABLE public.emails CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.calendars CASCADE;
TRUNCATE TABLE public.notes CASCADE;
TRUNCATE TABLE public.revenues CASCADE;
TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.transactions CASCADE;

SELECT 'CRM BUSINESS DATA RESET COMPLETE. ALL TABLES AT 0 RECORDS.' AS status;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Supabase Cloud Database</h3>
              <p className="text-xs text-gray-500 font-medium">
                {status.isConfigured ? 'Connected to live PostgreSQL database' : 'Set credentials in .env to connect'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50 px-5 gap-4">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'credentials'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            Credentials & Sync
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            SQL Truncate Script
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'credentials' ? (
            <div className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black font-mono text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-black font-mono text-xs transition-all"
                  />
                </div>

                {/* Ping Test Result Box */}
                {pingResult && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    pingResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {pingResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{pingResult.message}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isPinging}
                    className="text-xs font-semibold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? 'Pinging...' : 'Test Connection'}</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white font-semibold text-xs rounded-xl hover:bg-gray-800 shadow-xs"
                    >
                      Save Setup
                    </button>
                  </div>
                </div>
              </form>

              {/* Purge Database Button Section */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-700">Empty Database Records</h4>
                  <p className="text-[11px] text-gray-400">Clear all CRM data records in Supabase Cloud to 0</p>
                </div>
                <button
                  type="button"
                  onClick={handlePurgeDatabase}
                  disabled={isPurging}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isPurging ? 'Clearing...' : 'Purge All Records'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Database SQL Truncate Script</span>
                <button
                  onClick={copySql}
                  className="flex items-center gap-1 text-xs text-black font-semibold bg-gray-100 px-2.5 py-1 rounded-lg hover:bg-gray-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
                {sqlCode}
              </pre>
              <p className="text-[11px] text-gray-500 font-medium">
                Run this SQL query in your Supabase Dashboard under SQL Editor to truncate all CRM business tables to 0 records.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
