import React from 'react';
import { History, X, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditLogsModal: React.FC<CreditLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('credit_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setLogs(data || []);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Poin AI</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Catatan penggunaan dan penambahan Poin AI Anda.</p>
            </div>
          </div>
        </div>

        <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-sm">Memuat riwayat...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <History className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm font-medium">Belum ada riwayat poin.</p>
              <p className="text-xs mt-1">Mulai gunakan fitur AI untuk melihat riwayat Anda di sini.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{log.action}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 font-black text-sm ${log.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {log.amount > 0 ? '+' : ''}{log.amount} Poin
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
