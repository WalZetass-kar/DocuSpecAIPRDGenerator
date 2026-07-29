-- ====================================================================
-- DocuSpec AI Software Documentation Platform - Full Supabase DDL Schema
-- Idempotent & Safe Re-run Script for Supabase SQL Editor
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES (Safe Creation)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'pm', 'architect', 'developer', 'qa', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prd_status AS ENUM ('draft', 'review', 'approved', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_category AS ENUM (
      'Marketplace', 'Education', 'Healthcare', 'Fintech', 'ERP',
      'CRM', 'POS', 'Inventory', 'School', 'University',
      'E-Commerce', 'Food Delivery', 'Hotel', 'Travel', 'IoT',
      'AI SaaS', 'Chat App', 'Social Media', 'Portfolio', 'Company Profile'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'pm',
  credits INT DEFAULT 50 CHECK (credits >= 0),
  workspace_name TEXT DEFAULT 'Personal Workspace',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FOLDERS TABLE
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#B11226',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRDS TABLE (PRD, SRS, SDD, ERD, API Specs JSONB payload)
CREATE TABLE IF NOT EXISTS public.prds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category project_category DEFAULT 'AI SaaS',
  platform TEXT DEFAULT 'Web & Mobile',
  complexity TEXT DEFAULT 'High',
  status prd_status DEFAULT 'draft',
  version TEXT DEFAULT '1.0.0',
  is_favorite BOOLEAN DEFAULT FALSE,
  in_trash BOOLEAN DEFAULT FALSE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  github_repo_owner TEXT,
  github_repo_name TEXT,
  github_branch TEXT DEFAULT 'main',
  last_pushed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prd_id UUID NOT NULL REFERENCES public.prds(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  section_id TEXT NOT NULL,
  content TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.credit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_timestamp ON public.profiles;
CREATE TRIGGER trigger_update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_folders_timestamp ON public.folders;
CREATE TRIGGER trigger_update_folders_timestamp
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_prds_timestamp ON public.prds;
CREATE TRIGGER trigger_update_prds_timestamp
  BEFORE UPDATE ON public.prds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- AUTOMATIC NEW USER PROFILE CREATION TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, credits, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    50,
    'pm'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & IDEMPOTENT POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Folders RLS
DROP POLICY IF EXISTS "Users can CRUD their own folders" ON public.folders;
CREATE POLICY "Users can CRUD their own folders"
  ON public.folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PRDs RLS
DROP POLICY IF EXISTS "Users can CRUD their own PRDs" ON public.prds;
CREATE POLICY "Users can CRUD their own PRDs"
  ON public.prds FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comments RLS
DROP POLICY IF EXISTS "Users can view comments on PRDs they own or collaborate" ON public.comments;
CREATE POLICY "Users can view comments on PRDs they own or collaborate"
  ON public.comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prds WHERE id = comments.prd_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Credit Logs RLS
DROP POLICY IF EXISTS "Users can view their own credit logs" ON public.credit_logs;
CREATE POLICY "Users can view their own credit logs"
  ON public.credit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ====================================================================
-- REALTIME SUBSCRIPTIONS (Safe Add)
-- ====================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.prds;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
