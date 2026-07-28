import React from 'react';
import { X, History, RotateCcw, Clock, Check } from 'lucide-react';
import { PRDDocument, PRDVersionSnapshot } from '../types';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prd: PRDDocument;
  onRestoreVersion: (snapshot: PRDDocument) => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  prd,
  onRestoreVersion,
}) => {
  if (!isOpen) return null;

  // Mock version snapshots history
  const versions: PRDVersionSnapshot[] = [
    {
      id: 'v-1.2.0',
      prdId: prd.id,
      versionNumber: '1.2.0',
      savedAt: '2026-07-27T10:30:00Z',
      summary: 'Perbaikan Acceptance Criteria & Penambahan skema API',
      data: prd,
    },
    {
      id: 'v-1.1.0',
      prdId: prd.id,
      versionNumber: '1.1.0',
      savedAt: '2026-07-27T08:15:00Z',
      summary: 'Auto-generation awal oleh Gemini 3.6 Flash',
      data: { ...prd, version: '1.1.0' },
    },
    {
      id: 'v-1.0.0',
      prdId: prd.id,
      versionNumber: '1.0.0',
      savedAt: '2026-07-27T08:00:00Z',
      summary: 'Draf konsep pertama dibuat oleh Product Manager',
      data: { ...prd, version: '1.0.0' },
    },
  ];

  const [selectedDiffVersion, setSelectedDiffVersion] = React.useState<PRDVersionSnapshot | null>(null);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl p-6 flex flex-col justify-between custom-scrollbar animate-slide-left text-xs font-sans text-gray-900 dark:text-gray-100">
      <div className="space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100/10 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#B11226]" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Riwayat Versi & Diff Viewer</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-500 text-[11px]">
          DocuSpec AI menyimpan otomatis setiap snapshot. Anda dapat membandingkan perubahan (*Diff Viewer*) atau memulihkan versi lama.
        </p>

        <div className="space-y-3">
          {versions.map((ver, idx) => (
            <div
              key={ver.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-red-50/50 dark:bg-red-950/20 border-[#B11226]'
                  : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-[#B11226]">Versi {ver.versionNumber} {idx === 0 && '(Aktif)'}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(ver.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-[11px] mb-2">
                {ver.summary}
              </p>
              
              <div className="flex items-center gap-3 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={() => setSelectedDiffVersion(ver)}
                  className="text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#B11226] underline flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  <span>Lihat Perubahan (Diff)</span>
                </button>

                {idx !== 0 && (
                  <button
                    onClick={() => {
                      onRestoreVersion(ver.data);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#B11226] hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Pulihkan</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Diff Comparison Dialog */}
        {selectedDiffVersion && (
          <div className="p-4 rounded-2xl bg-gray-900 text-gray-100 border border-gray-800 space-y-3 mt-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="font-bold text-xs text-white">Visual Diff: Versi Sekarang vs {selectedDiffVersion.versionNumber}</span>
              <button onClick={() => setSelectedDiffVersion(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 font-mono text-[11px] max-h-48 overflow-y-auto custom-scrollbar p-2 bg-black/40 rounded-xl">
              <div className="p-2 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                + [Executive Summary Updated] {prd.executiveSummary?.slice(0, 90)}...
              </div>
              <div className="p-2 rounded bg-red-950/50 text-red-400 border border-red-800/50">
                - [Versi Lama {selectedDiffVersion.versionNumber}] {selectedDiffVersion.data.executiveSummary?.slice(0, 90)}...
              </div>
              <div className="p-2 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                + [User Stories] {prd.functionalRequirements?.length || 0} User Stories terkonfigurasi.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
