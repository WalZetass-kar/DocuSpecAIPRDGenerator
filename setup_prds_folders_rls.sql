-- SQL Script: RLS Policies untuk tabel prds dan folders
-- Jalankan ini di Supabase Dashboard -> SQL Editor -> New Query -> Paste -> Run

-- ============================================
-- 1. TABEL PRDS
-- ============================================

-- Aktifkan RLS
ALTER TABLE public.prds ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada (agar bisa re-run script ini tanpa error)
DROP POLICY IF EXISTS "Users can view their own PRDs" ON public.prds;
DROP POLICY IF EXISTS "Users can insert their own PRDs" ON public.prds;
DROP POLICY IF EXISTS "Users can update their own PRDs" ON public.prds;
DROP POLICY IF EXISTS "Users can delete their own PRDs" ON public.prds;
DROP POLICY IF EXISTS "Developers can view all PRDs" ON public.prds;

-- Policy: User hanya bisa melihat PRD milik sendiri
CREATE POLICY "Users can view their own PRDs"
ON public.prds
FOR SELECT
USING ( auth.uid() = user_id );

-- Policy: User bisa insert PRD baru untuk diri sendiri
CREATE POLICY "Users can insert their own PRDs"
ON public.prds
FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- Policy: User bisa update PRD milik sendiri
CREATE POLICY "Users can update their own PRDs"
ON public.prds
FOR UPDATE
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- Policy: User bisa delete PRD milik sendiri
CREATE POLICY "Users can delete their own PRDs"
ON public.prds
FOR DELETE
USING ( auth.uid() = user_id );

-- Policy: Developer/Admin bisa melihat semua PRD
CREATE POLICY "Developers can view all PRDs"
ON public.prds
FOR SELECT
USING ( public.is_developer() );


-- ============================================
-- 2. TABEL FOLDERS
-- ============================================

-- Aktifkan RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can insert their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;

-- Policy: User hanya bisa melihat folder milik sendiri
CREATE POLICY "Users can view their own folders"
ON public.folders
FOR SELECT
USING ( auth.uid() = user_id );

-- Policy: User bisa insert folder baru
CREATE POLICY "Users can insert their own folders"
ON public.folders
FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- Policy: User bisa update folder milik sendiri
CREATE POLICY "Users can update their own folders"
ON public.folders
FOR UPDATE
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );

-- Policy: User bisa delete folder milik sendiri
CREATE POLICY "Users can delete their own folders"
ON public.folders
FOR DELETE
USING ( auth.uid() = user_id );
