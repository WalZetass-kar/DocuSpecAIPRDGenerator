import React from 'react';
import {
  FileText,
  Star,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Bot,
  MessageSquare,
  History,
  Code2,
  Database,
  Layers,
  ListOrdered,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Cpu,
  Lock,
  Edit3,
  Save,
  Plus,
  Trash2,
  Wand2,
  ArrowUpRight,
  Filter,
  Users,
  Compass,
  CheckSquare,
  Search,
  Gauge,
  Workflow,
  X
} from 'lucide-react';
import { PRDDocument, Folder, PRDStatus, UserStoryItem, TaskItem } from '../types';
import { AIInsightsPanel } from './AIInsightsPanel';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { generateContent } from '../lib/gemini';

interface EditableBlockProps {
  content: string;
  onSave: (newContent: string) => void;
  label?: string;
  isMarkdown?: boolean;
}

const EditableBlock: React.FC<EditableBlockProps> = ({ content, onSave, label = 'Teks', isMarkdown = false }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(content);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [showAiInput, setShowAiInput] = React.useState(false);

  React.useEffect(() => { setValue(content); }, [content]);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  const handleAiRewrite = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const promptText = `Revisi teks berikut sesuai dengan instruksi ini: "${aiPrompt}".\n\nTeks asli:\n${value}\n\nBerikan HANYA teks hasil revisi dalam bahasa Indonesia. Jangan tambahkan kata-kata pengantar.`;
      const result = await generateContent(promptText, 'Kamu adalah AI Product Manager.');
      setValue(result);
      setShowAiInput(false);
      setAiPrompt('');
    } catch (e: any) {
      alert(e.message);
    }
    setIsAiLoading(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full min-h-[150px] p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#B11226] focus:border-transparent outline-none transition-all resize-y text-gray-900 dark:text-gray-100"
        />
        
        {showAiInput && (
          <div className="flex gap-2 p-3 bg-[#B11226]/5 rounded-lg border border-[#B11226]/20 items-center">
            <Sparkles className="w-4 h-4 text-[#B11226]" />
            <input 
              autoFocus
              type="text" 
              placeholder="Contoh: Buat lebih profesional, perbaiki typo..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              className="flex-1 bg-transparent text-sm border-none outline-none focus:ring-0 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAiRewrite()}
            />
            <button onClick={handleAiRewrite} disabled={isAiLoading || !aiPrompt.trim()} className="px-3 py-1 bg-[#B11226] text-white rounded-md text-xs font-bold hover:bg-[#900E1F] disabled:opacity-50">
              {isAiLoading ? 'Loading...' : 'Revisi'}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={() => setShowAiInput(!showAiInput)} className="text-xs flex items-center gap-1.5 font-medium text-[#B11226] hover:bg-[#B11226]/10 px-3 py-1.5 rounded-lg transition-colors">
            <Wand2 className="w-3.5 h-3.5" />
            AI Rewrite
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={() => { setIsEditing(false); setValue(content); }} className="px-4 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              Batal
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1">
              <Save className="w-3.5 h-3.5" />
              Simpan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${isMarkdown ? '' : 'whitespace-pre-line'}`}>
        {content}
      </div>
      <button 
        onClick={() => setIsEditing(true)}
        className="absolute top-0 right-0 p-1.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:text-[#B11226] opacity-0 group-hover:opacity-100 transition-all -translate-y-2 translate-x-2 print:hidden"
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface PRDEditorProps {
  prd: PRDDocument;
  folders?: Folder[];
  onUpdatePRD: (updated: PRDDocument) => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
  onOpenVersionHistory: () => void;
  onOpenComments: () => void;
  onDuplicatePRD: (prd: PRDDocument) => void;
  unreadCommentsCount?: number;
  onBackToDashboard?: () => void;
}

export const PRDEditor: React.FC<PRDEditorProps> = ({
  prd,
  folders = [],
  onUpdatePRD,
  onOpenExportModal,
  onOpenShareModal,
  onOpenVersionHistory,
  onOpenComments,
  onDuplicatePRD,
  unreadCommentsCount = 0,
  onBackToDashboard,
}) => {
  if (!prd) {
    return (
      <div className="flex-1 h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Dokumen PRD tidak ditemukan</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Silakan kembali ke dashboard dan pilih dokumen PRD.</p>
        {onBackToDashboard && (
          <button onClick={onBackToDashboard} className="mt-4 px-4 py-2 bg-[#B11226] text-white text-xs font-bold rounded-xl hover:bg-[#7A0C12]">
            Kembali ke Dashboard
          </button>
        )}
      </div>
    );
  }

  const prdGoals = prd.goals || { businessGoals: [], nonGoals: [] };
  const prdSuccessMetrics = prd.successMetrics || [];
  const prdFunctionalRequirements = prd.functionalRequirements || [];
  const prdApiSpecification = prd.apiSpecification || [];
  const prdDatabaseDesign = prd.databaseDesign || { tables: [] };
  const prdUserPersonas = prd.userPersonas || [];
  const prdStakeholders = prd.stakeholders || [];
  const prdScope = prd.scope || { inScope: [], outOfScope: [] };
  const prdReleaseChecklist = prd.releaseChecklist || [];
  const prdInputs: any = prd.inputs || {};

  const [showAiInsights, setShowAiInsights] = React.useState(true);
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);
  const [activeTabSection, setActiveTabSection] = React.useState('sec-summary');
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(prd.title || '');
  const [aiRefineDrawerOpen, setAiRefineDrawerOpen] = React.useState(false);
  const [aiActionLoading, setAiActionLoading] = React.useState(false);
  const [aiAnalysisOutput, setAiAnalysisOutput] = React.useState<any>(null);
  const [customAIChatMsg, setCustomAIChatMsg] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [tocSearchQuery, setTocSearchQuery] = React.useState('');
  const [showTocMobile, setShowTocMobile] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');

  // Local checklist state for release checklist
  const [checklistItems, setChecklistItems] = React.useState(prdReleaseChecklist);

  React.useEffect(() => {
    setTitleInput(prd.title || '');
    setChecklistItems(prd.releaseChecklist || []);
  }, [prd.id, prd.title]);

  const [launchedPlatform, setLaunchedPlatform] = React.useState<string | null>(null);

  // Helper to copy prompt and launch external AI tool directly
  const handleLaunchAITool = (url: string, platformName: string) => {
    if (prd.aiCodingPrompt) {
      navigator.clipboard.writeText(prd.aiCodingPrompt);
      setCopiedPrompt(true);
      setLaunchedPlatform(platformName);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#B11226', '#3B82F6', '#10B981', '#F59E0B'],
      });
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        setCopiedPrompt(false);
        setLaunchedPlatform(null);
      }, 4000);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: PRDStatus) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">● Approved</span>;
      case 'review':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">● In Review</span>;
      case 'deprecated':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-700">● Deprecated</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800">● Draft</span>;
    }
  };

  // Toggle checklist item
  const handleToggleChecklist = (index: number) => {
    const updated = [...checklistItems];
    updated[index].status = updated[index].status === 'completed' ? 'pending' : 'completed';
    setChecklistItems(updated);
    onUpdatePRD({ ...prd, releaseChecklist: updated });
  };

  // Run AI Refine Action
  const handleRunAIRefine = async (action: string, customPromptText?: string) => {
    setAiActionLoading(true);
    setAiRefineDrawerOpen(true);
    setErrorText('');

    try {
      const { refinePRD } = await import('../lib/gemini');
      const data = await refinePRD(prd, action, customPromptText);
      
      const resData = data;

      if (resData.success) {
        setAiAnalysisOutput(resData.data);
        if (customPromptText) {
          setChatHistory((prev) => [
            ...prev,
            { role: 'user', text: customPromptText },
            { role: 'assistant', text: resData.data.summary || resData.data.generatedOutput || 'Penyempurnaan selesai.' },
          ]);
        }
      } else {
        setErrorText('Gagal menjalankan AI Refine.');
      }
    } catch (err: any) {
      console.error('Error refining PRD:', err);
      setErrorText('Terjadi kesalahan saat terhubung ke AI server.');
    } finally {
      setAiActionLoading(false);
    }
  };

  const sectionsList = [
    { id: 'sec-summary', label: '1. Executive Summary', icon: FileText },
    { id: 'sec-problem', label: '2. Problem & Solution', icon: AlertTriangle },
    { id: 'sec-goals', label: '3. Goals & Metrics', icon: Activity },
    { id: 'sec-personas', label: '4. User Personas & Stakeholders', icon: Users },
    { id: 'sec-journey', label: '5. User Journey & Scope', icon: Compass },
    { id: 'sec-functional', label: '6. Functional Req (User Stories)', icon: ListOrdered },
    { id: 'sec-architecture', label: '7. Architecture & Tech Stack', icon: Layers },
    { id: 'sec-api', label: '8. API Specification', icon: Code2 },
    { id: 'sec-database', label: '9. Database Schema (ERD)', icon: Database },
    { id: 'sec-design', label: '10. Design System & UI', icon: Edit3 },
    { id: 'sec-security', label: '11. Security & Accessibility', icon: ShieldCheck },
    { id: 'sec-tasks', label: '12. Task Backlog & Release', icon: CheckCircle2 },
    { id: 'sec-prompt', label: '13. AI Coding Prompt', icon: Terminal },
  ];

  const filteredSections = sectionsList.filter(s => 
    s.label.toLowerCase().includes(tocSearchQuery.toLowerCase())
  );

  const completedChecklistCount = checklistItems.filter(c => c.status === 'completed').length;
  const totalChecklistCount = checklistItems.length || 1;
  const releaseProgressPct = Math.round((completedChecklistCount / totalChecklistCount) * 100);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8F9FA] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans z-40 fixed inset-0">
      {/* Dedicated Document Studio Top Bar */}
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between shrink-0 z-30 shadow-xs">
        {/* Left: Back Button & Document Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
              <span>Kembali ke Dashboard</span>
            </button>
          )}
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block shrink-0" />
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="text-xs text-gray-400 font-bold hidden md:inline">Studio Editor /</span>
            <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">{prd.title}</span>
          </div>
          {getStatusBadge(prd.status)}
        </div>

        {/* Right: Studio Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setAiRefineDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B11226] to-[#7A0C12] text-white text-xs font-bold shadow-sm shadow-[#B11226]/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Assistant & Refine</span>
          </button>
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor</span>
          </button>
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bagikan</span>
          </button>
        </div>
      </header>

      {/* Editor Body: Left TOC Sidebar + Center Document Canvas */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
        {/* Mobile TOC Toggle Button */}
        <button
          onClick={() => setShowTocMobile(!showTocMobile)}
          className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-[#B11226] text-white shadow-lg shadow-[#B11226]/30 flex items-center justify-center cursor-pointer"
        >
          <ListOrdered className="w-5 h-5" />
        </button>

        {/* Mobile TOC Overlay Backdrop */}
        {showTocMobile && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowTocMobile(false)}
          />
        )}

        {/* Left TOC Navigator Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 lg:w-60 xl:w-64
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          p-4 shrink-0 space-y-4 min-w-0 overflow-y-auto custom-scrollbar
          transform transition-transform duration-200 ease-in-out
          ${showTocMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Mobile Close Button */}
          <button
            onClick={() => setShowTocMobile(false)}
            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Daftar Seksi PRD (36 Poin)
          </div>

          <nav className="space-y-1 text-xs font-medium">
          {sectionsList.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTabSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveTabSection(sec.id);
                  const el = document.getElementById(sec.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left ${
                  isActive
                    ? 'bg-[#B11226]/10 text-[#B11226] dark:bg-[#B11226]/20 dark:text-red-400 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button
            onClick={() => setAiRefineDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-[#B11226] to-[#7A0C12] text-white font-bold rounded-xl text-xs shadow-sm shadow-[#B11226]/20 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>AI Refine & Assistant</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-4xl xl:max-w-5xl mx-auto custom-scrollbar overflow-x-hidden">
        {/* Document Header Panel */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#B11226]/10 text-[#B11226] dark:bg-[#B11226]/20 dark:text-red-400 text-xs font-bold">
                  {prd.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                  {prd.platform}
                </span>
                {folders && folders.length > 0 && (
                  <select
                    value={prd.folderId || ''}
                    onChange={(e) => onUpdatePRD({ ...prd, folderId: e.target.value || undefined })}
                    className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-900 cursor-pointer outline-none transition-colors"
                  >
                    <option value="">📁 Tanpa Folder</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>📁 {f.name}</option>
                    ))}
                  </select>
                )}
                {getStatusBadge(prd.status)}
              </div>

              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="text-xl sm:text-2xl font-black bg-gray-50 dark:bg-gray-800 border border-[#B11226] rounded-lg px-2 py-1 focus:outline-none w-full max-w-md min-w-0"
                  />
                  <button
                    onClick={() => {
                      onUpdatePRD({ ...prd, title: titleInput });
                      setIsEditingTitle(false);
                    }}
                    className="p-1.5 bg-[#B11226] text-white rounded-lg"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    {prd.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="Sunting Judul"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dibuat oleh <strong className="text-gray-700 dark:text-gray-300 font-semibold">{prd.author}</strong> • Versi {prd.version} • Diperbarui {new Date(prd.updatedAt).toLocaleDateString('id-ID')}
              </p>
            </div>

            {/* Quick Actions Top Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAiInsights(!showAiInsights)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  showAiInsights
                    ? 'bg-[#B11226]/10 text-[#B11226] border-[#B11226]/30 dark:bg-[#B11226]/20 dark:text-red-400'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
                title="Toggle AI Insights Panel"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B11226] animate-pulse" />
                <span>AI Insights</span>
              </button>
              <button
                onClick={() => onUpdatePRD({ ...prd, isFavorite: !prd.isFavorite })}
                className={`p-2 rounded-xl border transition-colors ${
                  prd.isFavorite
                    ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
                    : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
                title="Favoritkan"
              >
                <Star className={`w-4 h-4 ${prd.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>

              <button
                onClick={onOpenComments}
                className="relative p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                title="Komentar"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadCommentsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B11226] text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCommentsCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenVersionHistory}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                title="Riwayat Versi"
              >
                <History className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenShareModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>

              <button
                onClick={onOpenExportModal}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#B11226] to-[#7A0C12] hover:opacity-95 rounded-xl shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor PRD</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section id="sec-summary" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#B11226]" />
              <span>1. Executive Summary</span>
            </h2>
          </div>
          <EditableBlock 
            content={prd.executiveSummary} 
            onSave={(val) => onUpdatePRD({ ...prd, executiveSummary: val })} 
          />
        </section>

        {/* 2. Problem Statement & Solution */}
        <section id="sec-problem" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <AlertTriangle className="w-5 h-5 text-[#B11226]" />
            <span>2. Problem Statement & Solution</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2">
              <span className="font-bold text-red-700 dark:text-red-400 uppercase tracking-wider text-[10px]">
                Masalah Utama (Problem)
              </span>
              <EditableBlock 
                content={prd.problemStatement} 
                onSave={(val) => onUpdatePRD({ ...prd, problemStatement: val })} 
              />
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                Solusi Produk (Solution)
              </span>
              <EditableBlock 
                content={prdInputs.solution || 'Solusi terintegrasi terstruktur.'}
                onSave={(val) => onUpdatePRD({ ...prd, inputs: { ...prdInputs, solution: val } })} 
              />
            </div>
          </div>
        </section>

        {/* 3. Goals & Success Metrics */}
        <section id="sec-goals" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Activity className="w-5 h-5 text-[#B11226]" />
            <span>3. Target Bisnis & Success Metrics</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-gray-900 dark:text-white">Goal Bisnis Utama</span>
              <ul className="space-y-1.5">
                {prdGoals.businessGoals?.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-gray-900 dark:text-white">Non-Goals (Di Luar Fokus)</span>
              <ul className="space-y-1.5">
                {prdGoals.nonGoals?.map((ng, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-1.5" />
                    <span>{ng}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Metrics Table */}
          <div className="pt-2">
            <span className="font-bold text-xs text-gray-900 dark:text-white mb-2 block">
              Success Metrics Table (KPIs)
            </span>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                  <tr>
                    <th className="p-3">Metrik KPI</th>
                    <th className="p-3">Target Spesifik</th>
                    <th className="p-3">Waktu Pencapaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {prdSuccessMetrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">{m.metric}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-mono font-bold">{m.target}</td>
                      <td className="p-3 text-gray-500">{m.timeframe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. User Personas & Stakeholders */}
        <section id="sec-personas" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Users className="w-5 h-5 text-[#B11226]" />
            <span>4. User Personas & Stakeholders</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {prdUserPersonas.map((persona, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/70 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#B11226] text-white flex items-center justify-center font-bold text-xs">
                    {persona.name ? persona.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm block">{persona.name || 'User Persona'}</span>
                    <span className="text-[10px] text-gray-500">{persona.role}</span>
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-[10px] uppercase">Pain Points:</span>
                  <p className="text-red-600 dark:text-red-400 text-[11px] leading-relaxed">{Array.isArray(persona.painPoints) ? persona.painPoints.join(', ') : persona.painPoints}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-gray-700 dark:text-gray-300 text-[10px] uppercase">Goals:</span>
                  <p className="text-emerald-600 dark:text-emerald-400 text-[11px] leading-relaxed">{Array.isArray(persona.goals) ? persona.goals.join(', ') : persona.goals}</p>
                </div>
              </div>
            ))}
          </div>

          {prdStakeholders.length > 0 && (
            <div className="pt-2">
              <span className="font-bold text-xs text-gray-900 dark:text-white mb-2 block">Matriks Stakeholder</span>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                    <tr>
                      <th className="p-2.5">Peran</th>
                      <th className="p-2.5">Tanggung Jawab</th>
                      <th className="p-2.5">Dampak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {prdStakeholders.map((sh, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold text-gray-900 dark:text-white">{sh.role}</td>
                        <td className="p-2.5 text-gray-600 dark:text-gray-300">{sh.responsibility}</td>
                        <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold text-[10px]">{sh.impact}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* 5. User Journey & Scope */}
        <section id="sec-journey" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Compass className="w-5 h-5 text-[#B11226]" />
            <span>5. User Journey & Product Scope</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                ✓ Fitur Dalam Cakupan (In-Scope v1)
              </span>
              <ul className="space-y-1">
                {prdScope.inScope?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-gray-800 dark:text-gray-200">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                ✕ Di Luar Cakupan (Out of Scope v1)
              </span>
              <ul className="space-y-1">
                {prdScope.outOfScope?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-gray-500 dark:text-gray-400">
                    <span>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Functional Requirements (User Stories) */}
        <section id="sec-functional" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-[#B11226]" />
              <span>4. Functional Requirements & Acceptance Criteria</span>
            </h2>
            <span className="text-xs font-mono font-bold text-gray-400">
              {prdFunctionalRequirements.length} Stories
            </span>
          </div>

          <div className="space-y-4">
            {prdFunctionalRequirements.map((req: UserStoryItem, idx) => (
              <div
                key={req.id || idx}
                className="p-4 rounded-xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/70 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#B11226] bg-[#B11226]/10 px-2 py-0.5 rounded">
                      {req.id}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {req.feature}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.priority === 'P0'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    Prioritas {req.priority}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 italic bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
                  "{req.userStory}"
                </p>

                <div className="space-y-1">
                  <span className="font-bold text-gray-900 dark:text-white text-[11px] uppercase tracking-wider">
                    Acceptance Criteria (Given-When-Then):
                  </span>
                  <ul className="space-y-1 font-mono text-[11px] text-gray-600 dark:text-gray-400 pl-2">
                    {(Array.isArray(req.acceptanceCriteria)
                      ? req.acceptanceCriteria
                      : typeof req.acceptanceCriteria === 'string'
                      ? (req.acceptanceCriteria as string).split('\n').filter(Boolean)
                      : []
                    ).map((ac, acIdx) => (
                      <li key={acIdx} className="flex items-start gap-1.5">
                        <span className="text-[#22C55E]">✓</span>
                        <span>{ac}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. API Specification */}
        <section id="sec-api" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Code2 className="w-5 h-5 text-[#B11226]" />
            <span>5. API Specification & Endpoints</span>
          </h2>

          <div className="space-y-3">
            {prdApiSpecification.map((api, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-900 text-gray-100 border border-gray-800 font-mono text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        api.method === 'GET'
                          ? 'bg-blue-500 text-white'
                          : api.method === 'POST'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {api.method}
                    </span>
                    <span className="font-bold text-amber-400">{api.endpoint}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">{api.description}</span>
                </div>

                {api.reqPayload && (
                  <div className="pt-2">
                    <span className="text-gray-500 text-[10px] block">Request Payload:</span>
                    <pre className="p-2 rounded bg-black/50 text-gray-300 text-[10px] overflow-x-auto">
                      {api.reqPayload}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. Database Design */}
        <section id="sec-database" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Database className="w-5 h-5 text-[#B11226]" />
            <span>6. Database Design & ERD Tables</span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {prdDatabaseDesign.tables?.map((tbl, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                    Table: {tbl.name}
                  </span>
                  <span className="text-gray-500 text-[11px]">{tbl.description}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="text-gray-500 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="py-1.5">Column</th>
                        <th className="py-1.5">Type</th>
                        <th className="py-1.5">Constraints</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                      {tbl.columns?.map((col, colIdx) => (
                        <tr key={colIdx}>
                          <td className="py-1 font-bold text-emerald-600 dark:text-emerald-400">{col.name}</td>
                          <td className="py-1 text-gray-700 dark:text-gray-300">{col.type}</td>
                          <td className="py-1 text-amber-600 dark:text-amber-400">{col.constraints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Design System & Colors */}
        <section id="sec-design" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Edit3 className="w-5 h-5 text-[#B11226]" />
            <span>7. Design System Guidelines</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#B11226] border border-gray-200 shadow-xs" />
              <div>
                <span className="block font-bold text-gray-900 dark:text-white">Primary</span>
                <span className="font-mono text-[10px] text-gray-500">#B11226</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#7A0C12] border border-gray-200 shadow-xs" />
              <div>
                <span className="block font-bold text-gray-900 dark:text-white">Dark Red</span>
                <span className="font-mono text-[10px] text-gray-500">#7A0C12</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-gray-300 shadow-xs" />
              <div>
                <span className="block font-bold text-gray-900 dark:text-white">Background</span>
                <span className="font-mono text-[10px] text-gray-500">#FAFAFA</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-300 shadow-xs" />
              <div>
                <span className="block font-bold text-gray-900 dark:text-white">Surface</span>
                <span className="font-mono text-[10px] text-gray-500">#FFFFFF</span>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Tasks & Release Checklist */}
        <section id="sec-tasks" className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <CheckCircle2 className="w-5 h-5 text-[#B11226]" />
            <span>8. Task Backlog & Release Checklist</span>
          </h2>

          <div className="space-y-2 text-xs">
            <span className="font-bold text-gray-900 dark:text-white">Release Checklist (Definition of Done)</span>
            <div className="space-y-1.5">
              {checklistItems.map((chk, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100/80 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={chk.status === 'completed'}
                    onChange={() => handleToggleChecklist(idx)}
                    className="w-4 h-4 text-[#B11226] rounded focus:ring-[#B11226]"
                  />
                  <span
                    className={
                      chk.status === 'completed'
                        ? 'line-through text-gray-400 font-medium'
                        : 'text-gray-800 dark:text-gray-200 font-semibold'
                    }
                  >
                    {chk.item}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* 11. AI Coding Prompt Block & 1-Click Platform Launchers */}
        <section id="sec-prompt" className="p-6 rounded-2xl bg-gray-900 text-gray-100 border border-gray-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">System Prompt AI Coding Agent</h2>
                <p className="text-[11px] text-gray-400">Siap dieksekusi otomatis oleh AI Coding Tools pilihan Anda</p>
              </div>
            </div>

            <button
              onClick={() => handleLaunchAITool('https://cursor.com', 'Cursor IDE')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B11226] hover:bg-[#7A0C12] text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
            >
              {copiedPrompt && !launchedPlatform ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Prompt Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Prompt AI</span>
                </>
              )}
            </button>
          </div>

          {/* 1-CLICK DIRECT LAUNCHERS BANNER */}
          <div className="p-4 rounded-xl bg-gray-800/80 border border-gray-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B11226]" />
                Buka Langsung di Platform AI (1-Click Auto Copy & Launch)
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Prompt disalin otomatis ke clipboard</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {/* Google Gemini */}
              <button
                onClick={() => handleLaunchAITool('https://gemini.google.com/app', 'Google Gemini')}
                className="p-2.5 rounded-xl bg-gray-900 hover:bg-blue-950/60 border border-gray-700 hover:border-blue-500 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-blue-400" />
                </div>
                <span className="text-[10px] text-gray-400 block truncate">Google Gemini App</span>
              </button>

              {/* ChatGPT */}
              <button
                onClick={() => handleLaunchAITool('https://chatgpt.com', 'ChatGPT')}
                className="p-2.5 rounded-xl bg-gray-900 hover:bg-emerald-950/60 border border-gray-700 hover:border-emerald-500 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    ChatGPT
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-emerald-400" />
                </div>
                <span className="text-[10px] text-gray-400 block truncate">OpenAI GPT-4o</span>
              </button>

              {/* Claude AI */}
              <button
                onClick={() => handleLaunchAITool('https://claude.ai/new', 'Claude AI')}
                className="p-2.5 rounded-xl bg-gray-900 hover:bg-amber-950/60 border border-gray-700 hover:border-amber-500 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    Claude
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-amber-400" />
                </div>
                <span className="text-[10px] text-gray-400 block truncate">Anthropic Claude 3.5</span>
              </button>

              {/* v0 by Vercel */}
              <button
                onClick={() => handleLaunchAITool('https://v0.dev', 'v0 by Vercel')}
                className="p-2.5 rounded-xl bg-gray-900 hover:bg-purple-950/60 border border-gray-700 hover:border-purple-500 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-purple-400 group-hover:text-purple-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    v0 Vercel
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-purple-400" />
                </div>
                <span className="text-[10px] text-gray-400 block truncate">Generatif UI v0</span>
              </button>

              {/* Cursor / Windsurf */}
              <button
                onClick={() => handleLaunchAITool('https://cursor.com', 'Cursor IDE')}
                className="p-2.5 rounded-xl bg-gray-900 hover:bg-red-950/60 border border-gray-700 hover:border-[#B11226] text-left transition-all group cursor-pointer col-span-2 sm:col-span-1"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#B11226] group-hover:text-red-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Cursor
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-[#B11226]" />
                </div>
                <span className="text-[10px] text-gray-400 block truncate">AI Code Editor</span>
              </button>
            </div>

            {/* Platform Launch Toast Alert */}
            {launchedPlatform && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-sans text-xs flex items-center gap-2.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <strong>Prompt Berhasil Disalin!</strong> Membuka <span>{launchedPlatform}</span> di tab baru. Tekan <kbd className="px-1.5 py-0.5 rounded bg-emerald-900 border border-emerald-700 font-mono text-[10px]">Ctrl+V</kbd> atau <kbd className="px-1.5 py-0.5 rounded bg-emerald-900 border border-emerald-700 font-mono text-[10px]">Cmd+V</kbd> di aplikasi untuk langsung menempelkan prompt PRD.
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 font-sans">
            Berikut adalah teks System Prompt lengkap berformat 36 poin yang dapat langsung ditempelkan ke AI Coding Agent:
          </p>

          <pre className="p-4 rounded-xl bg-black/80 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words leading-relaxed border border-gray-800 max-h-96 custom-scrollbar max-w-full">
            {prd.aiCodingPrompt}
          </pre>
        </section>
      </main>

      {/* AI Insights Panel */}
      <AIInsightsPanel
        prd={prd}
        onUpdatePRD={onUpdatePRD}
        isOpen={showAiInsights}
        onClose={() => setShowAiInsights(false)}
        onJumpToSection={(secId) => {
          setActiveTabSection(secId);
          const el = document.getElementById(secId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      {/* Floating AI Refine & Assistant Drawer */}
      {aiRefineDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl p-6 flex flex-col justify-between custom-scrollbar animate-slide-left text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#B11226]" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">AI Refine Assistant</h3>
              </div>
              <button
                onClick={() => setAiRefineDrawerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                ✕
              </button>
            </div>

            {/* Action Chips */}
            <div className="space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400">
                Penyempurnaan Sekali Klik
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Sempurnakan PRD', action: 'refine_all' },
                  { label: 'Deteksi Konflik', action: 'detect_conflicts' },
                  { label: 'Tambah Requirement', action: 'add_missing' },
                  { label: 'Rekomendasi UX', action: 'ux_recommendations' },
                  { label: 'Rekomendasi DB', action: 'db_recommendations' },
                  { label: 'Cek Keamanan OWASP', action: 'security_recommendations' },
                ].map((chip) => (
                  <button
                    key={chip.action}
                    onClick={() => handleRunAIRefine(chip.action)}
                    disabled={aiActionLoading}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-[#B11226]/10 hover:text-[#B11226] border border-gray-200 dark:border-gray-700 text-left font-medium text-[11px] transition-colors disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Output Box */}
            {aiAnalysisOutput && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                  ✓ Analisis Gemini AI:
                </span>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                  {aiAnalysisOutput.summary}
                </p>
                {aiAnalysisOutput.recommendations?.map((rec: string, rIdx: number) => (
                  <div key={rIdx} className="text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <span>•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <textarea
              rows={2}
              placeholder="Tanyakan atau Minta Revisi ke Asisten AI..."
              value={customAIChatMsg}
              onChange={(e) => setCustomAIChatMsg(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-[#B11226]"
            />
            <button
              onClick={() => {
                if (customAIChatMsg.trim()) {
                  handleRunAIRefine('custom', customAIChatMsg);
                  setCustomAIChatMsg('');
                }
              }}
              disabled={aiActionLoading}
              className="w-full py-2 bg-[#B11226] hover:bg-[#7A0C12] text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Kirim ke Gemini AI
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
