import React from 'react';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, UserCheck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { id: string; name: string; email: string; role: string; credits: number }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'User',
            },
          },
        });
        
        if (error) throw error;
        
        if (data.user) {
          onLoginSuccess({
            id: data.user.id,
            name: data.user.user_metadata.full_name || 'User',
            email: data.user.email || email,
            role: 'User',
            credits: 5
          });
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Fetch profile details
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role, credits')
            .eq('id', data.user.id)
            .single();

          onLoginSuccess({
            id: data.user.id,
            name: profile?.name || data.user.user_metadata.full_name || 'User',
            email: data.user.email || email,
            role: profile?.role || data.user.user_metadata.role || 'User',
            credits: profile?.credits || 0,
          });
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200  dark:border-gray-800 overflow-hidden text-xs relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Header */}
        <div className="p-8 pb-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#B11226] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#B11226]/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isRegister ? 'Buat Akun PRD AI' : 'Masuk ke Workspace PRD AI'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
            Platform Spesifikasi Produk AI Kelas Enterprise
          </p>
        </div>

        <div className="p-6 pb-2 space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-[10px] p-3 rounded-2xl border border-yellow-200 dark:border-yellow-800/50 mb-3 text-center">
            <strong>Catatan:</strong> Jika Anda baru pertama kali mendaftar, Anda dapat langsung login tanpa perlu memverifikasi email (karena mode pengembangan).
          </div>



          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="M. Ihwal Maulana"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B11226]/50 transition-all text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihwal@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B11226]/50 transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B11226]/50 transition-all text-xs"
                />
              </div>
            </div>

            {errorMsg && <p className="text-red-500 text-[10px] font-medium">{errorMsg}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm cursor-pointer text-xs"
            >
              {isLoading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk ke Aplikasi'}
            </button>
          </form>
        </div>

        {/* Footer toggle */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-gray-600 dark:text-gray-400 hover:text-[#B11226] dark:hover:text-red-400 font-semibold"
          >
            {isRegister ? 'Sudah punya akun? Masuk disini' : 'Belum punya akun? Daftar gratis'}
          </button>
        </div>
      </div>
    </div>
  );
};
