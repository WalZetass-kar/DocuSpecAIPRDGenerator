import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wand2,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Layers,
  Code2,
  Database,
  Terminal,
  Activity,
  X,
  Loader2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { PRDDocument } from '../types';
import { supabase } from '../lib/supabase';

interface AIInsightsPanelProps {
  prd: PRDDocument;
  onUpdatePRD: (updated: PRDDocument) => void;
  isOpen: boolean;
  onClose: () => void;
  onJumpToSection?: (sectionId: string) => void;
}

export interface InsightItem {
  id: string;
  type: 'critical' | 'warning' | 'suggestion';
  category: 'vision' | 'spec' | 'architecture' | 'security' | 'ai_prompt';
  title: string;
  description: string;
  sectionId: string;
  actionType?: string;
  actionLabel?: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  prd,
  onUpdatePRD,
  isOpen,
  onClose,
  onJumpToSection,
}) => {
  const [applyingId, setApplyingId] = React.useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);

  // Analyze PRD Real-Time
  const analysis = React.useMemo(() => {
    let score = 0;
    const maxScore = 100;
    const insights: InsightItem[] = [];

    // 1. Executive Summary & Problem Statement (10 pts)
    const hasSummary = prd.executiveSummary && prd.executiveSummary.length > 50;
    const hasProblem = prd.problemStatement && prd.problemStatement.length > 30;
    if (hasSummary && hasProblem) score += 10;
    else if (hasSummary || hasProblem) score += 5;
    else {
      insights.push({
        id: 'ins-summary',
        type: 'critical',
        category: 'vision',
        title: 'Executive Summary & Problem Statement Belum Lengkap',
        description: 'Ringkasan eksekutif dan problem statement membutuhkan perincian agar konteks bisnis jelas.',
        sectionId: 'sec-summary',
        actionType: 'add_missing',
        actionLabel: 'Lengkapi Ringkasan dengan AI',
      });
    }

    // 2. Business Goals & Success Metrics / KPIs (10 pts)
    const hasGoals = prd.goals?.businessGoals && prd.goals.businessGoals.length > 0;
    const hasMetrics = prd.successMetrics && prd.successMetrics.length > 0;
    if (hasGoals && hasMetrics) score += 10;
    else score += 5;

    // 3. Functional Requirements & User Stories (10 pts)
    const funcReqs = prd.functionalRequirements || [];
    if (funcReqs.length >= 3) score += 10;
    else score += 4;

    // 4. Technical Architecture & Tech Stack (10 pts)
    const hasTechStack = Boolean(prd.inputs?.techStack?.frontend && prd.inputs?.techStack?.backend);
    if (hasTechStack) score += 10;
    else score += 5;

    // 5. Database Schema & ERD (10 pts)
    const hasDb = prd.databaseDesign && prd.databaseDesign.tables && prd.databaseDesign.tables.length > 0;
    if (hasDb) score += 10;
    else score += 4;

    // 6. API Specification & Endpoints (10 pts)
    const hasApi = prd.apiSpecification && prd.apiSpecification.length > 0;
    if (hasApi) score += 10;
    else score += 4;

    // 7. Security & Accessibility Compliance (10 pts)
    const hasSecurity = prd.securityRequirements && prd.securityRequirements.length > 0;
    if (hasSecurity) score += 10;
    else score += 4;

    // 8. Testing Strategy & QA Readiness (10 pts)
    const hasTesting = prd.testingStrategy && prd.testingStrategy.length > 0;
    if (hasTesting) score += 10;
    else score += 4;

    // 9. Deployment, CI/CD & Risk Assessment (10 pts)
    const hasDeployment = prd.deploymentStrategy && Boolean(prd.deploymentStrategy);
    const hasRisks = prd.riskAssessment && prd.riskAssessment.length > 0;
    if (hasDeployment && hasRisks) score += 10;
    else score += 5;

    // 10. AI Coding Prompt Quality (10 pts)
    const hasPrompt = prd.aiCodingPrompt && prd.aiCodingPrompt.length > 100;
    if (hasPrompt) score += 10;
    else score += 4;

    // Category Breakdowns
    const catScores = {
      vision: hasSummary && hasProblem ? (hasGoals ? 98 : 85) : 60,
      spec: funcReqs.length >= 3 ? 98 : 70,
      architecture: hasApi && hasDb ? 98 : 75,
      security: hasSecurity && hasRisks ? 98 : 70,
      ai_prompt: hasPrompt ? 98 : 65,
    };

    return {
      totalScore: Math.min(score, maxScore),
      catScores,
      insights,
    };
  }, [prd]);

  // Apply AI Fix handler
  const handleApplyAIFix = async (insight: InsightItem) => {
    setApplyingId(insight.id);
    setFeedbackMsg(null);

    try {
      const { refinePRD } = await import('../lib/gemini');
      const res = await refinePRD(prd, insight.actionType || 'add_missing', insight.description);

      if (res.success && res.data) {
        if (res.data.updatedSections && Object.keys(res.data.updatedSections).length > 0) {
          onUpdatePRD({ ...prd, ...res.data.updatedSections });
          setFeedbackMsg(`Seksi berhasil diperbarui berdasarkan analisis AI!`);
        } else {
          setFeedbackMsg(res.data.summary || 'AI rekomendasi telah disiapkan.');
        }
      } else {
        setFeedbackMsg('Gagal memproses rekomendasi AI.');
      }
    } catch (err) {
      console.error('Error applying AI insight:', err);
      setFeedbackMsg('Terjadi kesalahan koneksi.');
    } finally {
      setApplyingId(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full lg:w-72 xl:w-80 min-w-0 max-w-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4 shrink-0 flex flex-col h-[calc(100vh-4rem)] sticky top-16 custom-scrollbar text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#B11226] text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-xs">AI Insights</h3>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Analisis Real-Time Aktif</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Tutup Panel AI Insights"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 py-3 custom-scrollbar">
        {/* Score Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white space-y-3 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#B11226]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Skor Kelengkapan PRD
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                analysis.totalScore >= 80
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : analysis.totalScore >= 60
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {analysis.totalScore >= 80 ? 'Siap AI Agent' : 'Perlu Dipertajam'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{analysis.totalScore}%</span>
            <span className="text-gray-400 text-xs">/ 100% Kualitas Spesifikasi</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#B11226] via-amber-500 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${analysis.totalScore}%` }}
            />
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">
            {analysis.totalScore >= 85
              ? 'PRD ini sangat komprehensif dan siap dikonsumsi langsung oleh Cursor atau Claude Code.'
              : 'Beberapa poin teknis disarankan untuk dilengkapi agar terhindar dari ambigu pengkodean.'}
          </p>
        </div>

        {/* Feedback Alert if applicable */}
        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Category Breakdown Progress */}
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Kategori Spesifikasi
          </span>

          <div className="space-y-2 text-[11px]">
            <div>
              <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Visi & Metrik</span>
                <span>{analysis.catScores.vision}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#B11226] h-full transition-all duration-300"
                  style={{ width: `${analysis.catScores.vision}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Fungsional & User Stories</span>
                <span>{analysis.catScores.spec}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${analysis.catScores.spec}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Arsitektur & API</span>
                <span>{analysis.catScores.architecture}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-300"
                  style={{ width: `${analysis.catScores.architecture}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Keamanan & Risiko</span>
                <span>{analysis.catScores.security}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${analysis.catScores.security}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Recommendations Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Rekomendasi Perbaikan ({analysis.insights.length})
            </span>
          </div>

          {analysis.insights.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                Spesifikasi Sempurna!
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Tidak ada poin kritis yang perlu diperbaiki saat ini.
              </p>
            </div>
          ) : (
            analysis.insights.map((ins) => {
              const isApplying = applyingId === ins.id;
              return (
                <div
                  key={ins.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                    ins.type === 'critical'
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                      : ins.type === 'warning'
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-xs leading-tight">
                      {ins.type === 'critical' ? (
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                      ) : ins.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <span>{ins.title}</span>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                        ins.type === 'critical'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                          : ins.type === 'warning'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                      }`}
                    >
                      {ins.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    {ins.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-gray-200/60 dark:border-gray-800">
                    {onJumpToSection && (
                      <button
                        onClick={() => onJumpToSection(ins.sectionId)}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                      >
                        <span>Ke Seksi</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() => handleApplyAIFix(ins)}
                      disabled={isApplying}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B11226] hover:bg-[#7A0C12] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-white" />
                          <span>Memproses AI...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3 text-white" />
                          <span>{ins.actionLabel || 'Sempurnakan AI'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
