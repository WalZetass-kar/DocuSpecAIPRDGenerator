import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, X, Wand2, Loader2, RefreshCw, ShieldAlert, Info } from 'lucide-react';
import { PRDDocument } from '../types';
import { generateContent } from '../lib/gemini';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  prd: PRDDocument;
  onUpdatePRD: (updated: PRDDocument) => void;
}

interface ReviewItem {
  type: 'good' | 'warning' | 'error' | 'info';
  title: string;
  detail: string;
}

interface ReviewResult {
  score: number;
  summary: string;
  items: ReviewItem[];
}

export const AIReviewModal: React.FC<AIReviewModalProps> = ({ isOpen, onClose, prd }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ReviewResult | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isOpen && !result) {
      runReview();
    }
  }, [isOpen]);

  const runReview = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    const prompt = `Kamu adalah seorang Principal Product Manager dan Tech Lead senior.
Review PRD berikut secara kritis dan berikan evaluasi dalam format JSON.

Judul PRD: "${prd.title}"
Kategori: ${prd.category}
Platform: ${prd.platform}

Executive Summary:
${prd.executiveSummary?.slice(0, 500)}

Problem Statement:
${prd.problemStatement?.slice(0, 400)}

Goals:
${prd.goals?.businessGoals?.slice(0, 5).join(', ')}

Functional Requirements (jumlah): ${prd.functionalRequirements?.length || 0}
Success Metrics (jumlah): ${prd.successMetrics?.length || 0}
API Endpoints (jumlah): ${prd.apiSpecification?.length || 0}
User Personas (jumlah): ${prd.userPersonas?.length || 0}

Berikan review dalam format JSON PERSIS seperti ini:
{
  "score": <angka 0-100>,
  "summary": "<1-2 kalimat ringkasan kualitas PRD ini>",
  "items": [
    {
      "type": "good",
      "title": "<aspek yang sudah bagus>",
      "detail": "<penjelasan singkat mengapa ini bagus>"
    },
    {
      "type": "warning",
      "title": "<aspek yang perlu diperbaiki>",
      "detail": "<saran spesifik perbaikan>"
    },
    {
      "type": "error",
      "title": "<aspek yang kurang atau hilang>",
      "detail": "<apa yang harus ditambahkan>"
    }
  ]
}

Berikan minimal 2 item "good", minimal 2 item "warning" atau "error". Semua dalam bahasa Indonesia. Hanya balas dengan JSON, tanpa teks lain.`;

    try {
      const raw = await generateContent(prompt, 'Kamu adalah AI reviewer PRD profesional. Balas HANYA dalam format JSON valid.');
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed: ReviewResult = JSON.parse(clean);
      setResult(parsed);
    } catch (e: any) {
      if (e.message?.includes('Credits') || e.message?.includes('Poin')) {
        setError(e.message);
      } else {
        setError('Gagal menganalisis PRD. Coba lagi.');
      }
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getItemStyle = (type: ReviewItem['type']) => {
    switch (type) {
      case 'good': return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
      case 'warning': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
      case 'error': return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      default: return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    }
  };

  const getItemIcon = (type: ReviewItem['type']) => {
    switch (type) {
      case 'good': return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
      case 'error': return <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />;
      default: return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const getItemTextColor = (type: ReviewItem['type']) => {
    switch (type) {
      case 'good': return { title: 'text-emerald-900 dark:text-emerald-300', detail: 'text-emerald-700 dark:text-emerald-400' };
      case 'warning': return { title: 'text-amber-900 dark:text-amber-300', detail: 'text-amber-700 dark:text-amber-400' };
      case 'error': return { title: 'text-red-900 dark:text-red-300', detail: 'text-red-700 dark:text-red-400' };
      default: return { title: 'text-blue-900 dark:text-blue-300', detail: 'text-blue-700 dark:text-blue-400' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#B11226] text-white flex items-center justify-center shadow-md shadow-[#B11226]/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI Review & Audit Spesifikasi</h3>
            <p className="text-gray-500 text-[11px] truncate max-w-[300px]">{prd.title}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Score Card */}
          <div className="p-4 rounded-2xl bg-gray-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Kesiapan AI Agent (Cursor/Claude)</span>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400 font-bold">Menganalisis...</span>
                </div>
              ) : result ? (
                <span className={`text-3xl font-black ${getScoreColor(result.score)}`}>{result.score} / 100</span>
              ) : (
                <span className="text-3xl font-black text-gray-500">— / 100</span>
              )}
            </div>
            <button
              onClick={runReview}
              disabled={isLoading}
              className="px-4 py-2 bg-[#B11226] hover:bg-[#900E1F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer text-xs"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isLoading ? 'Memindai...' : 'Audit Ulang'}</span>
            </button>
          </div>

          {/* Summary */}
          {result?.summary && (
            <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 leading-relaxed">
              💡 {result.summary}
            </p>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#B11226]" />
              <p className="text-sm text-gray-500 font-medium">AI sedang menganalisis PRD Anda...</p>
              <p className="text-xs text-gray-400">Memeriksa kelengkapan, konsistensi, dan kualitas spesifikasi</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
              <ShieldAlert className="w-8 h-8 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
              <button onClick={runReview} className="px-4 py-2 bg-[#B11226] text-white rounded-xl text-xs font-bold hover:bg-[#900E1F]">
                Coba Lagi
              </button>
            </div>
          )}

          {/* Review Items */}
          {result && !isLoading && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Hasil Pemeriksaan ({result.items.length} poin)
              </span>
              {result.items.map((item, idx) => {
                const colors = getItemTextColor(item.type);
                return (
                  <div key={idx} className={`p-3 rounded-2xl border flex items-start gap-2.5 ${getItemStyle(item.type)}`}>
                    {getItemIcon(item.type)}
                    <div>
                      <span className={`font-bold block text-xs ${colors.title}`}>{item.title}</span>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${colors.detail}`}>{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
