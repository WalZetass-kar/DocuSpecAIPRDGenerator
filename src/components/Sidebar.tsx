import React from 'react';
import {
  LayoutGrid,
  FileText,
  FolderOpen,
  FolderPlus,
  Users,
  Sparkles,
  Bot,
  ShieldCheck,
  Calculator,
  BookOpen,
  HelpCircle,
  Award,
  Crown,
  Moon,
  Sun,
  MoreVertical,
  LogOut,
  ChevronRight,
  Plus,
  X,
  PanelLeftClose,
} from 'lucide-react';
import { Folder, PRDDocument } from '../types';

interface SidebarProps {
  currentView: 'landing' | 'dashboard' | 'editor' | 'templates' | 'admin';
  onViewChange: (view: 'landing' | 'dashboard' | 'editor' | 'templates' | 'admin') => void;
  prds: PRDDocument[];
  folders: Folder[];
  activePRDId?: string;
  filterFolderId?: string;
  onSelectFolder?: (id?: string) => void;
  onCreateFolder?: (name: string) => void;
  onOpenCreateFolderModal?: () => void;
  onSelectPRD: (prd: PRDDocument) => void;
  onOpenNewPRDModal: () => void;
  onOpenImportModal: () => void;
  onOpenTeamModal: () => void;
  onOpenEstimateModal: () => void;
  onOpenAIReviewModal: () => void;
  onOpenAIAssistant?: () => void;
  onOpenGuideModal: (tab?: 'panduan' | 'contoh' | 'best_practice') => void;
  onOpenUpgradeModal: () => void;
  filterTab: 'all' | 'recent' | 'favorites' | 'trash';
  onFilterTabChange: (tab: 'all' | 'recent' | 'favorites' | 'trash') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: { name: string; email: string; role: string; credits?: number; subscription_plan?: string } | null;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  prds,
  folders,
  activePRDId,
  filterFolderId,
  onSelectFolder,
  onCreateFolder,
  onOpenCreateFolderModal,
  onSelectPRD,
  onOpenNewPRDModal,
  onOpenImportModal,
  onOpenTeamModal,
  onOpenEstimateModal,
  onOpenAIReviewModal,
  onOpenAIAssistant,
  onOpenGuideModal,
  onOpenUpgradeModal,
  filterTab,
  onFilterTabChange,
  darkMode,
  onToggleDarkMode,
  user,
  onLogout,
  isOpen,
  onClose,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [activeMenu, setActiveMenu] = React.useState<'dashboard' | 'projects' | 'templates' | 'folder' | 'team' | 'admin'>('dashboard');
  const [isFoldersExpanded, setIsFoldersExpanded] = React.useState(true);
  const [teamMembersCount, setTeamMembersCount] = React.useState<number>(() => {
    try {
      const saved = localStorage.getItem('docuspec_team_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch (err) {}
    return 1;
  });

  React.useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('docuspec_team_members');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setTeamMembersCount(parsed.length);
        }
      } catch (err) {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isSidebarOpen = isOpen ?? isOpenMobile ?? true;
  const handleClose = onClose || onCloseMobile;

  const handleNavClick = (action: () => void) => {
    action();
    if (window.innerWidth < 1024 && handleClose) handleClose();
  };

  return (
    <>
      {/* Mobile Dark Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Responsive Sidebar Drawer */}
      <aside
        className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col select-none text-xs custom-scrollbar overflow-y-auto transition-all duration-300 ${
          isSidebarOpen
            ? 'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl translate-x-0 lg:static lg:w-64 lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 lg:z-10 lg:shadow-none lg:shrink-0 lg:translate-x-0'
            : 'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] -translate-x-full lg:hidden'
        }`}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-3.5 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#B11226] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-xs text-gray-900 dark:text-white">Menu Navigasi</span>
          </div>
          {handleClose && (
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Tutup Menu"
            >
              <PanelLeftClose className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-6 flex-1">
          {/* Main Dashboard Link */}
          <div>
            <button
              onClick={() =>
                handleNavClick(() => {
                  setActiveMenu('dashboard');
                  onViewChange('dashboard');
                  onFilterTabChange('all');
                })
              }
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                currentView === 'dashboard' && activeMenu === 'dashboard'
                  ? 'bg-[#B11226] text-white shadow-sm shadow-[#B11226]/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* WORKSPACE SECTION */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block mb-1.5">
              WORKSPACE
            </span>

            <button
              onClick={() =>
                handleNavClick(() => {
                  setActiveMenu('projects');
                  if (onSelectFolder) onSelectFolder(undefined);
                  onViewChange('dashboard');
                  onFilterTabChange('all');
                })
              }
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
                activeMenu === 'projects' && !filterFolderId
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>Project Saya</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">{prds.filter((p) => !p.inTrash).length}</span>
            </button>

            <button
              onClick={() =>
                handleNavClick(() => {
                  setActiveMenu('templates');
                  onViewChange('templates');
                })
              }
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
                currentView === 'templates'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-gray-400" />
                <span>Template</span>
              </div>
            </button>

            {/* FOLDER MENU WITH SUB-ITEMS */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setIsFoldersExpanded(!isFoldersExpanded);
                  setActiveMenu('folder');
                  if (onSelectFolder && filterFolderId) {
                    onSelectFolder(undefined);
                  }
                  onViewChange('dashboard');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
                  activeMenu === 'folder'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderPlus className="w-4 h-4 text-gray-400" />
                  <span>Folder</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-gray-400">{folders.length}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      isFoldersExpanded ? 'rotate-90' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible Sub-Folders List */}
              {isFoldersExpanded && (
                <div className="pl-4 pr-1 space-y-0.5 border-l-2 border-gray-100 dark:border-gray-800 ml-5 my-1">
                  <button
                    onClick={() =>
                      handleNavClick(() => {
                        if (onSelectFolder) onSelectFolder(undefined);
                        setActiveMenu('folder');
                        onViewChange('dashboard');
                      })
                    }
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      !filterFolderId && activeMenu === 'folder'
                        ? 'bg-[#B11226]/10 text-[#B11226] font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>📁 Semua Folder</span>
                  </button>

                  {folders.map((f) => {
                    const count = prds.filter((p) => p.folderId === f.id && !p.inTrash).length;
                    const isSelected = filterFolderId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() =>
                          handleNavClick(() => {
                            if (onSelectFolder) onSelectFolder(f.id);
                            setActiveMenu('folder');
                            onViewChange('dashboard');
                          })
                        }
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer truncate ${
                          isSelected
                            ? 'bg-[#B11226]/10 text-[#B11226] font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: f.color || '#B11226' }}
                          />
                          <span className="truncate">{f.name}</span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 ml-1">{count}</span>
                      </button>
                    );
                  })}

                  {/* Add Folder Quick Action */}
                  <button
                    onClick={() => onOpenCreateFolderModal && onOpenCreateFolderModal()}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#B11226] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Buat Folder Baru</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick(onOpenTeamModal)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Tim</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-[10px] font-bold">
                {teamMembersCount}
              </span>
            </button>
          </div>

          {/* AI TOOLS SECTION */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block mb-1.5">
              AI TOOLS
            </span>

            <button
              onClick={() => handleNavClick(onOpenNewPRDModal)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#B11226]" />
              <span>AI PRD Generator</span>
            </button>

            <button
              onClick={() => handleNavClick(onOpenAIAssistant || onOpenNewPRDModal)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-500" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => handleNavClick(onOpenAIReviewModal)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>AI Review</span>
            </button>

            <button
              onClick={() => handleNavClick(onOpenEstimateModal)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-amber-500" />
              <span>Estimasi Proyek</span>
            </button>
          </div>

          {/* DOKUMENTASI SECTION */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block mb-1.5">
              DOKUMENTASI
            </span>

            <button
              onClick={() => handleNavClick(() => onOpenGuideModal('panduan'))}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>Panduan</span>
            </button>

            <button
              onClick={() => handleNavClick(() => onOpenGuideModal('contoh'))}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Contoh PRD</span>
            </button>

            <button
              onClick={() => handleNavClick(() => onOpenGuideModal('best_practice'))}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-gray-400" />
              <span>Best Practice</span>
            </button>
          </div>

          {/* ADMIN TOOLS */}
          {user?.role === 'Developer' && (
            <div className="space-y-1">
              <span className="px-3 text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block mb-1.5">
                ADMIN / DEVELOPER
              </span>

              <button
                onClick={() =>
                  handleNavClick(() => {
                    setActiveMenu('admin');
                    onViewChange('admin');
                  })
                }
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#B11226]" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          )}

          {/* STATS MINI CARD */}
          {user && (
            <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2.5 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Statistik Anda</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  user.subscription_plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                  user.subscription_plan === 'Pro' ? 'bg-red-100 text-[#B11226] dark:bg-red-900/40 dark:text-red-300' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {user.subscription_plan || 'FREE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                  <div className="text-lg font-black text-gray-900 dark:text-white leading-none">{prds.filter(p => !p.inTrash).length}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Total PRD</div>
                </div>
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
                  <div className={`text-lg font-black leading-none ${
                    (user.credits || 0) <= 3 ? 'text-[#B11226]' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>{user.credits ?? 0}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Poin AI</div>
                </div>
              </div>

              {(user.credits ?? 0) <= 3 && (
                <button
                  onClick={() => handleNavClick(onOpenUpgradeModal)}
                  className="w-full py-1.5 text-[10px] font-bold text-[#B11226] bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                >
                  ⚡ Poin hampir habis! Top Up sekarang →
                </button>
              )}
            </div>
          )}

          {/* PRO UPGRADE CARD */}
          <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 space-y-2">
            <div className="flex items-center gap-2 text-[#B11226] dark:text-red-400 font-extrabold">
              <Crown className="w-4 h-4 text-[#B11226]" />
              <span>Tingkatkan ke Pro</span>
            </div>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-snug">
              Dapatkan fitur AI tanpa batas dan export
            </p>
            <button
              onClick={() => handleNavClick(onOpenUpgradeModal)}
              className="w-full py-2 bg-[#B11226] hover:bg-[#7A0C12] text-white font-bold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              Upgrade Sekarang
            </button>
          </div>
        </div>

        {/* BOTTOM CONTROL & PROFILE BAR */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-3 shrink-0">
          {/* Dark Mode Switch Row */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
            title="Ganti Mode Tampilan (Light/Dark)"
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
              <span>{darkMode ? 'Mode Gelap' : 'Mode Terang'}</span>
            </div>
            <div
              className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                darkMode ? 'bg-[#B11226]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* User Profile Bar at bottom */}
          {user && (
            <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="truncate">
                  <span className="font-bold text-gray-900 dark:text-white block truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">{user.email}</span>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={() => handleNavClick(onLogout)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
