import React from 'react';
import {
  Plus,
  Sparkles,
  FileText,
  FileUp,
  Bot,
  Star,
  Trash2,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronLeft,
  Send,
  MessageSquare,
  Edit3,
  Copy,
  ShieldCheck,
  FolderOpen,
  FolderPlus,
  X,
  Layers,
} from 'lucide-react';
import { PRDDocument, Folder } from '../types';

interface DashboardViewProps {
  prds: PRDDocument[];
  folders: Folder[];
  filterTab: 'all' | 'recent' | 'favorites' | 'trash';
  onFilterTabChange: (tab: 'all' | 'recent' | 'favorites' | 'trash') => void;
  filterFolderId?: string;
  onSelectFolder: (id?: string) => void;
  onCreateFolder?: (name: string) => void;
  onOpenCreateFolderModal?: () => void;
  onDeleteFolder?: (folderId: string) => void;
  onMoveToFolder?: (prdId: string, folderId?: string) => void;
  onOpenNewPRDModal: () => void;
  onOpenImportModal: () => void;
  onOpenTemplates: () => void;
  onOpenAIReviewModal?: () => void;
  onOpenAIAssistant?: () => void;
  onOpenSearch?: () => void;
  onSelectPRD: (prd: PRDDocument) => void;
  onToggleFavorite: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onDuplicatePRD: (prd: PRDDocument) => void;
  userName?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  prds,
  folders,
  filterTab,
  onFilterTabChange,
  filterFolderId,
  onSelectFolder,
  onCreateFolder,
  onOpenCreateFolderModal,
  onDeleteFolder,
  onMoveToFolder,
  onOpenNewPRDModal,
  onOpenImportModal,
  onOpenTemplates,
  onOpenAIReviewModal,
  onOpenAIAssistant,
  onOpenSearch,
  onSelectPRD,
  onToggleFavorite,
  onMoveToTrash,
  onRestoreFromTrash,
  onPermanentDelete,
  onDuplicatePRD,
  userName = 'Ihwal',
}) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const [tipIndex, setTipIndex] = React.useState(0);

  const tips = [
    'Gunakan AI Assistant di tombol melayang bawah untuk konsultasi cepat seputar spesifikasi produk.',
    'Selalu sertakan Acceptance Criteria berformat Given-When-Then agar siap dieksekusi Cursor AI.',
    'Pisahkan Non-Goals sejak awal agar skop proyek tidak membengkak (feature creep).',
  ];

  const activePRDs = prds.filter((p) => !p.inTrash);
  const draftCount = activePRDs.filter((p) => p.status === 'draft').length;
  const selesaiCount = activePRDs.filter((p) => p.status === 'approved' || p.status === 'review').length;
  const revisiCount = activePRDs.filter((p) => p.status === 'review').length; // Changed revising to review or just draft since reviewing is draft/review/approved

  const filteredPRDs = prds.filter((p) => {
    if (filterTab === 'trash') {
      return p.inTrash;
    }
    if (p.inTrash) return false;
    if (filterTab === 'favorites') {
      return p.isFavorite;
    }
    if (filterTab === 'recent') {
      return p.status === 'draft';
    }
    if (filterFolderId) {
      return p.folderId === filterFolderId;
    }
    return true;
  });

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto font-sans text-gray-900 dark:text-gray-100 space-y-6">
      {/* Top Welcome Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          Selamat datang, {userName} <span className="animate-bounce inline-block">👋</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          Buat Product Requirements Document berkualitas tinggi dengan bantuan AI.
        </p>
      </div>

      {/* 4 Quick Action Cards (Matches prompt screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Buat PRD Baru */}
        <button
          onClick={onOpenNewPRDModal}
          className="p-5 rounded-2xl bg-[#B11226] hover:bg-[#7A0C12] text-white shadow-md shadow-[#B11226]/20 transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div>
            <span className="font-extrabold text-sm block">Buat PRD Baru</span>
            <span className="text-[11px] text-red-100 font-normal block mt-1">
              Mulai membuat PRD dari awal dengan AI
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Card 2: Gunakan Template */}
        <button
          onClick={onOpenTemplates}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div>
            <span className="font-extrabold text-sm text-gray-900 dark:text-white block">Gunakan Template</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal block mt-1">
              Pilih dari berbagai template profesional
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-[#B11226] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
        </button>

        {/* Card 3: Import Dokumen */}
        <button
          onClick={onOpenImportModal}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div>
            <span className="font-extrabold text-sm text-gray-900 dark:text-white block">Import Dokumen</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal block mt-1">
              Import PRD dari file markdown / docx
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FileUp className="w-5 h-5" />
          </div>
        </button>

        {/* Card 4: AI Review PRD */}
        <button
          onClick={onOpenAIReviewModal}
          className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div>
            <span className="font-extrabold text-sm text-gray-900 dark:text-white block">AI Review PRD</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal block mt-1">
              Audit & cek kelengkapan PRD otomatis
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Ringkasan Project Stats Block (Matches prompt screenshot) */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Ringkasan Project</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium block">Total Project</span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5 sm:mt-1 block">{activePRDs.length}</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> Proyek Aktif
              </span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium block">Draft</span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5 sm:mt-1 block">{draftCount}</span>
              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">
                <Clock className="w-3 h-3" /> Dalam Pengerjaan
              </span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium block">Selesai / In Review</span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5 sm:mt-1 block">{selesaiCount}</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Siap / Disetujui
              </span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium block">Revisi</span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5 sm:mt-1 block">{revisiCount}</span>
              <span className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5 mt-1">
                <AlertCircle className="w-3 h-3" /> Perlu Perhatian
              </span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Folder Banner (if filtered) */}
      {filterFolderId && (() => {
        const activeFolder = folders.find((f) => f.id === filterFolderId);
        return (
          <div className="p-4 rounded-2xl bg-[#B11226]/5 dark:bg-[#B11226]/10 border border-[#B11226]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold shrink-0 shadow-xs"
                style={{ backgroundColor: activeFolder?.color || '#B11226' }}
              >
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Folder: {activeFolder?.name || 'Kategori Terpilih'}</span>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Menampilkan {filteredPRDs.length} PRD yang tersimpan dalam folder ini
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectFolder(undefined)}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
              <span>Semua Project</span>
            </button>
          </div>
        );
      })()}

      {/* Koleksi Folder & Kategori Grid */}
      <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#B11226]" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Koleksi Folder & Kategori</h2>
          </div>
          <button
            onClick={() => onOpenCreateFolderModal && onOpenCreateFolderModal()}
            className="text-xs text-[#B11226] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Folder Baru</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {folders.map((f) => {
            const prdCount = prds.filter((p) => p.folderId === f.id && !p.inTrash).length;
            const isSelected = filterFolderId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFolder(isSelected ? undefined : f.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-red-50 dark:bg-red-950/40 border-[#B11226] ring-2 ring-[#B11226]/20'
                    : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: f.color || '#B11226' }}
                  />
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                    {prdCount} PRD
                  </span>
                </div>
                <div>
                  <span className="font-extrabold text-xs text-gray-900 dark:text-white block truncate">
                    {f.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block truncate mt-0.5">
                    {isSelected ? '✓ Folder Aktif' : 'Klik untuk buka'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Project Terbaru Table (Left) + Right AI Widget Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Project Terbaru Table (Matches prompt screenshot) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex flex-col gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Project Saya</h2>
                {filterFolderId && (
                  <button
                    onClick={() => onSelectFolder(undefined)}
                    className="text-xs text-[#B11226] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Bersihkan Filter
                  </button>
                )}
              </div>

              {/* Interactive Project Filter Tab Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                <button
                  onClick={() => {
                    onFilterTabChange('all');
                    if (filterFolderId) onSelectFolder(undefined);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    filterTab === 'all' && !filterFolderId
                      ? 'bg-[#B11226] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Semua Project</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                    {activePRDs.length}
                  </span>
                </button>

                <button
                  onClick={() => onFilterTabChange('favorites')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    filterTab === 'favorites'
                      ? 'bg-[#B11226] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Favorit</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                    {activePRDs.filter((p) => p.isFavorite).length}
                  </span>
                </button>

                <button
                  onClick={() => onFilterTabChange('recent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    filterTab === 'recent'
                      ? 'bg-[#B11226] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Draft</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                    {draftCount}
                  </span>
                </button>

                <button
                  onClick={() => onFilterTabChange('trash')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    filterTab === 'trash'
                      ? 'bg-[#B11226] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sampah</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                    {prds.filter((p) => p.inTrash).length}
                  </span>
                </button>
              </div>
            </div>

            {/* Project List Items */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredPRDs.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#B11226]/10 text-[#B11226] flex items-center justify-center mx-auto">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Belum Ada Dokumen PRD</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                      {filterFolderId
                        ? 'Folder ini masih kosong. Buat PRD baru untuk langsung menyimpannya di folder ini.'
                        : 'Belum ada dokumen PRD yang dibuat.'}
                    </p>
                  </div>
                  <button
                    onClick={onOpenNewPRDModal}
                    className="px-4 py-2 bg-[#B11226] hover:bg-[#7A0C12] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Buat PRD {filterFolderId ? 'di Folder ini' : 'Baru'}</span>
                  </button>
                </div>
              ) : (
                filteredPRDs.slice(0, 10).map((prd, idx) => {
                  const initials = prd.title
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  const progress = idx % 3 === 0 ? 60 : idx % 3 === 1 ? 35 : 100;
                  const statusLabel =
                    prd.status === 'draft' ? 'Draft' : prd.status === 'review' ? 'Revisi' : 'Selesai';
                  const statusColor =
                    statusLabel === 'Draft'
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                      : statusLabel === 'Revisi'
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50';

                  const folder = folders.find((f) => f.id === prd.folderId);

                  return (
                    <div
                      key={prd.id}
                      onClick={() => onSelectPRD(prd)}
                      className="py-3.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-2xl transition-colors cursor-pointer flex items-center justify-between gap-4 text-xs"
                    >
                      {/* Title & Icon Box */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-gray-900 dark:text-white block truncate">
                            {prd.title}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 flex-wrap">
                            <span>{prd.category}</span>
                            {folder && (
                              <span className="inline-flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: folder.color || '#B11226' }}
                                />
                                {folder.name}
                              </span>
                            )}
                            <span>•</span>
                            <span>{prd.lastEdited}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className="w-20 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>
                          • {statusLabel}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="hidden sm:flex items-center gap-2 w-32 shrink-0">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-gray-500">{progress}%</span>
                      </div>

                      {/* Action & Favorite */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleFavorite(prd.id)}
                          className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${prd.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === prd.id ? null : prd.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === prd.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl py-1.5 z-50 text-xs">
                              {prd.inTrash ? (
                                <>
                                  <button
                                    onClick={() => {
                                      onRestoreFromTrash(prd.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 font-bold text-left"
                                  >
                                    <Clock className="w-3.5 h-3.5" /> Pulihkan PRD
                                  </button>
                                  <button
                                    onClick={() => {
                                      onPermanentDelete(prd.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 font-bold text-left"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus Permanen
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      onSelectPRD(prd);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" /> Buka PRD
                                  </button>

                                  {/* Move to folder selector */}
                                  <div className="px-3 py-1 border-t border-b border-gray-100 dark:border-gray-800 my-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                                      Atur Folder
                                    </span>
                                    <select
                                      value={prd.folderId || ''}
                                      onChange={(e) => {
                                        if (onMoveToFolder) onMoveToFolder(prd.id, e.target.value || undefined);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[11px] font-medium outline-none cursor-pointer"
                                    >
                                      <option value="">📁 Tanpa Folder</option>
                                      {folders.map((f) => (
                                        <option key={f.id} value={f.id}>
                                          📁 {f.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <button
                                    onClick={() => {
                                      onDuplicatePRD(prd);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Duplikasi
                                  </button>
                                  <button
                                    onClick={() => {
                                      onMoveToTrash(prd.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 text-left font-bold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus PRD
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onFilterTabChange('all')}
                className="w-full py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors cursor-pointer text-xs"
              >
                Lihat semua project
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Activity + Daily Tips (Matches prompt screenshot) */}
        <div className="space-y-6">
          {/* Aktivitas Terbaru */}
          <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-gray-900 dark:text-white">Aktivitas Terbaru</span>
              <button onClick={onOpenSearch} className="text-xs text-[#B11226] font-bold hover:underline cursor-pointer">Lihat semua</button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/50 text-[#B11226] flex items-center justify-center shrink-0 mt-0.5">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block text-xs">
                    PRD "Sistem Manajemen Inventori" diperbarui
                  </span>
                  <span className="text-[10px] text-gray-400">2 jam yang lalu</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block text-xs">
                    Komentar baru pada PRD "Aplikasi E-Commerce"
                  </span>
                  <span className="text-[10px] text-gray-400">4 jam yang lalu</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block text-xs">
                    PRD "Platform Edukasi Online" disetujui
                  </span>
                  <span className="text-[10px] text-gray-400">1 hari yang lalu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Harian */}
          <div className="p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                💡 Tips Harian
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTipIndex((prev) => (prev > 0 ? prev - 1 : tips.length - 1))}
                  className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                </button>
                <button
                  onClick={() => setTipIndex((prev) => (prev < tips.length - 1 ? prev + 1 : 0))}
                  className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              {tips[tipIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
