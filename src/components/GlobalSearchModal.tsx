import React from 'react';
import { Search, X, FileText, Tag, Star, ArrowRight, Hash, Cpu, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import { PRDDocument } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  prds: PRDDocument[];
  onSelectPRD: (prd: PRDDocument) => void;
}

interface SearchMatch {
  prd: PRDDocument;
  matchedIn: string; // e.g. "Executive Summary", "Fitur: Login"
  snippet: string;   // highlighted snippet
  matchType: 'title' | 'tag' | 'content' | 'api' | 'feature';
}

function highlight(text: string, term: string): string {
  if (!term.trim()) return text;
  return text.replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '**$1**');
}

function getSnippet(text: string, term: string, maxLen = 100): string {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text.slice(0, maxLen) + '...';
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + term.length + 60);
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}

function searchPRDs(prds: PRDDocument[], term: string): SearchMatch[] {
  if (!term.trim()) return [];
  const results: SearchMatch[] = [];
  const termLower = term.toLowerCase();

  prds.filter(p => !p.inTrash).forEach(prd => {
    // 1. Title match
    if (prd.title.toLowerCase().includes(termLower)) {
      results.push({ prd, matchedIn: 'Judul Dokumen', snippet: prd.title, matchType: 'title' });
      return; // one result per PRD for title
    }

    // 2. Tags
    const matchTag = prd.tags?.find(t => t.toLowerCase().includes(termLower));
    if (matchTag) {
      results.push({ prd, matchedIn: `Tag: #${matchTag}`, snippet: prd.tags?.join(', ') || '', matchType: 'tag' });
      return;
    }

    // 3. Executive Summary
    if (prd.executiveSummary?.toLowerCase().includes(termLower)) {
      results.push({ prd, matchedIn: 'Executive Summary', snippet: getSnippet(prd.executiveSummary, term), matchType: 'content' });
      return;
    }

    // 4. Problem Statement
    if (prd.problemStatement?.toLowerCase().includes(termLower)) {
      results.push({ prd, matchedIn: 'Problem Statement', snippet: getSnippet(prd.problemStatement, term), matchType: 'content' });
      return;
    }

    // 5. Functional Requirements
    const matchReq = prd.functionalRequirements?.find(r =>
      r.feature?.toLowerCase().includes(termLower) || r.userStory?.toLowerCase().includes(termLower)
    );
    if (matchReq) {
      results.push({ prd, matchedIn: `Fitur: ${matchReq.feature}`, snippet: matchReq.userStory || matchReq.feature, matchType: 'feature' });
      return;
    }

    // 6. API endpoints
    const matchApi = prd.apiSpecification?.find(a =>
      a.endpoint?.toLowerCase().includes(termLower) || a.description?.toLowerCase().includes(termLower)
    );
    if (matchApi) {
      results.push({ prd, matchedIn: `API: ${matchApi.method} ${matchApi.endpoint}`, snippet: matchApi.description || matchApi.endpoint, matchType: 'api' });
      return;
    }

    // 7. Category / Platform
    if (prd.category?.toLowerCase().includes(termLower) || prd.platform?.toLowerCase().includes(termLower)) {
      results.push({ prd, matchedIn: `Kategori: ${prd.category}`, snippet: `${prd.category} · ${prd.platform}`, matchType: 'content' });
    }
  });

  return results;
}

const matchTypeIcon = (type: SearchMatch['matchType']) => {
  switch (type) {
    case 'title': return <FileText className="w-4 h-4 text-[#B11226]" />;
    case 'tag': return <Hash className="w-4 h-4 text-purple-500" />;
    case 'api': return <Cpu className="w-4 h-4 text-blue-500" />;
    case 'feature': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    default: return <FileText className="w-4 h-4 text-gray-400" />;
  }
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  prds,
  onSelectPRD,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('All');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(prds.map(p => p.category).filter(Boolean)))];

  // Smart deep search
  const searchResults: SearchMatch[] = React.useMemo ? 
    React.useMemo(() => searchPRDs(prds, searchTerm).filter(r =>
      selectedCategory === 'All' || r.prd.category === selectedCategory
    ), [prds, searchTerm, selectedCategory])
    : searchPRDs(prds, searchTerm).filter(r =>
      selectedCategory === 'All' || r.prd.category === selectedCategory
    );

  // When no search term, show recent PRDs
  const recentPRDs = prds.filter(p => !p.inTrash).slice(0, 5);

  const SnippetText = ({ text, term }: { text: string; term: string }) => {
    if (!term.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase()
            ? <mark key={i} className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded px-0.5">{part}</mark>
            : part
        )}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-gray-900/60 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-gray-900 dark:text-gray-100 text-xs">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari judul, konten, fitur, API, tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400 dark:text-white"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-500">ESC</kbd>
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#B11226] text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#B11226]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {!searchTerm ? (
            // Recent PRDs (no search term)
            <div>
              <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                PRD Terbaru
              </div>
              {recentPRDs.map(prd => (
                <button
                  key={prd.id}
                  onClick={() => { onSelectPRD(prd); onClose(); }}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#B11226]/10 text-[#B11226] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{prd.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{prd.category} · {prd.platform}</p>
                    </div>
                  </div>
                  {prd.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700" />
              <p className="font-semibold text-sm">Tidak ditemukan hasil untuk <span className="text-[#B11226]">"{searchTerm}"</span></p>
              <p className="text-[11px]">Coba cari judul, nama fitur, endpoint API, atau tag.</p>
            </div>
          ) : (
            <div>
              <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Hasil Pencarian</span>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{searchResults.length} ditemukan</span>
              </div>
              {searchResults.map((result, idx) => (
                <button
                  key={`${result.prd.id}-${idx}`}
                  onClick={() => { onSelectPRD(result.prd); onClose(); }}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start justify-between group text-left border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                      {matchTypeIcon(result.matchType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{result.prd.title}</p>
                      <p className="text-[10px] text-[#B11226] font-semibold mt-0.5">{result.matchedIn}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        <SnippetText text={result.snippet} term={searchTerm} />
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#B11226] group-hover:translate-x-1 transition-all shrink-0 mt-2 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px]">↵</kbd> Buka</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px]">ESC</kbd> Tutup</span>
          </span>
          <span>Mencari dalam judul, konten, fitur & API</span>
        </div>
      </div>
    </div>
  );
};
