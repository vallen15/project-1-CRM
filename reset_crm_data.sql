-- ================================================================
-- MASTER CRM DATABASE RESET SCRIPT
-- SUPABASE = SINGLE SOURCE OF TRUTH
-- ================================================================
-- THIS SCRIPT TRUNCATES ALL CRM BUSINESS RECORDS WHILE KEEPING:
-- 1. auth.users & profiles (Preserves Admin & User login accounts)
-- 2. teams (Preserves standard 5 teams)
-- 3. departments (Preserves standard 3 departments)
-- 4. expense_categories (Preserves standard 4 categories)
-- ================================================================

-- 1. TRUNCATE CRM BUSINESS RECORDS
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

-- 2. ENSURE STANDARD BASE DATA (TEAMS, DEPARTMENTS, EXPENSE CATEGORIES)
INSERT INTO public.departments (id, name, code, badge) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Marketing', 'MKT', 'M'),
  ('d2222222-2222-2222-2222-222222222222', 'Design', 'DSG', 'D'),
  ('d3333333-3333-3333-3333-333333333333', 'Production', 'PRD', 'P')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.teams (id, name, description) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Marketing', 'Digital marketing and growth'),
  ('a2222222-2222-2222-2222-222222222222', 'Design', 'UI/UX and product design'),
  ('a3333333-3333-3333-3333-333333333333', 'Production', 'Infrastructure and operations'),
  ('a4444444-4444-4444-4444-444444444444', 'Development', 'Full-stack engineering'),
  ('a5555555-5555-5555-5555-555555555555', 'Operations', 'Business operations')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.expense_categories (id, name, description) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Production', 'Production costs'),
  ('e2222222-2222-2222-2222-222222222222', 'Marketing', 'Marketing costs'),
  ('e3333333-3333-3333-3333-333333333333', 'Operational', 'Operational costs'),
  ('e4444444-4444-4444-4444-444444444444', 'Design', 'Design costs')
ON CONFLICT (id) DO NOTHING;

-- 3. VERIFY PROFILES FOR ANY EXISTING AUTH.USERS
INSERT INTO public.profiles (user_id, full_name, email, role, job_title)
SELECT
  id,
  COALESCE(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1)),
  email,
  CASE WHEN email = 'admin@gmail.com' THEN 'admin' ELSE 'user' END,
  CASE WHEN email = 'admin@gmail.com' THEN 'System Administrator' ELSE 'Team Member' END
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = now();

-- SUMMARY CONFIRMATION
SELECT 'CRM DATA RESET COMPLETE. ALL BUSINESS TABLES TRUNCATED TO 0 RECORDS.' AS status;
