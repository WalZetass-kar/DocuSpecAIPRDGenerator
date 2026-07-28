-- SQL Script untuk mengatasi masalah RLS (Row Level Security) pada Dashboard Admin / Developer.
-- Buka Supabase Dashboard Anda -> SQL Editor -> Buat query baru (New Query) -> Paste kode di bawah ini lalu tekan Run.

-- 1. Buat fungsi bantuan untuk mengecek apakah user yang sedang login adalah 'Developer' atau 'Admin'
-- Ini menggunakan SECURITY DEFINER agar dapat melewati RLS pada saat pengecekan role
CREATE OR REPLACE FUNCTION public.is_developer()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND (role = 'Developer' OR role = 'Admin')
  );
$$;

-- 2. Kebijakan untuk tabel TRANSACTIONS
-- Pastikan tabel transactions memiliki RLS yang aktif
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Izinkan admin melihat semua transaksi (jika belum ada)
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING ( public.is_developer() );

-- Izinkan admin memperbarui (UPDATE) semua transaksi
CREATE POLICY "Admins can update all transactions"
ON public.transactions
FOR UPDATE
USING ( public.is_developer() )
WITH CHECK ( public.is_developer() );


-- 3. Kebijakan untuk tabel PROFILES
-- Pastikan tabel profiles memiliki RLS yang aktif
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Izinkan admin memperbarui profile pengguna lain (misalnya menambah poin atau mengubah paket)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING ( public.is_developer() )
WITH CHECK ( public.is_developer() );


-- 4. Kebijakan untuk tabel CREDIT_LOGS
ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

-- Izinkan admin memasukkan (INSERT) log kredit untuk semua pengguna
CREATE POLICY "Admins can insert credit logs for all users"
ON public.credit_logs
FOR INSERT
WITH CHECK ( public.is_developer() );
