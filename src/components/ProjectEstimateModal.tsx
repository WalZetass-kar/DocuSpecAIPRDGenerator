import React from 'react';
import { Calculator, Clock, DollarSign, Layers, Cpu, CheckCircle2, X } from 'lucide-react';
import { PRDDocument } from '../types';

interface ProjectEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  prds: PRDDocument[];
}

export const ProjectEstimateModal: React.FC<ProjectEstimateModalProps> = ({ isOpen, onClose, prds }) => {
  const [selectedPrdId, setSelectedPrdId] = React.useState(prds[0]?.id || '');
  const [ratePerHour, setRatePerHour] = React.useState(45);

  if (!isOpen) return null;

  const currentPrd = prds.find((p) => p.id === selectedPrdId) || prds[0];
  const reqCount = currentPrd?.functionalRequirements?.length || 4;
  const isComplex = currentPrd?.databaseDesign?.tables && currentPrd.databaseDesign.tables.length > 2;

  // Estimation math
  const estimatedHours = reqCount * 32 + (isComplex ? 80 : 40);
  const estimatedWeeks = Math.ceil(estimatedHours / 40);
  const estimatedSprints = Math.ceil(estimatedWeeks / 2);
  const totalCost = estimatedHours * ratePerHour;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 animate-fade-in text-xs">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200  dark:border-gray-800 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Estimasi Durasi & Biaya Proyek</h3>
            <p className="text-gray-500 text-[11px]">Kalkulasi beban kerja berdasarkan spesifikasi PRD AI</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Select PRD */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Pilih Dokumen PRD untuk Diestimasi
            </label>
            <select
              value={selectedPrdId}
              onChange={(e) => setSelectedPrdId(e.target.value)}
              className="w-full p-2.5 rounded-2xl border border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-xs"
            >
              {prds.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Rate per hour adjustment */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                Tarif Pengembang / Jam ($ USD)
              </label>
              <span className="font-bold text-[#B11226]">${ratePerHour} / jam</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={ratePerHour}
              onChange={(e) => setRatePerHour(Number(e.target.value))}
              className="w-full accent-[#B11226]"
            />
          </div>

          {/* Result Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 text-white space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Estimasi Durasi</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black">{estimatedWeeks} Minggu</span>
                <span className="text-xs text-gray-400">({estimatedSprints} Sprint)</span>
              </div>
              <p className="text-[10px] text-gray-400">Total {estimatedHours} jam kerja pengkodean</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Proyeksi Anggaran</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                ${totalCost.toLocaleString()} USD
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Berdasarkan tarif tim pengembang</p>
            </div>
          </div>

          {/* Breakdown checklist */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200  dark:border-gray-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Rincian Komponen PRD</span>
            <div className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>User Stories & Acceptance Criteria ({reqCount} fitur)</span>
                <span className="font-mono font-bold">{reqCount * 32} Jam</span>
              </div>
              <div className="flex justify-between">
                <span>Skema Database & Migrasi Endpoint</span>
                <span className="font-mono font-bold">{isComplex ? '80 Jam' : '40 Jam'}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100/10 dark:border-gray-700 pt-1 font-bold text-gray-900 dark:text-white">
                <span>Pengujian Integrasi & QA CI/CD</span>
                <span className="font-mono text-[#B11226]">Selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
