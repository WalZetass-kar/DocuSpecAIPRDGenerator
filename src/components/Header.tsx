import React from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Command,
  ChevronDown,
  Moon,
  Sun,
  LayoutGrid,
  Share2,
  FolderOpen,
  Check,
  Bell,
  User,
  LogOut,
  Settings,
  Users,
  ShieldCheck,
  FileText,
  Menu,
  X,
  PanelLeft,
  PanelLeftClose,
  History
} from 'lucide-react';
import { Workspace } from '../types';

interface HeaderProps {
  currentView: 'landing' | 'dashboard' | 'editor' | 'templates' | 'admin';
  onViewChange: (view: 'landing' | 'dashboard' | 'editor' | 'templates' | 'admin') => void;
  onOpenSearch: () => void;
  onOpenNewPRDModal: () => void;
  workspaces?: Workspace[];
  currentWorkspace?: Workspace;
  onSelectWorkspace?: (ws: Workspace) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  activePRDTitle?: string;
  activePRDVersion?: string;
  activePRDStatus?: string;
  onExportClick?: () => void;
  onShareClick?: () => void;
  onOpenNotifications?: () => void;
  user?: { name: string; email: string; role: string; credits?: number } | null;
  onLogout?: () => void;
  onOpenLogin?: () => void;
  onOpenTeamModal?: () => void;
  onOpenCreditLogs?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
}

const DEFAULT_WS: Workspace = { id: 'ws-1', name: 'Product Engineering', icon: 'layers' };

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenSearch,
  onOpenNewPRDModal,
  workspaces = [DEFAULT_WS],
  currentWorkspace = DEFAULT_WS,
  onSelectWorkspace,
  darkMode = false,
  onToggleDarkMode,
  activePRDTitle,
  activePRDVersion,
  onExportClick,
  onShareClick,
  onOpenNotifications,
  user,
  onLogout,
  onOpenLogin,
  onOpenTeamModal,
  onOpenCreditLogs,
  isSidebarOpen,
  onToggleSidebar,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
}) => {
  const [wsDropdownOpen, setWsDropdownOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = React.useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = React.useState(true);

  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
        setNotifDropdownOpen(false);
        setWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeWs = currentWorkspace || workspaces[0] || DEFAULT_WS;

  const notifications = [
    { id: '1', title: 'PRD "Sistem Manajemen Inventori"', time: '2 jam lalu', text: 'Diperbarui oleh Rian' },
    { id: '2', title: 'Komentar Baru', time: '4 jam lalu', text: 'Sarah menambahkan komentar pada PRD E-Commerce' },
    { id: '3', title: 'PRD Disetujui', time: '1 hari lalu', text: 'Platform Edukasi Online telah disetujui' },
  ];

  return (
    <header ref={headerRef} className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors px-3 sm:px-4 lg:px-6 flex items-center justify-between text-xs font-sans">
      {/* Left Branding & Search bar in header */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Side Menu Toggle Button (Desktop & Mobile) */}
        {user && (onToggleSidebar || onToggleMobileSidebar) && (
          <button
            onClick={onToggleSidebar || onToggleMobileSidebar}
            className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center"
            title={(isSidebarOpen ?? isMobileSidebarOpen) ? "Tutup Side Menu" : "Buka Side Menu"}
            aria-label="Toggle Side Menu Navigation"
          >
            {(isSidebarOpen ?? isMobileSidebarOpen) ? (
              <PanelLeftClose className="w-5 h-5 text-[#B11226]" />
            ) : (
              <PanelLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        )}

        {/* Brand Logo */}
        <button
          onClick={() => onViewChange(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 text-left group transition-all cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#B11226] text-white flex items-center justify-center shadow-sm shadow-[#B11226]/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-gray-900 dark:text-white tracking-tight text-sm sm:text-base font-sans">
              PRD AI
            </span>
          </div>
        </button>

        {/* Global Search Bar (desktop) */}
        {user && (
          <div className="hidden md:flex items-center ml-2 lg:ml-4">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3.5 py-2 w-60 lg:w-72 text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700/80 transition-all text-xs cursor-pointer"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400 flex-1 text-left truncate">
                Cari project, dokumen...
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
                Ctrl /
              </kbd>
            </button>
          </div>
        )}
      </div>

      {/* Middle Navigation (Landing Page Only) */}
      {!user && (
        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-8 text-[13px] font-bold text-gray-600 dark:text-gray-300">
          <button onClick={() => onViewChange('landing')} className="hover:text-[#B11226] transition-colors cursor-pointer">
            Beranda
          </button>
          <button onClick={() => onViewChange('templates')} className="hover:text-[#B11226] transition-colors cursor-pointer">
            Fitur & Template
          </button>
          <a href="https://github.com/WalZetass-kar/DocuSpecAIPRDGenerator" target="_blank" rel="noopener noreferrer" className="hover:text-[#B11226] transition-colors cursor-pointer">
            GitHub
          </a>
        </div>
      )}

      {/* Right Header Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {user ? (
          <>
            {/* Mobile Search Icon */}
            <button
              onClick={onOpenSearch}
              className="p-2 md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              title="Cari"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            {/* Notifications Bell Button — opens NotificationCenter panel */}
            <div className="relative">
              <button
                onClick={() => {
                  setHasUnreadNotif(false);
                  onOpenNotifications?.();
                }}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors relative cursor-pointer"
                title="Pusat Notifikasi"
              >
                <Bell className="w-4.5 h-4.5" />
                {hasUnreadNotif && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B11226] ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                )}
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              title="Ganti Mode Tampilan"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-gray-600" />}
            </button>

            {/* User Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold flex items-center justify-center text-xs shadow-xs">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden lg:block text-left">
                  <span className="font-bold text-gray-900 dark:text-white block text-xs leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{user.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-gray-900 dark:text-white block">{user.name}</span>
                    <span className="text-[10px] text-gray-400">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      onViewChange('dashboard');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-left font-medium"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-gray-400" />
                    <span>Dashboard Saya</span>
                  </button>
                  {onOpenCreditLogs && (
                    <button
                      onClick={() => {
                        onOpenCreditLogs();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-left font-medium"
                    >
                      <History className="w-3.5 h-3.5 text-gray-400" />
                      <span>Riwayat Poin</span>
                    </button>
                  )}
                  {onOpenTeamModal && (
                    <button
                      onClick={() => {
                        onOpenTeamModal();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-left font-medium"
                    >
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>Kelola Tim Workspace</span>
                    </button>
                  )}
                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Logged out Header Controls */
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-gray-600" />}
            </button>
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
            >
              Masuk
            </button>
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs font-bold text-white bg-[#B11226] hover:bg-[#7A0C12] rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Daftar / Buka App
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
