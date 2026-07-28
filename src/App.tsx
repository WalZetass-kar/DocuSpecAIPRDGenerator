import React from 'react';
import { PRDDocument, Folder, TemplatePreset, PRDInput, Workspace } from './types';
import { SAMPLE_PRDS, DEFAULT_FOLDERS } from './data/samplePRDs';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { PRDEditor } from './components/PRDEditor';
import { TemplatesView } from './components/TemplatesView';
import { PRDGeneratorModal } from './components/PRDGeneratorModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { CreditLogsModal } from './components/CreditLogsModal';
import { VersionHistoryDrawer } from './components/VersionHistoryDrawer';
import { CommentsDrawer } from './components/CommentsDrawer';
import { AuthModal } from './components/AuthModal';
import { ImportDocumentModal } from './components/ImportDocumentModal';
import { TeamModal } from './components/TeamModal';
import { ProjectEstimateModal } from './components/ProjectEstimateModal';
import { AIReviewModal } from './components/AIReviewModal';
import { GuideModal } from './components/GuideModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { CreateFolderModal } from './components/CreateFolderModal';
import { Bot, Bell, X, CheckCircle2 } from 'lucide-react';
import { supabase } from './lib/supabase';

import { AdminDashboard } from './components/AdminDashboard';
import NotificationCenter from './components/NotificationCenter';

import { useNavigate, useLocation } from 'react-router-dom';

export function App() {
  // Navigation View State derived from URL Router
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract view from pathname (e.g. '/' -> 'landing', '/dashboard' -> 'dashboard')
  const currentViewRaw = location.pathname === '/' ? 'landing' : location.pathname.substring(1);
  const currentView = ['landing', 'dashboard', 'editor', 'templates', 'admin'].includes(currentViewRaw)
    ? (currentViewRaw as 'landing' | 'dashboard' | 'editor' | 'templates' | 'admin')
    : 'landing';

  const setCurrentView = (view: string) => {
    if (view === 'landing') navigate('/');
    else navigate(`/${view}`);
  };

  // User Auth State
  const [user, setUser] = React.useState<{ id?: string; name: string; email: string; role: string; credits?: number } | null>(() => {
    try {
      const saved = localStorage.getItem('docuspec_user');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
    return null;
  });
  
  const [toastMessage, setToastMessage] = React.useState<{title: string, msg: string} | null>(null);

  // PRD & Folders State — initialize from localStorage as fallback
  const [prds, setPrds] = React.useState<PRDDocument[]>(() => {
    try {
      const saved = localStorage.getItem('docuspec_prds');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Failed to load PRDs from localStorage:', err);
    }
    return [];
  });
  const [folders, setFolders] = React.useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem('docuspec_folders');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Failed to load folders from localStorage:', err);
    }
    return [];
  });

  React.useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No Supabase session found — user may not be logged in.');
        return;
      }

      const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profileErr) {
        console.warn('Failed to load profile:', profileErr.message);
      }
      if (profile) {
        setUser(prev => prev ? { ...prev, credits: profile.credits, role: profile.role, id: profile.id } : null);
      }
      
      // Subscribe to profile changes
      const profileSub = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, (payload) => {
          const newCredits = payload.new.credits;
          setUser(prev => {
            if (prev && newCredits > (prev.credits || 0)) {
              setToastMessage({ title: 'Top Up Berhasil! 🎉', msg: `Saldo Anda bertambah. Saat ini Anda memiliki ${newCredits} Poin AI.` });
              setTimeout(() => setToastMessage(null), 5000);
            }
            return prev ? { ...prev, credits: newCredits, role: payload.new.role } : null;
          });
        })
        .subscribe();
      
      const { data: dbFolders, error: foldersErr } = await supabase.from('folders').select('*');
      if (foldersErr) {
        console.warn('Failed to load folders:', foldersErr.message);
      }
      if (dbFolders && dbFolders.length > 0) {
        setFolders(dbFolders.map(f => ({
          id: f.id,
          name: f.name,
          color: f.color || '#B11226',
          icon: f.icon || 'folder'
        })));
      }

      const { data: dbPrds, error: prdsErr } = await supabase.from('prds').select('*').order('updated_at', { ascending: false });
      if (prdsErr) {
        console.warn('Failed to load PRDs:', prdsErr.message);
      }
      if (dbPrds && dbPrds.length > 0) {
        setPrds(dbPrds.map(p => ({
          ...p.content,
          id: p.id,
          title: p.title,
          folderId: p.folder_id,
          category: p.category,
          platform: p.platform,
          complexity: p.complexity,
          status: p.status,
          version: p.version,
          author: p.author,
          tags: p.tags,
          isFavorite: p.is_favorite,
          inTrash: p.in_trash,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        } as PRDDocument)));
      }
    }
    loadData();
  }, [user]);

  // Sync back to Supabase on Update (Auto-save)
  const savePrdToDB = async (prd: PRDDocument) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('savePrdToDB: No session — skipping save.');
        return;
      }

      const { error } = await supabase.from('prds').upsert({
        id: prd.id,
        user_id: session.user.id,
        folder_id: prd.folderId || null,
        title: prd.title,
        category: prd.category,
        platform: prd.platform,
        complexity: prd.complexity,
        status: prd.status,
        version: prd.version,
        author: prd.author,
        is_favorite: prd.isFavorite,
        in_trash: prd.inTrash,
        tags: prd.tags,
        content: prd,
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.error('savePrdToDB error:', error.message, error.details);
      }
    } catch (err: any) {
      console.error('savePrdToDB exception:', err.message);
    }
  };

  const saveFolderToDB = async (folder: Folder) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('saveFolderToDB: No session — skipping save.');
        return;
      }

      const { error } = await supabase.from('folders').upsert({
        id: folder.id,
        user_id: session.user.id,
        name: folder.name,
        color: folder.color,
        icon: folder.icon
      });
      if (error) {
        console.error('saveFolderToDB error:', error.message, error.details);
      }
    } catch (err: any) {
      console.error('saveFolderToDB exception:', err.message);
    }
  };
  const [activePRDId, setActivePRDId] = React.useState<string>(() => {
    return SAMPLE_PRDS[0]?.id || '';
  });

  // Filters State
  const [filterCategory, setFilterCategory] = React.useState<string>('All');
  const [filterFolderId, setFilterFolderId] = React.useState<string | undefined>(undefined);
  const [filterTab, setFilterTab] = React.useState<'all' | 'recent' | 'favorites' | 'trash'>('all');

  // Modals & Drawers State
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = React.useState(false);
  const [isCreditLogsOpen, setIsCreditLogsOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = React.useState(false);
  const [isAIReviewModalOpen, setIsAIReviewModalOpen] = React.useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = React.useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = React.useState(false);
  const [guideModalTab, setGuideModalTab] = React.useState<'panduan' | 'contoh' | 'best_practice'>('panduan');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);

  const [isNewPRDModalOpen, setIsNewPRDModalOpen] = React.useState(false);
  const [presetInput, setPresetInput] = React.useState<Partial<PRDInput> | undefined>(undefined);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = React.useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
  });

  // Theme State (Default to Light Mode as per user request)
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    return localStorage.getItem('docuspec_theme') === 'dark';
  });

  // Sync state to localStorage
  React.useEffect(() => {
    try {
      if (user) localStorage.setItem('docuspec_user', JSON.stringify(user));
      else localStorage.removeItem('docuspec_user');
    } catch (err) {
      console.error('Failed to save user:', err);
    }
  }, [user]);

  React.useEffect(() => {
    try {
      localStorage.setItem('docuspec_prds', JSON.stringify(prds));
    } catch (err) {
      console.error('Failed to save PRDs to storage:', err);
    }
  }, [prds]);

  React.useEffect(() => {
    try {
      localStorage.setItem('docuspec_folders', JSON.stringify(folders));
    } catch (err) {
      console.error('Failed to save folders to storage:', err);
    }
  }, [folders]);

  // Apply dark class
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('docuspec_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('docuspec_theme', 'light');
    }
  }, [isDarkMode]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Ctrl+/)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.key === '/')) {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activePRD = prds.find((p) => p.id === activePRDId) || prds[0];

  // Handler: Login / Logout
  const handleLoginSuccess = (userData: { id: string; name: string; email: string; role: string; credits: number }) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  const handleCreateFolder = (name: string, color?: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      color: color || '#B11226',
      icon: 'folder',
    };
    setFolders((prev) => [...prev, newFolder]);
    saveFolderToDB(newFolder);
    setFilterFolderId(newFolder.id);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setPrds((prev) => prev.map((p) => (p.folderId === folderId ? { ...p, folderId: undefined } : p)));
    if (filterFolderId === folderId) {
      setFilterFolderId(undefined);
    }
  };

  const handleMoveToFolder = (prdId: string, folderId?: string) => {
    setPrds((prev) =>
      prev.map((p) => (p.id === prdId ? { ...p, folderId: folderId } : p))
    );
  };

  // Handler: Generate new PRD via Gemini API (Client-side directly)
  const handleGeneratePRD = async (input: PRDInput) => {
    try {
      const { generatePRD } = await import('./lib/gemini');
      const prdData = await generatePRD(input);

      const newPRD: PRDDocument = {
        ...prdData,
        folderId: input.folderId || filterFolderId || prdData.folderId,
      };

      // Simpan ke Supabase Database
      await savePrdToDB(newPRD);

      setPrds((prev) => [newPRD, ...prev]);
      setActivePRDId(newPRD.id);
      setUser((prev) => (prev ? { ...prev, credits: Math.max(0, (prev.credits || 0) - 36) } : null));
      setCurrentView('editor');
    } catch (err: any) {
      console.error('Error generating PRD:', err);
      throw err;
    }
  };

  const handleImportSuccess = (importedPRD: PRDDocument) => {
    setPrds((prev) => [importedPRD, ...prev]);
    setActivePRDId(importedPRD.id);
    setCurrentView('editor');
  };

  // Handler: Select PRD
  const handleSelectPRD = (prd: PRDDocument) => {
    setActivePRDId(prd.id);
    setCurrentView('editor');
  };

  // Handler: Update PRD
  const handleUpdatePRD = (updated: PRDDocument) => {
    setPrds((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    savePrdToDB(updated);
  };

  // Handler: Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setPrds((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // Handler: Trash management
  const handleMoveToTrash = (id: string) => {
    setPrds((prev) => prev.map((p) => (p.id === id ? { ...p, inTrash: true } : p)));
  };

  const handleRestoreFromTrash = (id: string) => {
    setPrds((prev) => prev.map((p) => (p.id === id ? { ...p, inTrash: false } : p)));
  };

  const handlePermanentDelete = (id: string) => {
    setPrds((prev) => prev.filter((p) => p.id !== id));
  };

  // Handler: Duplicate PRD
  const handleDuplicatePRD = (prd: PRDDocument) => {
    const duplicated: PRDDocument = {
      ...prd,
      id: `prd-${Date.now()}`,
      title: `${prd.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastEdited: 'Baru saja',
    };
    setPrds((prev) => [duplicated, ...prev]);
    setActivePRDId(duplicated.id);
    setCurrentView('editor');
  };

  // Handler: Select Template
  const handleSelectTemplate = (tpl: TemplatePreset) => {
    setPresetInput(tpl.inputs);
    setIsNewPRDModalOpen(true);
  };

  const DEFAULT_WORKSPACES: Workspace[] = [
    { id: 'ws-1', name: 'Product Engineering', icon: 'layers' },
    { id: 'ws-2', name: 'Growth & Innovation', icon: 'zap' },
    { id: 'ws-3', name: 'Mobile App Tribe', icon: 'smartphone' },
  ];

  const [workspaces] = React.useState<Workspace[]>(DEFAULT_WORKSPACES);
  const [currentWorkspace, setCurrentWorkspace] = React.useState<Workspace>(DEFAULT_WORKSPACES[0]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors selection:bg-[#B11226]/20 selection:text-[#B11226]">


      {/* Top Main Navigation Header */}
      <Header
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={setCurrentWorkspace}
        onOpenNewPRDModal={() => {
          setPresetInput(undefined);
          setIsNewPRDModalOpen(true);
        }}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
        darkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activePRDTitle={activePRD?.title}
        activePRDVersion={activePRD?.version}
        activePRDStatus={activePRD?.status}
        onExportClick={() => setIsExportModalOpen(true)}
        onShareClick={() => setIsShareModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onOpenCreditLogs={() => setIsCreditLogsOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isMobileSidebarOpen={isSidebarOpen}
        onToggleMobileSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main App Layout */}
      {currentView === 'landing' || !user ? (
        <LandingPage
          onOpenNewPRDModal={() => {
            if (!user) setIsAuthModalOpen(true);
            else {
              setPresetInput(undefined);
              setIsNewPRDModalOpen(true);
            }
          }}
          onViewDemo={() => {
            if (!user) {
              setUser({ name: 'M. Ihwal Maulana', email: 'ihwal@example.com', role: 'Product Manager' });
            }
            setCurrentView('dashboard');
          }}
          onSelectTemplate={(tpl) => {
            if (!user) setIsAuthModalOpen(true);
            else handleSelectTemplate(tpl);
          }}
          onViewTemplates={() => {
            if (!user) setIsAuthModalOpen(true);
            else setCurrentView('templates');
          }}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
          onOpenTeamModal={() => setIsTeamModalOpen(true)}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
          onViewChange={setCurrentView}
        />
      ) : (
        <div className="flex w-full min-w-0 max-w-full overflow-hidden h-[calc(100vh-4rem)]">
          {/* Persistent Left Sidebar */}
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            prds={prds}
            folders={folders}
            activePRDId={activePRDId}
            filterFolderId={filterFolderId}
            onSelectFolder={setFilterFolderId}
            onCreateFolder={handleCreateFolder}
            onOpenCreateFolderModal={() => setIsCreateFolderModalOpen(true)}
            onSelectPRD={handleSelectPRD}
            onOpenNewPRDModal={() => {
              setPresetInput(undefined);
              setIsNewPRDModalOpen(true);
            }}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenTeamModal={() => setIsTeamModalOpen(true)}
            onOpenEstimateModal={() => setIsEstimateModalOpen(true)}
            onOpenAIReviewModal={() => setIsAIReviewModalOpen(true)}
            onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            onOpenGuideModal={(tab) => {
              setGuideModalTab(tab || 'panduan');
              setIsGuideModalOpen(true);
            }}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            filterTab={filterTab}
            onFilterTabChange={setFilterTab}
            darkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            user={user}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isOpenMobile={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />

          {/* Main View Area */}
          <main className="flex-1 min-w-0 flex flex-col h-full max-w-full relative overflow-y-auto custom-scrollbar">
            <div>
              {currentView === 'dashboard' && (
                <DashboardView
                  prds={prds}
                  folders={folders}
                  filterTab={filterTab}
                  onFilterTabChange={setFilterTab}
                  filterFolderId={filterFolderId}
                  onSelectFolder={setFilterFolderId}
                  onCreateFolder={handleCreateFolder}
                  onOpenCreateFolderModal={() => setIsCreateFolderModalOpen(true)}
                  onOpenNewPRDModal={() => {
                    setPresetInput(undefined);
                    setIsNewPRDModalOpen(true);
                  }}
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  onOpenTemplates={() => setCurrentView('templates')}
                  onOpenAIReviewModal={() => setIsAIReviewModalOpen(true)}
                  onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
                  onOpenSearch={() => setIsSearchModalOpen(true)}
                  onSelectPRD={handleSelectPRD}
                  onToggleFavorite={handleToggleFavorite}
                  onMoveToTrash={handleMoveToTrash}
                  onRestoreFromTrash={handleRestoreFromTrash}
                  onPermanentDelete={handlePermanentDelete}
                  onDuplicatePRD={handleDuplicatePRD}
                  onMoveToFolder={handleMoveToFolder}
                  onDeleteFolder={handleDeleteFolder}
                  userName={user.name.split(' ')[0] || 'Ihwal'}
                />
              )}

              {currentView === 'editor' && (
                activePRD ? (
                  <PRDEditor
                    prd={activePRD}
                    folders={folders}
                    onUpdatePRD={handleUpdatePRD}
                    onOpenExportModal={() => setIsExportModalOpen(true)}
                    onOpenShareModal={() => setIsShareModalOpen(true)}
                    onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
                    onOpenComments={() => setIsCommentsOpen(true)}
                    onDuplicatePRD={handleDuplicatePRD}
                    unreadCommentsCount={activePRD.comments?.filter((c) => !c.resolved).length || 0}
                    onBackToDashboard={() => setCurrentView('dashboard')}
                  />
                ) : (
                  <div className="flex-1 h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#B11226]/10 border border-[#B11226]/20 text-[#B11226] flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold">PRD</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Belum ada Dokumen PRD</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
                      Anda dapat membuat dokumen PRD baru dengan AI Generator atau memilih dari template yang tersedia.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setPresetInput(undefined);
                          setIsNewPRDModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-[#B11226] text-white text-xs font-bold rounded-xl hover:bg-[#7A0C12] transition-all shadow-sm cursor-pointer"
                      >
                        + Buat PRD Baru
                      </button>
                      <button
                        onClick={() => setCurrentView('templates')}
                        className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
                      >
                        Lihat Template
                      </button>
                    </div>
                  </div>
                )
              )}

              {currentView === 'templates' && (
                <TemplatesView onSelectTemplate={handleSelectTemplate} />
              )}
              {currentView === 'admin' && (
                <AdminDashboard />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Import Document Modal */}
      <ImportDocumentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Team Modal */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentUser={user}
      />

      {/* Project Estimator Modal */}
      <ProjectEstimateModal
        isOpen={isEstimateModalOpen}
        onClose={() => setIsEstimateModalOpen(false)}
        prds={prds}
      />

      {/* AI Review Modal — works from Dashboard (uses latest PRD) or from Editor (uses activePRD) */}
      {isAIReviewModalOpen && (() => {
        const prdToReview = activePRD ?? prds.filter(p => !p.inTrash)[0];
        return prdToReview ? (
          <AIReviewModal
            isOpen={isAIReviewModalOpen}
            onClose={() => setIsAIReviewModalOpen(false)}
            prd={prdToReview}
            onUpdatePRD={handleUpdatePRD}
          />
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full text-center space-y-3 border border-gray-200 dark:border-gray-800 shadow-xl">
              <p className="font-bold text-gray-900 dark:text-white">Belum ada PRD</p>
              <p className="text-sm text-gray-500">Buat atau generate PRD terlebih dahulu sebelum melakukan AI Review.</p>
              <button onClick={() => setIsAIReviewModalOpen(false)} className="px-4 py-2 bg-[#B11226] text-white rounded-xl text-sm font-bold hover:bg-[#900E1F]">Tutup</button>
            </div>
          </div>
        );
      })()}

      {/* Guide & Documentation Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        activeTab={guideModalTab}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {/* PRD Generator Modal */}
      <PRDGeneratorModal
        isOpen={isNewPRDModalOpen}
        onClose={() => setIsNewPRDModalOpen(false)}
        onGenerate={handleGeneratePRD}
        presetInput={presetInput}
        folders={folders}
        defaultFolderId={filterFolderId}
      />

      {/* Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        prds={prds}
        onSelectPRD={handleSelectPRD}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        activePRD={activePRD}
      />


      {activePRD && (
        <>
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            prd={activePRD}
          />

          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            prd={activePRD}
          />

          <VersionHistoryDrawer
            isOpen={isVersionHistoryOpen}
            onClose={() => setIsVersionHistoryOpen(false)}
            prd={activePRD}
            onRestoreVersion={handleUpdatePRD}
          />

          <CommentsDrawer
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
            prd={activePRD}
            onUpdatePRD={handleUpdatePRD}
          />
        </>
      )}

      {currentView !== 'landing' && user && (
        <CreateFolderModal
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
          onCreate={handleCreateFolder}
        />
      )}
      
      <CreditLogsModal 
        isOpen={isCreditLogsOpen}
        onClose={() => setIsCreditLogsOpen(false)}
      />

      {/* Notification Center Panel */}
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl shadow-2xl flex items-start gap-3 max-w-sm relative">
            <button onClick={() => setToastMessage(null)} className="absolute top-2 right-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"><X className="w-4 h-4" /></button>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex flex-shrink-0 items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{toastMessage.title}</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">{toastMessage.msg}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
