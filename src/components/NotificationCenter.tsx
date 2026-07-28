import { useEffect, useState, useCallback } from 'react';
import { Bell, X, CheckCircle2, Sparkles, Zap, Info, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppNotification {
  id: string;
  title: string;
  type: 'success' | 'info' | 'warning';
  created_at: string;
  read: boolean;
  source: 'app';
}

interface CreditLog {
  id: string;
  user_id: string;
  action: string;
  amount: number;
  created_at: string;
}

interface MergedNotification {
  id: string;
  title: string;
  amount: number | null;
  type: 'positive' | 'negative' | 'system';
  created_at: string;
  read: boolean;
  source: 'credit' | 'app';
}

export interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LS_KEY = 'docuspec_notifications';

// ---------------------------------------------------------------------------
// Helper: addNotification (exported)
// ---------------------------------------------------------------------------

/**
 * Save an app-level notification to localStorage so it can be displayed in
 * the Notification Center the next time the panel is opened.
 */
export function addNotification(
  title: string,
  type: 'success' | 'info' | 'warning',
): void {
  try {
    const existing: AppNotification[] = JSON.parse(
      localStorage.getItem(LS_KEY) ?? '[]',
    );
    const newNotif: AppNotification = {
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      type,
      created_at: new Date().toISOString(),
      read: false,
      source: 'app',
    };
    // Keep latest 50 app-level notifications
    const updated = [newNotif, ...existing].slice(0, 50);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  } catch {
    // Silently ignore localStorage errors
  }
}

// ---------------------------------------------------------------------------
// Helper: relative time (Indonesian labels)
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Helper: merge credit logs + app notifications, sort by date desc
// ---------------------------------------------------------------------------

function buildMerged(
  creditLogs: CreditLog[],
  appNotifs: AppNotification[],
): MergedNotification[] {
  const fromCredits: MergedNotification[] = creditLogs.map((log) => ({
    id: `credit-${log.id}`,
    title: log.action,
    amount: log.amount,
    type: log.amount > 0 ? 'positive' : 'negative',
    created_at: log.created_at,
    read: false,
    source: 'credit',
  }));

  const fromApp: MergedNotification[] = appNotifs.map((n) => ({
    id: n.id,
    title: n.title,
    amount: null,
    type: 'system' as const,
    created_at: n.created_at,
    read: n.read,
    source: 'app' as const,
  }));

  return [...fromCredits, ...fromApp].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

// ---------------------------------------------------------------------------
// Sub-component: NotificationIcon
// ---------------------------------------------------------------------------

function NotificationIcon({ type }: { type: MergedNotification['type'] }) {
  if (type === 'positive') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
        <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
      </span>
    );
  }
  if (type === 'negative') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
        <Zap className="h-4 w-4 text-[#B11226] dark:text-red-400" />
      </span>
    );
  }
  // system
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: AmountBadge
// ---------------------------------------------------------------------------

function AmountBadge({ amount }: { amount: number | null }) {
  if (amount === null) return null;
  const positive = amount > 0;
  return (
    <span
      className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
        positive
          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
          : 'bg-red-100 text-[#B11226] dark:bg-red-900/40 dark:text-red-300'
      }`}
    >
      {positive ? '+' : ''}{amount} Poin
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: NotificationItem
// ---------------------------------------------------------------------------

interface NotificationItemProps {
  notif: MergedNotification;
}

function NotificationItem({ notif }: NotificationItemProps) {
  return (
    <li className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
      <NotificationIcon type={notif.type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
            {notif.title}
          </p>
          <AmountBadge amount={notif.amount} />
        </div>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          {relativeTime(notif.created_at)}
        </p>
      </div>
      {!notif.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#B11226]" />
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main component: NotificationCenter
// ---------------------------------------------------------------------------

export default function NotificationCenter({
  isOpen,
  onClose,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<MergedNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ------------------------------------------------------------------
  // Fetch data when panel opens
  // ------------------------------------------------------------------

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let creditLogs: CreditLog[] = [];

      if (user) {
        const { data, error } = await supabase
          .from('credit_logs')
          .select('id, user_id, action, amount, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          creditLogs = data as CreditLog[];
        }
      }

      // Merge with localStorage
      const appNotifs: AppNotification[] = JSON.parse(
        localStorage.getItem(LS_KEY) ?? '[]',
      );

      const merged = buildMerged(creditLogs, appNotifs);
      setNotifications(merged);
      setUnreadCount(merged.filter((n) => !n.read).length);
    } catch {
      // On error, still try to show localStorage notifications
      const appNotifs: AppNotification[] = JSON.parse(
        localStorage.getItem(LS_KEY) ?? '[]',
      );
      const merged = buildMerged([], appNotifs);
      setNotifications(merged);
      setUnreadCount(merged.filter((n) => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // ------------------------------------------------------------------
  // Mark all as read
  // ------------------------------------------------------------------

  const markAllRead = useCallback(() => {
    // Update localStorage app notifications
    try {
      const appNotifs: AppNotification[] = JSON.parse(
        localStorage.getItem(LS_KEY) ?? '[]',
      );
      const updated = appNotifs.map((n) => ({ ...n, read: true }));
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // ------------------------------------------------------------------
  // Keyboard: close on Escape
  // ------------------------------------------------------------------

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Pusat Notifikasi"
        className={`fixed right-0 top-0 z-50 flex h-full w-[380px] max-w-full flex-col bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#B11226]" />
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Pusat Notifikasi
            </h2>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#B11226] px-1.5 text-[11px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup panel notifikasi"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mark all read */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="shrink-0 flex justify-end border-b border-gray-100 dark:border-gray-800 px-4 py-2">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-medium text-[#B11226] hover:opacity-80 transition-opacity"
            >
              <Check className="h-3.5 w-3.5" />
              Tandai semua dibaca
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </li>
              ))}
            </ul>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Bell className="h-7 w-7 text-gray-400" />
              </span>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Belum ada notifikasi
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Aktivitas kredit dan informasi penting akan muncul di sini.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notif) => (
                <NotificationItem key={notif.id} notif={notif} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Menampilkan 20 aktivitas terbaru
          </p>
        </div>
      </aside>
    </>
  );
}
