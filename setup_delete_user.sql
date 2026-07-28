-- SQL Script untuk menambahkan fitur "Hapus User" bagi Developer/Admin

-- 1. Buat fungsi RPC untuk menghapus user dari auth.users dan profiles
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS boolean AS $$
BEGIN
    -- Pastikan hanya Developer atau Admin yang bisa menghapus
    IF NOT public.is_developer() THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Developer/Admin yang bisa menghapus user.';
    END IF;

    -- Hapus profil dari tabel public.profiles
    DELETE FROM public.profiles WHERE id = target_user_id;

    -- Hapus user dari auth.users (ini akan menghapus semua referensi yang cascade ke user_id tersebut jika disetel cascade)
    DELETE FROM auth.users WHERE id = target_user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
