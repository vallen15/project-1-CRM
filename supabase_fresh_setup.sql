-- CRM Dashboard: fresh Supabase setup
-- WARNING: This resets PUBLIC CRM tables and their sample data.
-- It does NOT delete accounts in auth.users.

create extension if not exists pgcrypto;


drop table if exists public.user_preferences cascade;
drop table if exists public.notifications cascade;
drop table if exists public.calendars cascade;
drop table if exists public.emails cascade;
drop table if exists public.notes cascade;
drop table if exists public.tasks cascade;
drop table if exists public.contacts cascade;
drop table if exists public.transactions cascade;
drop table if exists public.revenues cascade;
drop table if exists public.expenses cascade;
drop table if exists public.expense_categories cascade;
drop table if exists public.companies cascade;
drop table if exists public.integrations cascade;
drop table if exists public.settings cascade;
drop table if exists public.profiles cascade;
drop table if exists public.teams cascade;
drop table if exists public.departments cascade;

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) unique not null,
  code varchar(50) unique not null,
  badge varchar(8) not null default 'M',
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) unique not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name varchar(255) not null,
  email varchar(255) unique not null,
  role varchar(50) not null default 'user' check (role in ('admin', 'user')),
  team_id uuid references public.teams(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  avatar_url text,
  phone varchar(50),
  job_title varchar(100) not null default 'Team Member',
  timezone varchar(100) not null default 'Asia/Jakarta',
  language varchar(50) not null default 'English',
  theme varchar(50) not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  category varchar(100) not null default 'General',
  total_transactions varchar(50) not null default '1,000',
  status varchar(50) not null default 'Active',
  is_featured boolean not null default false,
  logo_bg varchar(80) not null default 'bg-black',
  logo_url text,
  website varchar(255),
  email varchar(255),
  phone varchar(50),
  address text,
  team_id uuid references public.teams(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  name varchar(255) not null,
  email varchar(255) not null,
  phone varchar(50),
  position varchar(100) default 'Member',
  company_name varchar(255),
  address text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  description text,
  company_id uuid references public.companies(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  team varchar(100) not null default 'Marketing Team''s',
  priority varchar(50) not null default 'Medium',
  status varchar(50) not null default 'Todo',
  progress integer not null default 0 check (progress between 0 and 100),
  start_date date default current_date,
  due_date date default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  title varchar(255) not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type varchar(50) not null default 'system',
  title varchar(255) not null,
  message text not null,
  target_email varchar(255),
  reference_type varchar(50),
  reference_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.emails (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete set null,
  receiver_id uuid references public.profiles(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete cascade,
  folder varchar(50) not null default 'inbox',
  sender varchar(255) not null,
  email varchar(255) not null,
  recipient varchar(255),
  subject varchar(255) not null,
  snippet text,
  body text,
  starred boolean not null default false,
  is_read boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendars (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  title varchar(255) not null,
  description text,
  day_of_month integer not null default 1 check (day_of_month between 1 and 31),
  event_date date default current_date,
  team varchar(100) not null default 'Marketing Team''s',
  time_range varchar(100) not null default '10:00 AM - 11:00 AM',
  event_type varchar(50) not null default 'Meeting',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) unique not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  category_id uuid references public.expense_categories(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  amount numeric(14,2) not null default 0,
  description text,
  expense_date date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revenues (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  amount numeric(14,2) not null default 0,
  period varchar(50) not null,
  year integer not null default extract(year from current_date),
  transaction_date date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  title varchar(255) not null,
  amount numeric(14,2) not null default 0,
  type varchar(50) not null default 'Revenue',
  transaction_date date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) unique not null,
  category varchar(100) not null default 'Productivity',
  description text,
  is_connected boolean not null default false,
  icon varchar(100),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.settings (
  key varchar(100) primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_tab varchar(100) not null default 'dashboard',
  sidebar_collapsed boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Recreate profiles for any Auth accounts that existed before this reset.
insert into public.profiles (user_id, full_name, email, role, job_title)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1)),
  email,
  'user',
  'Team Member'
from auth.users
on conflict (user_id) do update
set full_name = excluded.full_name, email = excluded.email, updated_at = now();

-- The current frontend accesses most CRM resources directly. These policies keep
-- those resources usable; user_preferences remains private to its owner.
alter table public.departments enable row level security;
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.notifications enable row level security;
alter table public.emails enable row level security;
alter table public.calendars enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.revenues enable row level security;
alter table public.transactions enable row level security;
alter table public.integrations enable row level security;
alter table public.settings enable row level security;
alter table public.user_preferences enable row level security;

create policy "public departments" on public.departments for all using (true) with check (true);
create policy "public teams" on public.teams for all using (true) with check (true);
create policy "public profiles" on public.profiles for all using (true) with check (true);
create policy "public companies" on public.companies for all using (true) with check (true);
create policy "public contacts" on public.contacts for all using (true) with check (true);
create policy "public tasks" on public.tasks for all using (true) with check (true);
create policy "public notes" on public.notes for all using (true) with check (true);
create policy "public notifications" on public.notifications for all using (true) with check (true);
create policy "public emails" on public.emails for all using (true) with check (true);
create policy "public calendars" on public.calendars for all using (true) with check (true);
create policy "public expense categories" on public.expense_categories for all using (true) with check (true);
create policy "public expenses" on public.expenses for all using (true) with check (true);
create policy "public revenues" on public.revenues for all using (true) with check (true);
create policy "public transactions" on public.transactions for all using (true) with check (true);
create policy "public integrations" on public.integrations for all using (true) with check (true);
create policy "public settings" on public.settings for all using (true) with check (true);
create policy "own user preferences" on public.user_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.departments (id, name, code, badge) values
  ('d1111111-1111-1111-1111-111111111111', 'Marketing', 'MKT', 'M'),
  ('d2222222-2222-2222-2222-222222222222', 'Design', 'DSG', 'D'),
  ('d3333333-3333-3333-3333-333333333333', 'Production', 'PRD', 'P')
on conflict do nothing;

insert into public.teams (id, name, description) values
  ('a1111111-1111-1111-1111-111111111111', 'Marketing', 'Digital marketing and growth'),
  ('a2222222-2222-2222-2222-222222222222', 'Design', 'UI/UX and product design'),
  ('a3333333-3333-3333-3333-333333333333', 'Production', 'Infrastructure and operations'),
  ('a4444444-4444-4444-4444-444444444444', 'Development', 'Full-stack engineering'),
  ('a5555555-5555-5555-5555-555555555555', 'Operations', 'Business operations')
on conflict do nothing;

insert into public.expense_categories (id, name, description) values
  ('e1111111-1111-1111-1111-111111111111', 'Production', 'Production costs'),
  ('e2222222-2222-2222-2222-222222222222', 'Marketing', 'Marketing costs'),
  ('e3333333-3333-3333-3333-333333333333', 'Operational', 'Operational costs'),
  ('e4444444-4444-4444-4444-444444444444', 'Design', 'Design costs')
on conflict do nothing;

insert into public.companies (name, category, total_transactions, status, is_featured, logo_bg, team_id) values
  ('Product Design', 'Web Design', '1,641', 'Featured', true, 'bg-[#d94e34]', 'a2222222-2222-2222-2222-222222222222'),
  ('Acme Corp', 'Enterprise Software', '892', 'Active', false, 'bg-black', 'a1111111-1111-1111-1111-111111111111'),
  ('TechLabs Inc', 'Cloud Infrastructure', '540', 'Active', false, 'bg-gray-700', 'a3333333-3333-3333-3333-333333333333');

insert into public.tasks (title, team, status, due_date) values
  ('Design Landing Page V2', 'Design', 'Completed', current_date - 1),
  ('Marketing Campaign Setup', 'Marketing', 'In Progress', current_date + 2),
  ('Server Infrastructure Maintenance', 'Production', 'Todo', current_date + 3);

insert into public.notes (title, content) values
  ('Design Sprint Feedback', 'Clean dark accents and high contrast text preferred.'),
  ('Q3 Budget Allocation', 'Increase the design budget for new brand assets.');

insert into public.settings (key, value) values
  ('app_info', '{"title":"LOGO CRM Dashboard","version":"2.0"}'::jsonb),
  ('theme_config', '{"primary":"#000000","mode":"light"}'::jsonb);
