import React, { useState } from 'react';
import { X, Database, Check, Copy, KeyRound, Activity, AlertCircle } from 'lucide-react';
import { getSupabaseStatus, pingSupabaseDatabase } from '../lib/supabase';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const status = getSupabaseStatus();
  const [url, setUrl] = useState(status.url === 'https://xyzcompanyplaceholder.supabase.co' ? '' : status.url);
  const [anonKey, setAnonKey] = useState(status.anonKey.includes('placeholder') ? '' : status.anonKey);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    alert('Supabase credentials are loaded only from the .env file. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the application.');
  };

  const handleTestConnection = async () => {
    setIsPinging(true);
    const res = await pingSupabaseDatabase();
    setPingResult(res);
    setIsPinging(false);
  };

  const sqlCode = `-- COMPLETE SUPABASE SQL SCHEMA (v1.1 Self-Healing)
-- Run this in Supabase SQL Editor: https://app.supabase.com

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    total_transactions VARCHAR(50) DEFAULT '1,000',
    status VARCHAR(50) DEFAULT 'Active',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    team VARCHAR(100) DEFAULT 'Marketing Team''s',
    status VARCHAR(50) DEFAULT 'todo',
    due_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    amount DECIMAL(12,2) NOT NULL,
    month VARCHAR(50) DEFAULT 'December',
    year INT DEFAULT 2026,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    company_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public notes" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
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
            SQL Migration Script
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'credentials' ? (
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
                    Connection setup
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Database SQL Migration Script</span>
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
                Copy and run this script in your Supabase project dashboard under SQL Editor to initialize all tables.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
