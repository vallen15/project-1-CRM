-- ================================================================
-- SUPABASE MIGRATION SCRIPT: USER PREFERENCES TABLE & RLS
-- Run this in Supabase SQL Editor: https://app.supabase.com
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    active_tab VARCHAR(100) DEFAULT 'dashboard',
    sidebar_collapsed BOOLEAN DEFAULT FALSE,
    email_folder VARCHAR(50) DEFAULT 'inbox',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy (User can read only their own preferences)
CREATE POLICY "Users can view own preferences" 
    ON public.user_preferences FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. INSERT Policy (User can insert only their own preferences)
CREATE POLICY "Users can insert own preferences" 
    ON public.user_preferences FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE Policy (User can update only their own preferences)
CREATE POLICY "Users can update own preferences" 
    ON public.user_preferences FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 4. DELETE Policy (User can delete only their own preferences)
CREATE POLICY "Users can delete own preferences" 
    ON public.user_preferences FOR DELETE 
    USING (auth.uid() = user_id);

-- Output Confirmation
SELECT 'user_preferences table and RLS policies created successfully.' AS status;
