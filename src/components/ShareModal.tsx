import React from 'react';
import { X, Share2, Copy, Check, Lock, Globe, Users } from 'lucide-react';
import { PRDDocument } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  prd: PRDDocument;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, prd }) => {
  const [copied, setCopied] = React.useState(false);
  const [accessLevel, setAccessLevel] = React.useState<'view' | 'edit'>('view');

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/prd/${prd.id}?access=${accessLevel}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200  dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-gray-900 dark:text-gray-100 text-xs">
        {/* Header */}
        <div className="p-5 border-b border-gray-100/10 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B11226]/10 text-[#B11226] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Bagikan Proyek PRD</h3>
              <p className="text-[11px] text-gray-500">Kelola akses kolaborasi tim.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-gray-300">Hak Akses Tautan</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAccessLevel('view')}
                className={`p-2.5 rounded-2xl border text-left font-semibold transition-colors flex items-center gap-2 ${
                  accessLevel === 'view'
                    ? 'border-[#B11226] bg-[#B11226]/10 text-[#B11226]'
                    : 'border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Hanya Lihat (View Only)</span>
              </button>

              <button
                onClick={() => setAccessLevel('edit')}
                className={`p-2.5 rounded-2xl border text-left font-semibold transition-colors flex items-center gap-2 ${
                  accessLevel === 'edit'
                    ? 'border-[#B11226] bg-[#B11226]/10 text-[#B11226]'
                    : 'border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Bisa Sunting (Can Edit)</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-gray-300">Tautan Langsung</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 p-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200  dark:border-gray-700 rounded-2xl font-mono text-[11px] text-gray-600 dark:text-gray-300 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#B11226] hover:bg-[#900E1F] transition-colors text-white font-bold rounded-2xl transition-colors shrink-0 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tercopy' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
