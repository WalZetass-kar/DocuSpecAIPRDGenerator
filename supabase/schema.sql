-- ====================================================================
-- DocuSpec AI Software Documentation Platform - Full Supabase DDL Schema
-- Production Ready with RLS (Row Level Security), Triggers, & Realtime
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
CREATE TYPE user_role AS ENUM ('admin', 'pm', 'architect', 'developer', 'qa', 'viewer');
CREATE TYPE prd_status AS ENUM ('draft', 'review', 'approved', 'archived');
CREATE TYPE project_category AS ENUM (
  'Marketplace', 'Education', 'Healthcare', 'Fintech', 'ERP',
  'CRM', 'POS', 'Inventory', 'School', 'University',
  'E-Commerce', 'Food Delivery', 'Hotel', 'Travel', 'IoT',
  'AI SaaS', 'Chat App', 'Social Media', 'Portfolio', 'Company Profile'
);

-- 3. PROFILES TABLE (User Accounts & Credits)
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

-- 4. FOLDERS TABLE (Project Categories & Workspaces)
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#B11226',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRDS TABLE (Main Document Storage for PRD, SRS, SDD, ERD, API Specs)
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
  
  -- Structured Document Payload (JSONB stores PRD, SRS, SDD, ERD, API Specs)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Integration Metadata
  github_repo_owner TEXT,
  github_repo_name TEXT,
  github_branch TEXT DEFAULT 'main',
  last_pushed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMENTS TABLE (Multi-User Collaboration & Real-Time Inline Feedback)
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

-- 7. CREDIT LOGS TABLE (AI Usage Audit Trail)
CREATE TABLE IF NOT EXISTS public.credit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  action_type TEXT NOT NULL, -- e.g. 'generate_prd', 'ai_refine', 'auto_fix', 'topup'
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

CREATE TRIGGER trigger_update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_folders_timestamp
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_prds_timestamp
  BEFORE UPDATE ON public.prds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- AUTOMATIC NEW USER PROFILE CREATION TRIGGER (Auth Sync)
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Folders RLS
CREATE POLICY "Users can CRUD their own folders"
  ON public.folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PRDs RLS
CREATE POLICY "Users can CRUD their own PRDs"
  ON public.prds FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comments RLS
CREATE POLICY "Users can view comments on PRDs they own or collaborate"
  ON public.comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prds WHERE id = comments.prd_id AND user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Credit Logs RLS
CREATE POLICY "Users can view their own credit logs"
  ON public.credit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ====================================================================
-- REALTIME SUBSCRIPTIONS ENABLING
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
