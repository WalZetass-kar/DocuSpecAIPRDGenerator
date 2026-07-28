import React from 'react';
import { Crown, X, Check, ArrowRight, Wallet, QrCode, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = React.useState<'plans' | 'payment' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = React.useState<'pro' | 'enterprise'>('pro');

  const [pricing, setPricing] = React.useState({
    pro: { price: 50000, credits: 500 },
    enterprise: { price: 150000, credits: 2000 }
  });
  
  const [payments, setPayments] = React.useState({
    whatsapp: '6281234567890',
    qrisUrl: '',
    dana: '08123456789 (a.n Admin)',
    gopay: '08123456789 (a.n Admin)',
    bca: '1234567890 (a.n Admin)'
  });

  const [invoice, setInvoice] = React.useState<{id: string, date: string, email: string, amount: number, plan: string} | null>(null);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  React.useEffect(() => {
    if (isOpen) {
      setStep('plans');
      setInvoice(null);
      const savedPricing = localStorage.getItem('admin_pricing');
      if (savedPricing) setPricing(JSON.parse(savedPricing));
      
      const savedPayments = localStorage.getItem('admin_payments');
      if (savedPayments) setPayments(JSON.parse(savedPayments));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'plans' ? (
          <>
            <div className="p-8 text-center bg-gray-950 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#B11226] rounded-full blur-3xl opacity-50" />
              <div className="w-12 h-12 rounded-2xl bg-[#B11226] text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Tingkatkan Akun Anda</h2>
              <p className="text-gray-300 text-xs mt-1 max-w-md mx-auto">
                Beli Poin (Credits) dan aktifkan fitur premium tak terbatas.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Pro Plan Card */}
                <div
                  onClick={() => setSelectedPlan('pro')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlan === 'pro'
                      ? 'border-[#B11226] bg-red-50 dark:bg-red-950/20'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">Paket Pro</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#B11226] text-white font-bold text-[9px]">Populer</span>
                  </div>
                  <div className="text-lg font-black text-[#B11226] my-1">
                    {formatRupiah(pricing.pro.price)}
                  </div>
                  <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3">
                    Mendapat +{pricing.pro.credits} Poin AI
                  </div>
                  <ul className="space-y-1.5 mt-3 text-[11px] text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#B11226]" /> AI Generator Super Cepat</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#B11226]" /> Ekspor Markdown & PDF</li>
                  </ul>
                </div>

                {/* Enterprise Plan Card */}
                <div
                  onClick={() => setSelectedPlan('enterprise')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlan === 'enterprise'
                      ? 'border-[#B11226] bg-red-50 dark:bg-red-950/20'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">Enterprise</span>
                  </div>
                  <div className="text-lg font-black text-[#B11226] my-1">
                    {formatRupiah(pricing.enterprise.price)}
                  </div>
                  <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3">
                    Mendapat +{pricing.enterprise.credits} Poin AI
                  </div>
                  <ul className="space-y-1.5 mt-3 text-[11px] text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#B11226]" /> Segala Fitur Pro</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#B11226]" /> Prioritas Support (24/7)</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={async () => {
                  let userEmailForInvoice = 'Menunggu data...';
                  // Generate base invoice data immediately
                  const invId = 'INV-' + Math.random().toString(36).substr(2, 6).toUpperCase();
                  setInvoice({
                    id: invId,
                    date: new Date().toLocaleString('id-ID'),
                    email: userEmailForInvoice,
                    amount: pricing[selectedPlan].price,
                    plan: selectedPlan.toUpperCase()
                  });
                  setStep('payment');

                  // Fetch email in background
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    setInvoice(prev => prev ? { ...prev, email: user.email || 'user@example.com' } : null);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#B11226] hover:bg-[#900E1F] transition-colors text-white font-bold cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                Pilih Paket Ini <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : step === 'payment' ? (
          <>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <button onClick={() => setStep('plans')} className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Instruksi Pembayaran</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center justify-center">
                {/* INVOICE TICKET FOR PAYMENT STEP */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden mb-2">
                  <div className="p-4 space-y-3 pt-5">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                      <span className="text-[10px] text-gray-500 font-bold">NO. INVOICE</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{invoice?.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700 border-dashed">
                      <span className="text-[10px] text-gray-500 font-bold">AKUN (EMAIL)</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{invoice?.email}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-black">TOTAL TAGIHAN</span>
                      <span className="text-lg font-black text-[#B11226]">{formatRupiah(invoice?.amount || 0)}</span>
                    </div>
                  </div>
                  
                  {/* Ticket Status Label */}
                  <div className="bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-black text-center py-2 uppercase tracking-widest border-t border-amber-100 dark:border-amber-800 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> MENUNGGU PEMBAYARAN
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {payments.qrisUrl && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center space-y-3">
                    <QrCode className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Scan QRIS</span>
                    <img src={payments.qrisUrl} alt="QRIS" className="w-32 h-32 object-contain bg-white rounded-lg" />
                  </div>
                )}
                
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {payments.dana && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <Wallet className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-500">DANA</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{payments.dana}</div>
                      </div>
                    </div>
                  )}
                  {payments.gopay && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <Wallet className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-500">GOPAY / SHOPEEPAY</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{payments.gopay}</div>
                      </div>
                    </div>
                  )}
                  {payments.bca && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <Wallet className="w-5 h-5 text-blue-800 dark:text-blue-400" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-500">TRANSFER BANK (BCA/DLL)</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{payments.bca}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                {/* WhatsApp Konfirmasi */}
                {payments.whatsapp && (
                  <button
                    onClick={() => {
                      const amount = pricing[selectedPlan].price;
                      const invId = invoice?.id || 'INV-XXX';
                      const message = encodeURIComponent(
                        `Halo Admin DocuSpec AI! 👋\n\nSaya ingin konfirmasi pembayaran:\n` +
                        `📋 No. Invoice: *${invId}*\n` +
                        `📦 Paket: *${selectedPlan.toUpperCase()}*\n` +
                        `💰 Jumlah: *${formatRupiah(amount)}*\n` +
                        `📧 Email: *${invoice?.email || '-'}*\n\n` +
                        `Berikut saya lampirkan bukti transfernya. Mohon diverifikasi. Terima kasih! 🙏`
                      );
                      window.open(`https://wa.me/${payments.whatsapp}?text=${message}`, '_blank');
                    }}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBF5A] text-white font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Konfirmasi via WhatsApp
                  </button>
                )}

                <button
                  onClick={async () => {
                    let userEmailForInvoice = 'user@example.com';
                    let amount = pricing[selectedPlan].price;
                    
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        userEmailForInvoice = user.email || userEmailForInvoice;
                        // Insert transaction into database
                        const { error } = await supabase.from('transactions').insert({
                          user_id: user.id,
                          user_email: user.email,
                          plan_name: selectedPlan,
                          amount: amount,
                          status: 'pending'
                        });
                        
                        if (error) {
                          console.error('Insert error:', error);
                        }
                      }
                    } catch (err) {
                      console.error('Failed to submit transaction:', err);
                    }
                    setStep('success');
                  }}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Sudah Transfer, Cek Status
                </button>
                <p className="text-[10px] text-center text-gray-400">
                  Pastikan Anda sudah transfer ke rekening di atas sebelum mengecek.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 pb-10 flex flex-col items-center">
            {/* INVOICE TICKET */}
            <div className="w-full max-w-sm bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden mb-6">
              {/* Ticket Top */}
              <div className="bg-[#B11226] p-6 text-center text-white relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg tracking-wider">BUKTI KONFIRMASI</h3>
                <p className="text-[10px] text-red-200 opacity-90 mt-1">Harap simpan struk ini sebagai bukti</p>
                
                {/* Ticket perforations */}
                <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white dark:bg-gray-900" />
                  ))}
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-6 space-y-4 pt-8">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 border-dashed">
                  <span className="text-xs text-gray-500 font-bold">NO. INVOICE</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{invoice?.id}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 border-dashed">
                  <span className="text-xs text-gray-500 font-bold">TANGGAL</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{invoice?.date}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 border-dashed">
                  <span className="text-xs text-gray-500 font-bold">AKUN (EMAIL)</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{invoice?.email}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 border-dashed">
                  <span className="text-xs text-gray-500 font-bold">PAKET</span>
                  <span className="text-xs font-black text-[#B11226]">{invoice?.plan}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-black">TOTAL</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white">{formatRupiah(invoice?.amount || 0)}</span>
                </div>
              </div>
              
              {/* Ticket Status Label */}
              <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-black text-center py-2 uppercase tracking-widest border-t border-amber-200 dark:border-amber-800">
                STATUS: MENUNGGU VERIFIKASI ADMIN
              </div>
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Cetak (Print)
              </button>
              <button
                onClick={() => {
                  onClose();
                  // delay resetting so it doesn't flash before modal closes
                  setTimeout(() => setStep('plans'), 300);
                }}
                className="flex-1 py-3 bg-[#B11226] text-white font-bold rounded-xl cursor-pointer hover:bg-[#900E1F] transition-colors text-sm"
              >
                Tutup Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
