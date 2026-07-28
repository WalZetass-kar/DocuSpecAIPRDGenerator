import React from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Edit2, CheckCircle2, AlertCircle, RefreshCw, Users, Settings, Wallet, CreditCard, Save, Receipt, Check, X, Upload, Trash2 } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  credits: number;
  subscription_plan: string;
}

interface Transaction {
  id: string;
  user_id: string;
  user_email: string;
  plan_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'users' | 'settings' | 'transactions'>('users');

  // Users State
  const [profiles, setProfiles] = React.useState<UserProfile[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  const [editRole, setEditRole] = React.useState('');
  const [editCredits, setEditCredits] = React.useState(0);
  const [editPlan, setEditPlan] = React.useState('');

  // Toast Notification State
  const [toast, setToast] = React.useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Settings State (Harga & Pembayaran) - using localStorage as mock DB
  const [pricing, setPricing] = React.useState(() => {
    const saved = localStorage.getItem('admin_pricing');
    return saved ? JSON.parse(saved) : {
      pro: { price: 50000, credits: 500 },
      enterprise: { price: 150000, credits: 2000 }
    };
  });
  
  const [payments, setPayments] = React.useState(() => {
    const saved = localStorage.getItem('admin_payments');
    return saved ? JSON.parse(saved) : {
      whatsapp: '6281234567890',
      qrisUrl: '',
      dana: '08123456789 (a.n Admin)',
      gopay: '08123456789 (a.n Admin)',
      bca: '1234567890 (a.n Admin)'
    };
  });

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (e.g. limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran gambar terlalu besar! Maksimal 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPayments({ ...payments, qrisUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (activeTab === 'users') {
      fetchProfiles();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab]);

  const handleUpdateTransaction = async (t: Transaction, newStatus: 'approved' | 'rejected') => {
    setProcessingId(t.id);

    // Optimistic update — langsung ubah status di UI
    setTransactions(prev => prev.map(tx => tx.id === t.id ? { ...tx, status: newStatus } : tx));

    // 1. Update transaction status di DB
    const { error } = await supabase
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', t.id);
      
    if (error) {
      // Rollback kalau gagal
      setTransactions(prev => prev.map(tx => tx.id === t.id ? { ...tx, status: 'pending' } : tx));
      showToast('Gagal update status: ' + error.message, 'error');
      setProcessingId(null);
      return;
    } 
    
    // 2. If approved, update the user's profile automatically
    if (newStatus === 'approved') {
      const planCredits = t.plan_name === 'enterprise' ? pricing.enterprise.credits : pricing.pro.credits;
      
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', t.user_id)
        .single();
        
      const currentCredits = userProfile?.credits || 0;
      
      await supabase
        .from('profiles')
        .update({ 
          subscription_plan: t.plan_name === 'enterprise' ? 'Enterprise' : 'Pro',
          credits: currentCredits + planCredits
        })
        .eq('id', t.user_id);
        
      await supabase
        .from('credit_logs')
        .insert({
          user_id: t.user_id,
          action: `Top Up (Tagihan: ${t.id})`,
          amount: planCredits
        });

      showToast(`✅ Transaksi disetujui! +${planCredits} poin dikirim ke ${t.user_email}`);
    } else {
      showToast(`❌ Transaksi ditolak.`, 'error');
    }

    setProcessingId(null);
  };

  const handleEditClick = (p: UserProfile) => {
    setEditingId(p.id);
    setEditRole(p.role || 'User');
    setEditCredits(p.credits || 0);
    setEditPlan(p.subscription_plan || 'Free');
  };

  const handleSaveUser = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        role: editRole,
        credits: editCredits,
        subscription_plan: editPlan
      })
      .eq('id', id);

    if (error) {
      showToast('Gagal update: ' + error.message, 'error');
    } else {
      setEditingId(null);
      showToast('Data pengguna berhasil diperbarui!');
      fetchProfiles(); // Refresh
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user ${name}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: id });
    if (error) {
      showToast('Gagal menghapus user: ' + error.message, 'error');
    } else {
      showToast('User berhasil dihapus!');
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };


  const handleSaveSettings = () => {
    localStorage.setItem('admin_pricing', JSON.stringify(pricing));
    localStorage.setItem('admin_payments', JSON.stringify(payments));
    showToast('Pengaturan Harga & Pembayaran berhasil disimpan!');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 relative">
      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top-4 fade-in duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
            <ShieldCheck className="w-7 h-7 text-[#B11226]" />
            Panel Developer
          </h1>
          <p className="text-gray-500 mt-1 text-xs font-medium">
            Kelola pengguna, harga paket langganan, dan rute pembayaran.
          </p>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={fetchProfiles}
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors shadow-sm cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-0">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'users' ? 'border-[#B11226] text-[#B11226]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Users className="w-4 h-4" /> Kelola Pengguna
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'transactions' ? 'border-[#B11226] text-[#B11226]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Receipt className="w-4 h-4" /> Konfirmasi Pembayaran
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'settings' ? 'border-[#B11226] text-[#B11226]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Settings className="w-4 h-4" /> Harga & Rekening
        </button>
      </div>

      {error && activeTab === 'users' && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-100">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4">Pengguna</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Langganan</th>
                  <th className="p-4">Poin (Credits)</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 font-bold">{p.name || 'User Tanpa Nama'}</td>
                    <td className="p-4 text-gray-500">{p.email}</td>
                    
                    {editingId === p.id ? (
                      <>
                        <td className="p-4">
                          <select 
                            value={editRole} 
                            onChange={e => setEditRole(e.target.value)}
                            className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226]"
                          >
                            <option>User</option>
                            <option>Product Manager</option>
                            <option>Developer</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select 
                            value={editPlan} 
                            onChange={e => setEditPlan(e.target.value)}
                            className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226]"
                          >
                            <option>Free</option>
                            <option>Pro</option>
                            <option>Enterprise</option>
                            <option>Lifetime Pro</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <input 
                            type="number" 
                            value={editCredits} 
                            onChange={e => setEditCredits(parseInt(e.target.value))}
                            className="w-24 px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226]"
                          />
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleSaveUser(p.id)}
                            className="px-3 py-1.5 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Simpan
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.role === 'Developer' ? 'bg-[#B11226]/10 text-[#B11226]' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {p.role || 'User'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.subscription_plan?.includes('Pro') ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {p.subscription_plan || 'Free'}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-gray-800 dark:text-gray-200">
                          {p.credits ?? 10}
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(p)}
                            className="p-2 text-gray-400 hover:text-[#B11226] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(p.id, p.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                
                {profiles.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500 font-medium">
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'transactions' ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Paket</th>
                  <th className="p-4">Tagihan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="p-4 whitespace-nowrap">{new Date(t.created_at).toLocaleString('id-ID')}</td>
                    <td className="p-4 font-bold">{t.user_email}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-[10px] font-bold">
                        {t.plan_name.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#B11226]">Rp {t.amount.toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : t.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {t.status === 'pending' ? 'Menunggu' : t.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {processingId === t.id ? (
                        // Loading spinner saat sedang diproses
                        <div className="flex items-center justify-end gap-1.5 text-gray-400">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-[10px] font-bold">Memproses...</span>
                        </div>
                      ) : t.status === 'pending' ? (
                        // Tombol Setujui & Tolak (hanya muncul saat pending)
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateTransaction(t, 'approved')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer text-[11px] font-bold border border-emerald-200 dark:border-emerald-900/40"
                            title="Setujui"
                          >
                            <Check className="w-3.5 h-3.5" /> Setujui
                          </button>
                          <button
                            onClick={() => handleUpdateTransaction(t, 'rejected')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer text-[11px] font-bold border border-red-200 dark:border-red-900/40"
                            title="Tolak"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      ) : t.status === 'approved' ? (
                        // Status: Selesai / Disetujui
                        <div className="flex items-center justify-end gap-1.5 text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-300">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[11px] font-black">Selesai</span>
                        </div>
                      ) : (
                        // Status: Ditolak
                        <div className="flex items-center justify-end gap-1.5 text-red-500 dark:text-red-400 animate-in fade-in duration-300">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[11px] font-black">Ditolak</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                
                {transactions.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500 font-medium">
                      Belum ada konfirmasi pembayaran masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* PRICING SETTINGS */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
              <CreditCard className="w-5 h-5 text-[#B11226]" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Harga Langganan</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Paket Pro</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Harga (Rp)</label>
                    <input 
                      type="number" 
                      value={pricing.pro.price}
                      onChange={e => setPricing({...pricing, pro: {...pricing.pro, price: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226] dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Poin yang didapat</label>
                    <input 
                      type="number" 
                      value={pricing.pro.credits}
                      onChange={e => setPricing({...pricing, pro: {...pricing.pro, credits: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226] dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Paket Enterprise</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Harga (Rp)</label>
                    <input 
                      type="number" 
                      value={pricing.enterprise.price}
                      onChange={e => setPricing({...pricing, enterprise: {...pricing.enterprise, price: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226] dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Poin yang didapat</label>
                    <input 
                      type="number" 
                      value={pricing.enterprise.credits}
                      onChange={e => setPricing({...pricing, enterprise: {...pricing.enterprise, credits: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226] dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT METHODS */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Metode Pembayaran</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">No. WhatsApp Admin (awali dengan 62)</label>
                  <input 
                    type="text" 
                    value={payments.whatsapp}
                    onChange={(e) => setPayments({...payments, whatsapp: e.target.value})}
                    placeholder="Contoh: 6281234567890"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 outline-none focus:border-[#B11226] transition-colors text-sm"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Digunakan untuk direct chat konfirmasi pembayaran oleh pengguna.</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Upload Gambar QRIS (Opsional)</label>
                  <div className="flex items-center gap-4">
                    {payments.qrisUrl && (
                      <div className="relative">
                        <img src={payments.qrisUrl} alt="QRIS" className="w-16 h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white" />
                        <button 
                          onClick={() => setPayments({...payments, qrisUrl: ''})}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none hover:border-[#B11226] transition-colors cursor-pointer text-center text-gray-500 font-bold border-dashed flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      {payments.qrisUrl ? 'Ganti QRIS' : 'Pilih Gambar QRIS'}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleQrisUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">Maksimal 2MB. Gambar akan otomatis tersimpan dalam browser saat ditekan tombol Simpan.</p>
                </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">DANA</label>
                <input 
                  type="text" 
                  value={payments.dana}
                  onChange={e => setPayments({...payments, dana: e.target.value})}
                  placeholder="081xxx (a.n Nama)"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226] dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">GoPay / ShopeePay</label>
                <input 
                  type="text" 
                  value={payments.gopay}
                  onChange={e => setPayments({...payments, gopay: e.target.value})}
                  placeholder="081xxx (a.n Nama)"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226] dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Transfer Bank (BCA/Mandiri/dll)</label>
                <input 
                  type="text" 
                  value={payments.bca}
                  onChange={e => setPayments({...payments, bca: e.target.value})}
                  placeholder="BCA 12345 (a.n Nama)"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-[#B11226] focus:ring-1 focus:ring-[#B11226] dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={handleSaveSettings}
                className="w-full py-3 bg-[#B11226] text-white font-bold rounded-xl hover:bg-[#900E1F] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan Semua Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
