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

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200  dark:border-gray-800 shadow-2xl p-6 flex flex-col justify-between custom-scrollbar animate-slide-left text-xs font-sans text-gray-900 dark:text-gray-100">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100/10 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#B11226]" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Riwayat Versi (Version History)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-500 text-[11px]">
          DocuSpec AI menyimpan otomatis setiap perubahan. Anda dapat meninjau snapshot dan memulihkan versi kapan saja.
        </p>

        <div className="space-y-3">
          {versions.map((ver, idx) => (
            <div
              key={ver.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-[#B11226] border-[#B11226]'
                  : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200  dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-[#B11226]">Versi {ver.versionNumber}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(ver.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-[11px] mb-2">
                {ver.summary}
              </p>
              {idx !== 0 && (
                <button
                  onClick={() => {
                    onRestoreVersion(ver.data);
                    onClose();
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#B11226] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Pulihkan Versi Ini</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
