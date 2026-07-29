import React from 'react';
import {
  X,
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code2,
  Database,
  Layers,
  ArrowRight,
  Shield,
  Cpu,
} from 'lucide-react';
import { Folder, PRDInput, ProjectCategory, PlatformType, ComplexityLevel } from '../types';
import { TEMPLATES } from '../data/templates';
import { supabase } from '../lib/supabase';

interface PRDGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (input: PRDInput) => Promise<void>;
  presetInput?: Partial<PRDInput>;
  folders?: Folder[];
  defaultFolderId?: string;
}

const CATEGORIES: ProjectCategory[] = [
  'AI SaaS',
  'Marketplace',
  'Education',
  'School',
  'University',
  'Healthcare',
  'Fintech',
  'ERP',
  'CRM',
  'POS',
  'Inventory',
  'E-Commerce',
  'Food Delivery',
  'Hotel',
  'Travel',
  'IoT',
  'Chat Application',
  'Social Media',
  'Portfolio',
  'Company Profile',
  'Website',
  'Mobile App',
  'Landing Page',
  'Game',
];

const PLATFORMS: PlatformType[] = [
  'Web',
  'Mobile (iOS/Android)',
  'Desktop',
  'Cross-Platform',
  'API/Backend Service',
];

const COMPLEXITIES: ComplexityLevel[] = [
  'Simple (1-2 Sprints)',
  'Medium (3-6 Sprints)',
  'Complex (Enterprise / Scaled)',
];

export const PRDGeneratorModal: React.FC<PRDGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  presetInput,
  folders = [],
  defaultFolderId,
}) => {
  const [formData, setFormData] = React.useState<PRDInput>({
    projectName: '',
    category: 'AI SaaS',
    platform: 'Web',
    folderId: defaultFolderId || '',
    targetUser: '',
    problemStatement: '',
    solution: '',
    mainFeatures: '',
    businessGoals: '',
    deadline: '3 Bulan',
    complexity: 'Medium (3-6 Sprints)',
    techStack: {
      frontend: 'React 19 + TypeScript + Tailwind CSS v4',
      backend: 'Node.js Express',
      database: 'PostgreSQL / Firestore',
      authentication: 'OAuth2 / Firebase Auth',
      hosting: 'Google Cloud Run',
      apiIntegrations: 'Google Gemini API',
    },
    additionalPrompt: '',
  });

  const [isAutoFilling, setIsAutoFilling] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [errorMsg, setErrorMsg] = React.useState('');

  // Update preset when opened or presetInput changes
  React.useEffect(() => {
    if (presetInput) {
      setFormData((prev) => ({
        ...prev,
        ...presetInput,
        techStack: {
          ...prev.techStack,
          ...presetInput.techStack,
        },
      }));
    }
  }, [presetInput, isOpen]);

  if (!isOpen) return null;

  // Handle Auto-Fill with AI
  const handleAutoFillAI = async () => {
    if (!formData.projectName.trim()) {
      setErrorMsg('Masukkan Nama Project terlebih dahulu sebelum menggunakan Auto-Fill AI.');
      return;
    }

    setErrorMsg('');
    setIsAutoFilling(true);

    try {
      const { autoFillForm } = await import('../lib/gemini');
      const resData = await autoFillForm(
        formData.projectName,
        formData.category,
        formData.platform
      );

      if (resData) {
        setFormData((prev) => ({
          ...prev,
          ...resData,
          projectName: prev.projectName || resData.projectName,
        }));
      } else {
        setErrorMsg('Gagal mengisi otomatis. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error('Error auto filling:', err);
      setErrorMsg(err.message || 'Gagal terhubung ke AI server.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Handle Submit Form to Generate PRD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectName.trim()) {
      setErrorMsg('Nama Project wajib diisi.');
      return;
    }

    setErrorMsg('');
    setIsGenerating(true);
    setLoadingStep(1);

    const steps = [
      'Memproses konteks proyek...',
      'Merancang arsitektur 36 seksi spesifikasi...',
      'Menyusun Given-When-Then Acceptance Criteria...',
      'Membangun skema ERD Database & Endpoint API...',
      'Selesai! Menyiapkan PRD Workspace...',
    ];

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);

    try {
      await onGenerate(formData);
      clearInterval(stepInterval);
      onClose();
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err?.message || 'Gagal menghasilkan PRD. Coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 overflow-y-auto custom-scrollbar animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200  dark:border-gray-800 rounded-2xl shadow-2xl my-8 overflow-hidden text-gray-900 dark:text-gray-100 font-sans">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 border-b border-gray-100/10 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#B11226] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>AI Software Documentation Platform</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#B11226]/10 text-[#B11226]">
                  PRD • SRS • SDD • UI/UX • ERD • API
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Otomatis susun PRD, SRS, SDD, Diagram Flow, Skema ERD Database, Endpoint REST API, hingga Prompt Cursor AI.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading Overlay State when Generating */}
        {isGenerating ? (
          <div className="p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[#B11226]/20 border-t-[#B11226] animate-spin" />
              <div className="absolute inset-2 rounded-full bg-[#B11226] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#B11226] animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Gemini AI Sedang Menyusun PRD Anda...
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                Memproses 36 poin spesifikasi teknis lengkap beserta diagram alur dan prompt khusus AI Coding Assistant.
              </p>
            </div>

            {/* Step progress list */}
            <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200  dark:border-gray-700/60 space-y-2 text-left text-xs">
              {[
                '1. Memproses konteks proyek...',
                '2. Merancang arsitektur 36 seksi spesifikasi...',
                '3. Menyusun Given-When-Then Acceptance Criteria...',
                '4. Membangun skema ERD Database & Endpoint API...',
                '5. Menyiapkan PRD Workspace...',
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 transition-colors ${
                    idx < loadingStep
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : idx === loadingStep
                      ? 'text-[#B11226] dark:text-red-400 font-bold'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {idx < loadingStep ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : idx === loadingStep ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Template Presets Bar */}
            <div className="space-y-2">
              <label className="font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span>Pilih Template Cepat (Opsional)</span>
                <span className="text-[10px] text-gray-400 font-normal">Klik untuk mengisi preset</span>
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {TEMPLATES.slice(0, 7).map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      if (tpl.inputs) {
                        setFormData((prev) => ({
                          ...prev,
                          ...tpl.inputs,
                          techStack: {
                            ...prev.techStack,
                            ...tpl.inputs.techStack,
                          },
                        }));
                      }
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-200  dark:border-gray-700 hover:border-[#B11226] bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors font-medium text-[11px]"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Basic Information */}
            <div className="space-y-4 p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B11226]" />
                  <span>1. Informasi Utama Proyek</span>
                </h3>

                <button
                  type="button"
                  onClick={handleAutoFillAI}
                  disabled={isAutoFilling}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#B11226] to-[#7A0C12] hover:opacity-95 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAutoFilling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>Auto-Fill dengan AI</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Nama Project <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: DocuSpec AI Writer"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProjectCategory })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value as PlatformType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  >
                    {PLATFORMS.map((plat) => (
                      <option key={plat} value={plat}>
                        {plat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Folder Simpan</label>
                  <select
                    value={formData.folderId || ''}
                    onChange={(e) => setFormData({ ...formData, folderId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  >
                    <option value="">📁 Tanpa Folder</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Problem & Solution */}
            <div className="space-y-4 p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#B11226]" />
                <span>2. Masalah & Solusi Bisnis</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Target Pengguna (Target User)</label>
                  <input
                    type="text"
                    placeholder="misal: Product Managers, Developers, Agencies"
                    value={formData.targetUser}
                    onChange={(e) => setFormData({ ...formData, targetUser: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Target Deadline & Kompleksitas</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="misal: Q3 2026"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                    />
                    <select
                      value={formData.complexity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          complexity: e.target.value as ComplexityLevel,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                    >
                      {COMPLEXITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Masalah Utama (Problem Statement)</label>
                  <textarea
                    rows={2}
                    placeholder="Masalah spesifik yang dialami pengguna saat ini..."
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Solusi Produk</label>
                  <textarea
                    rows={2}
                    placeholder="Bagaimana aplikasi ini menyelesaikan masalah tersebut..."
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Fitur Utama & Target Bisnis</label>
                  <input
                    type="text"
                    placeholder="Daftar fitur kunci yang wajib dibangun..."
                    value={formData.mainFeatures}
                    onChange={(e) => setFormData({ ...formData, mainFeatures: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Tech Stack */}
            <div className="space-y-4 p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#B11226]" />
                <span>3. Spesifikasi Arsitektur Teknologi</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Frontend</label>
                  <input
                    type="text"
                    value={formData.techStack.frontend}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        techStack: { ...formData.techStack, frontend: e.target.value },
                      })
                    }
                    className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Backend</label>
                  <input
                    type="text"
                    value={formData.techStack.backend}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        techStack: { ...formData.techStack, backend: e.target.value },
                      })
                    }
                    className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Database</label>
                  <input
                    type="text"
                    value={formData.techStack.database}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        techStack: { ...formData.techStack, database: e.target.value },
                      })
                    }
                    className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Authentication</label>
                  <input
                    type="text"
                    value={formData.techStack.authentication}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        techStack: { ...formData.techStack, authentication: e.target.value },
                      })
                    }
                    className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400">Hosting & Infra</label>
                  <input
                    type="text"
                    value={formData.techStack.hosting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        techStack: { ...formData.techStack, hosting: e.target.value },
                      })
                    }
                    className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400">API Integrations</label>
                  <input
                    type="text"
                    value={formData.techStack.apiIntegrations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        techStack: { ...formData.techStack, apiIntegrations: e.target.value },
                      })
                    }
                    className="w-full mt-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
                  />
                </div>
              </div>
            </div>

            {/* Custom Enterprise Knowledge Base Injection */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2">
              <label className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
                <span>Enterprise Knowledge Base / Coding Standard Context (Opsional)</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Injeksi Standar Perusahaan</span>
              </label>
              <textarea
                rows={2}
                placeholder="Tempelkan aturan coding internal, pedoman nama database, atau standar OWASP perusahaan di sini..."
                value={formData.additionalPrompt}
                onChange={(e) => setFormData({ ...formData, additionalPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226] text-xs text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Additional Instructions */}
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Prompt Tambahan / Catatan Khusus</label>
              <textarea
                rows={2}
                placeholder="Instruksi spesifik seperti warna branding, regulasi OJK/HIPAA, atau aturan keamanan..."
                value={formData.additionalPrompt}
                onChange={(e) => setFormData({ ...formData, additionalPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
              />
            </div>

            {/* Footer Form Action */}
            <div className="pt-4 border-t border-gray-100/10 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#B11226] to-[#7A0C12] hover:opacity-95 rounded-2xl shadow-md shadow-[#B11226]/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate PRD Lengkap (36 Poin)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
