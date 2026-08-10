-- ====================================================================
-- FILE TUNGGAL RESMI (SINGLE MASTER SETUP SCRIPT FOR SUPABASE POSTGRESQL)
-- Salin HANYA file ini dan paste di Supabase SQL Editor:
-- https://app.supabase.com -> Project Anda -> SQL Editor -> New Query
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. RESET / CLEANUP TABEL SEBELUMNYA
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.calendars CASCADE;
DROP TABLE IF EXISTS public.emails CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.revenues CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.expense_categories CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- 2. CREATE DEPARTMENTS & TEAMS
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  badge VARCHAR(8) NOT NULL DEFAULT 'M',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREATE PROFILES (INTEGRATED WITH SUPABASE AUTH)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  job_title VARCHAR(100) NOT NULL DEFAULT 'Team Member',
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Jakarta',
  language VARCHAR(50) NOT NULL DEFAULT 'English',
  theme VARCHAR(50) NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CREATE COMPANIES
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  total_transactions VARCHAR(50) NOT NULL DEFAULT '1,000',
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  logo_bg VARCHAR(80) NOT NULL DEFAULT 'bg-black',
  logo_url TEXT,
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CREATE CONTACTS
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(100) DEFAULT 'Member',
  company_name VARCHAR(255),
  address TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CREATE TASKS
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  team VARCHAR(100) NOT NULL DEFAULT 'Marketing Teams',
  priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
  status VARCHAR(50) NOT NULL DEFAULT 'Todo',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date DATE DEFAULT CURRENT_DATE,
  due_date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CREATE NOTES
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CREATE NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_email VARCHAR(255),
  reference_type VARCHAR(50),
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CREATE EMAILS
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  folder VARCHAR(50) NOT NULL DEFAULT 'inbox',
  sender VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  recipient VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  snippet TEXT,
  body TEXT,
  starred BOOLEAN NOT NULL DEFAULT FALSE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CREATE CALENDARS
CREATE TABLE public.calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  day_of_month INTEGER NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 31),
  event_date DATE DEFAULT CURRENT_DATE,
  team VARCHAR(100) NOT NULL DEFAULT 'Marketing Teams',
  time_range VARCHAR(100) NOT NULL DEFAULT '10:00 AM - 11:00 AM',
  event_type VARCHAR(50) NOT NULL DEFAULT 'Meeting',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CREATE EXPENSES & REVENUES
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Operational',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  period VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  type VARCHAR(50) NOT NULL DEFAULT 'Revenue',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Productivity',
  description TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT FALSE,
  icon VARCHAR(100),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_tab VARCHAR(100) NOT NULL DEFAULT 'dashboard',
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RECREATE PROFILES FOR EXISTING AUTH ACCOUNTS
INSERT INTO public.profiles (user_id, full_name, email, role, job_title)
SELECT
  id,
  COALESCE(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1)),
  email,
  'user',
  'Team Member'
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, updated_at = NOW();

-- ENABLE RLS & POLICIES
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public departments" ON public.departments FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public teams" ON public.teams FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public profiles" ON public.profiles FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public companies" ON public.companies FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public contacts" ON public.contacts FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public tasks" ON public.tasks FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public notes" ON public.notes FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public notifications" ON public.notifications FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public emails" ON public.emails FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public calendars" ON public.calendars FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public expense categories" ON public.expense_categories FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public expenses" ON public.expenses FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public revenues" ON public.revenues FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public transactions" ON public.transactions FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public integrations" ON public.integrations FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public settings" ON public.settings FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "public user preferences" ON public.user_preferences FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- SEED DEPARTMENTS & TEAMS
INSERT INTO public.departments (id, name, code, badge) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Marketing', 'MKT', 'M'),
  ('d2222222-2222-2222-2222-222222222222', 'Design', 'DSG', 'D'),
  ('d3333333-3333-3333-3333-333333333333', 'Production', 'PRD', 'P')
ON CONFLICT DO NOTHING;

INSERT INTO public.teams (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Marketing Team''s', 'Digital marketing and growth'),
  ('22222222-2222-2222-2222-222222222222', 'Design Team''s', 'UI/UX and product design'),
  ('33333333-3333-3333-3333-333333333333', 'Production Team''s', 'Infrastructure and operations'),
  ('44444444-4444-4444-4444-444444444444', 'Development Team''s', 'Full-stack engineering'),
  ('55555555-5555-5555-5555-555555555555', 'Operations Team''s', 'Business operations')
ON CONFLICT DO NOTHING;

-- SEED FEATURED COMPANY (1:1 TARGET DASHBOARD MATCHING)
INSERT INTO public.companies (
    id,
    name,
    category,
    total_transactions,
    status,
    is_featured,
    logo_bg,
    created_at
) VALUES (
    'c1111111-1111-1111-1111-111111111111',
    'Product design',
    'Web Design',
    '1,641',
    'Featured',
    TRUE,
    'bg-rose-500',
    NOW()
), (
    'c2222222-2222-2222-2222-222222222222',
    'Acme Corporation',
    'Tech & Innovation',
    '850',
    'Active',
    FALSE,
    'bg-black',
    NOW()
), (
    'c3333333-3333-3333-3333-333333333333',
    'TechLabs Inc',
    'Software Engineering',
    '1,200',
    'Active',
    FALSE,
    'bg-blue-600',
    NOW()
);

-- SEED 500 TASKS (64% PROGRESS / 435/500 METRICS MATCHING - PURE STANDARD SQL)
INSERT INTO public.tasks (
    id,
    title,
    description,
    status,
    team,
    priority,
    start_date,
    due_date,
    company_id,
    created_at
)
SELECT
    gen_random_uuid(),
    CASE
        WHEN i % 4 = 1 THEN 'Marketing Strategy & Analytics Campaign #' || i
        WHEN i % 4 = 2 THEN 'Product Interface & UI Design Sprint #' || i
        WHEN i % 4 = 3 THEN 'Server Deployment & Infrastructure Audit #' || i
        ELSE 'Fullstack API Integration & RLS Policy #' || i
    END,
    'Automated PostgreSQL Task record generated for CRM metrics synchronization',
    CASE
        WHEN i <= 320 THEN 'completed'
        WHEN i <= 435 THEN 'in_progress'
        ELSE 'todo'
    END,
    CASE
        WHEN i % 4 = 1 THEN 'Marketing Teams'
        WHEN i % 4 = 2 THEN 'Design Teams'
        WHEN i % 4 = 3 THEN 'Production Teams'
        ELSE 'Development Teams'
    END,
    CASE WHEN i % 3 = 0 THEN 'High' WHEN i % 3 = 1 THEN 'Medium' ELSE 'Low' END,
    CURRENT_DATE - (i % 7 || ' days')::INTERVAL,
    CURRENT_DATE + (i % 14 || ' days')::INTERVAL,
    'c1111111-1111-1111-1111-111111111111',
    NOW()
FROM generate_series(1, 500) AS i;

-- SEED EXPENSES, REVENUES & TRANSACTIONS (1:1 DASHBOARD CHART WAVE MATCHING)
INSERT INTO public.expenses (company_id, category, amount, description, expense_date) VALUES 
('c1111111-1111-1111-1111-111111111111', 'Production', 12500.00, 'Cloud Infrastructure & Server Scaling', CURRENT_DATE),
('c1111111-1111-1111-1111-111111111111', 'Marketing', 14200.00, 'Global Ad Campaigns & Lead Generation', CURRENT_DATE),
('c1111111-1111-1111-1111-111111111111', 'Operational', 10000.00, 'Workspace Hardware & Tool Licensing', CURRENT_DATE),
('c1111111-1111-1111-1111-111111111111', 'Design', 7471.00, 'Brand Identity & User Testing', CURRENT_DATE),
('c1111111-1111-1111-1111-111111111111', 'Operational', 8414.00, 'Monthly Operational Expenses', CURRENT_DATE);

INSERT INTO public.revenues (company_id, amount, period, year, transaction_date) VALUES
('c1111111-1111-1111-1111-111111111111', 28000000.00, 'Year 2019', 2019, '2019-12-31'),
('c1111111-1111-1111-1111-111111111111', 56123000.00, 'Year 2020', 2020, '2020-12-31'),
('c1111111-1111-1111-1111-111111111111', 42000000.00, 'Year 2021', 2021, '2021-12-31'),
('c1111111-1111-1111-1111-111111111111', 32000000.00, 'Year 2022', 2022, '2022-12-31'),
('c1111111-1111-1111-1111-111111111111', 48000000.00, 'Year 2023', 2023, '2023-12-31');

INSERT INTO public.transactions (company_id, title, amount, type, transaction_date) VALUES
('c1111111-1111-1111-1111-111111111111', 'Web Design UI Contract', 164100.00, 'Revenue', CURRENT_DATE);

INSERT INTO public.contacts (name, email, position, company_name, company_id) VALUES
('John Doe', 'john.d@company.com', 'Lead Product Designer', 'Product design', 'c1111111-1111-1111-1111-111111111111'),
('Sarah Connor', 'sarah@acme.org', 'Marketing Director', 'Acme Corporation', 'c2222222-2222-2222-2222-222222222222'),
('Alex Rivera', 'alex@techlabs.io', 'VP Engineering', 'TechLabs Inc', 'c3333333-3333-3333-3333-333333333333');

INSERT INTO public.notes (title, content, created_at) VALUES
('Q3 Product Roadmap Review', 'Finalize design tokens and user onboarding experience in Supabase CRM.', NOW());

INSERT INTO public.emails (folder, sender, email, recipient, subject, snippet, body, is_read, created_at) VALUES
('inbox', 'Sarah Connor', 'sarah@acme.org', 'admin@gmail.com', 'Product Design Partnership Proposal', 'Hello team, we are excited to expand our Web Design contract...', 'Hello team,\n\nWe are excited to expand our Web Design contract with Product Design...', FALSE, NOW());

INSERT INTO public.calendars (title, day_of_month, event_date, team, time_range, event_type) VALUES
('Design System Sprint & Component Review', 8, '2026-08-08', 'Design Teams', '10:00 AM - 11:30 AM', 'Meeting');

INSERT INTO public.notifications (type, title, message, is_read, target_email, created_at) VALUES
('company', 'Highlighted Company Updated', 'Product design selected as Featured Company ($56,123k Rev).', FALSE, 'admin@gmail.com', NOW());

SELECT 'SUCCESS: All Supabase CRM Tables & 1:1 Dashboard Seed Data Created Successfully!' AS status;
