import React from 'react';
import { Sparkles, FileText, BookOpen, ShieldCheck, Github, Heart } from 'lucide-react';

interface FooterProps {
  onViewChange?: (view: 'dashboard' | 'editor' | 'templates' | 'landing') => void;
  onOpenGuideModal?: () => void;
  onOpenTeamModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onViewChange,
  onOpenGuideModal,
  onOpenTeamModal,
}) => {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors font-sans text-xs mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          {/* Brand Info */}
          <div className="space-y-1.5 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#B11226] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                DS
              </div>
              <span className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">
                DocuSpec <span className="text-[#B11226] font-normal text-xs">PRD AI Engine</span>
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">
              Platform standar industri pembuatan dokumen spesifikasi produk (PRD) 36 poin presisi tinggi untuk AI Coding Agent & Software Engineers.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 dark:text-gray-300 font-medium text-[11px]">
            <button
              onClick={() => onViewChange && onViewChange('dashboard')}
              className="hover:text-[#B11226] transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => onViewChange && onViewChange('templates')}
              className="hover:text-[#B11226] transition-colors cursor-pointer"
            >
              Template PRD
            </button>
            <button
              onClick={onOpenGuideModal}
              className="hover:text-[#B11226] transition-colors cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#B11226]" />
              <span>Dokumentasi & Panduan</span>
            </button>
            <button
              onClick={onOpenTeamModal}
              className="hover:text-[#B11226] transition-colors cursor-pointer"
            >
              Manajemen Tim
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>© {new Date().getFullYear()} DocuSpecAIPRDGenerator. Built with</span>
            <Heart className="w-3.5 h-3.5 text-[#B11226] fill-[#B11226]" />
            <span>Owned by WalZetass-Kar.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B11226]" /> Powered by Gemini AI
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
              v2.4.0 Production Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
