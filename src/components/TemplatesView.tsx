import React from 'react';
import { Search, Sparkles, FolderOpen, ArrowRight, Star, Layers, Check } from 'lucide-react';
import { TemplatePreset } from '../types';
import { TEMPLATES } from '../data/templates';

interface TemplatesViewProps {
  onSelectTemplate: (tpl: TemplatePreset) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const categories = ['All', 'SaaS & AI', 'Retail & POS', 'Mobile', 'Enterprise', 'Education'];

  const filtered = TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      (selectedCategory === 'SaaS & AI' && (tpl.category === 'AI SaaS' || tpl.category === 'Website')) ||
      (selectedCategory === 'Retail & POS' && (tpl.category === 'POS' || tpl.category === 'E-Commerce')) ||
      (selectedCategory === 'Mobile' && tpl.category === 'Mobile App') ||
      (selectedCategory === 'Enterprise' && (tpl.category === 'ERP' || tpl.category === 'CRM' || tpl.category === 'Fintech')) ||
      (selectedCategory === 'Education' && (tpl.category === 'LMS' || tpl.category === 'Education'));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans text-gray-900 dark:text-gray-100">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#B11226]/20 rounded-full blur-3xl pointer-events-none" />
        <span className="px-3 py-1 rounded-full bg-[#B11226]/30 text-red-300 text-xs font-bold uppercase tracking-wider inline-block">
          16 Template Industri Siap Pakai
        </span>
        <h1 className="text-3xl font-black tracking-tight">Galeri Template PRD Spesifikasi Tinggi</h1>
        <p className="text-gray-400 max-w-2xl text-xs sm:text-sm">
          Hemat waktu perencanaan proyek. Pilih template yang paling mendekati produk Anda dan biarkan Gemini AI menyusun seluruh dokumen 36 poin secara otomatis.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#B11226] text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:border-[#B11226]"
          />
        </div>
      </div>

      {/* Grid of 16 Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => onSelectTemplate(tpl)}
            className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#B11226] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {tpl.category}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#B11226]/10 text-[#B11226]">
                  {tpl.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#B11226] transition-colors">
                {tpl.title}
              </h3>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                {tpl.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-[#B11226]">
              <span>Gunakan Template Ini</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
