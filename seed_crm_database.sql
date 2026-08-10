-- ================================================================
-- MASTER CRM DATABASE SEED SCRIPT FOR SUPABASE POSTGRESQL
-- Copy and paste this script directly into Supabase SQL Editor:
-- https://app.supabase.com -> Project -> SQL Editor -> New Query
-- ================================================================

-- 1. PURGE EXISTING DATA RECORD (CLEAN RESET FOR 1:1 SYNCHRONIZATION)
TRUNCATE TABLE public.tasks CASCADE;
TRUNCATE TABLE public.companies CASCADE;
TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.revenues CASCADE;
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.contacts CASCADE;
TRUNCATE TABLE public.notes CASCADE;
TRUNCATE TABLE public.emails CASCADE;
TRUNCATE TABLE public.calendars CASCADE;
TRUNCATE TABLE public.notifications CASCADE;

-- 2. SEED FEATURED COMPANY (1:1 TARGET DASHBOARD DATA)
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

-- 3. SEED 500 TASKS (PURE STANDARD SQL GENERATE_SERIES)
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

-- 4. SEED TOTAL EXPENSES & ALLOCATION ($8,414 Monthly / $44,171 Total Allocation)
INSERT INTO public.expenses (company_id, category, amount, description, expense_date) VALUES 
('c1111111-1111-1111-1111-111111111111', 'Production', 12500.00, 'Cloud Infrastructure & Server Scaling', CURRENT_DATE),
('c1111111-1111-1111-1111-111111111111', 'Marketing', 14200.00, 'Global Ad Campaigns & Lead Generation', CURRENT_DATE),
('c1111111-1111-1111-1111-111111111111', 'Operational', 10000.00, 'Workspace Hardware & Tool Licensing', CURRENT_DATE),
('c1111111-1111-1111-1111-111111111111', 'Design', 7471.00, 'Brand Identity & User Testing', CURRENT_DATE),
('c1111111-1111-1111-1111-111111111111', 'Operational', 8414.00, 'Monthly Operational Expenses', CURRENT_DATE);

-- 5. SEED TOTAL REVENUE ($56,123k Target Metric)
INSERT INTO public.revenues (company_id, amount, period, year, transaction_date) VALUES
('c1111111-1111-1111-1111-111111111111', 56123000.00, 'This Month', 2026, CURRENT_DATE);

-- 6. SEED CONTACTS DIRECTORY
INSERT INTO public.contacts (name, email, position, company_name, company_id) VALUES
('John Doe', 'john.d@company.com', 'Lead Product Designer', 'Product design', 'c1111111-1111-1111-1111-111111111111'),
('Sarah Connor', 'sarah@acme.org', 'Marketing Director', 'Acme Corporation', 'c2222222-2222-2222-2222-222222222222'),
('Alex Rivera', 'alex@techlabs.io', 'VP Engineering', 'TechLabs Inc', 'c3333333-3333-3333-3333-333333333333');

-- 7. SEED NOTES
INSERT INTO public.notes (title, content, created_at) VALUES
('Q3 Product Roadmap Review', 'Finalize design tokens and user onboarding experience in Supabase CRM.', NOW());

-- 8. SEED EMAILS CLIENT
INSERT INTO public.emails (folder, sender, email, recipient, subject, snippet, body, is_read, created_at) VALUES
('inbox', 'Sarah Connor', 'sarah@acme.org', 'admin@gmail.com', 'Product Design Partnership Proposal', 'Hello team, we are excited to expand our Web Design contract...', 'Hello team,\n\nWe are excited to expand our Web Design contract with Product Design...', FALSE, NOW());

-- 9. SEED CALENDARS SCHEDULING
INSERT INTO public.calendars (title, day_of_month, event_date, team, time_range, event_type) VALUES
('Design System Sprint & Component Review', 8, '2026-08-08', 'Design Teams', '10:00 AM - 11:30 AM', 'Meeting');

-- 10. SEED NOTIFICATIONS FEED
INSERT INTO public.notifications (type, title, message, is_read, target_email, created_at) VALUES
('company', 'Highlighted Company Updated', 'Product design selected as Featured Company ($56,123k Rev).', FALSE, 'admin@gmail.com', NOW());

SELECT 'CRM Database successfully populated with 1:1 target dashboard metrics.' AS status;
