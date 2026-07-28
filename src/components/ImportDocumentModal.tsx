import React from 'react';
import { FileUp, FileText, Sparkles, X, ArrowRight } from 'lucide-react';
import { PRDDocument } from '../types';

interface ImportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedPrd: PRDDocument) => void;
}

export const ImportDocumentModal: React.FC<ImportDocumentModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [pastedText, setPastedText] = React.useState('');
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPastedText(content);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!pastedText.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const titleLine = pastedText.split('\n')[0]?.replace(/^#+\s*/, '').trim() || 'Imported PRD Document';
      const nowIso = new Date().toISOString();

      const newPrd: PRDDocument = {
        id: `prd-${Date.now()}`,
        title: titleLine.slice(0, 60),
        workspaceId: 'ws-1',
        createdAt: nowIso,
        updatedAt: nowIso,
        lastEdited: 'Baru saja',
        isFavorite: false,
        isArchived: false,
        inTrash: false,
        status: 'draft',
        version: '1.0.0',
        tags: ['Impor', 'Markdown', 'AI'],
        category: 'AI SaaS',
        platform: 'Web',
        complexity: 'Medium (3-6 Sprints)',
        author: 'M. Ihwal Maulana',
        inputs: {
          projectName: titleLine,
          category: 'AI SaaS',
          platform: 'Web',
          targetUser: 'Pengguna Umum',
          problemStatement: 'Dokumen diimpor dari berkas eksternal.',
          solution: 'Solusi terotomatisasi dengan AI Generator.',
          mainFeatures: 'Fitur Utama Impor',
          businessGoals: 'Efisiensi Pengkodean',
          deadline: 'Q3 2026',
          techStack: {
            frontend: 'React 19 + TypeScript',
            backend: 'Express.js',
            database: 'PostgreSQL',
            authentication: 'OAuth 2.0',
            hosting: 'Cloud Run',
            apiIntegrations: 'Gemini AI API',
          },
          complexity: 'Medium (3-6 Sprints)',
        },

        executiveSummary: pastedText.slice(0, 300) + '...',
        problemStatement: 'Dokumen diimpor dari berkas eksternal. Struktur telah disesuaikan oleh AI Engine.',
        goals: {
          businessGoals: ['Meningkatkan otomatisasi alur kerja', 'Memastikan keterbacaan spesifikasi oleh AI Coding Agent'],
          nonGoals: ['Perubahan arsitektur sistem inti'],
        },
        successMetrics: [
          { metric: 'Akurasi Pengkodean AI', target: '> 95%', timeframe: 'Q3 2026' }
        ],
        businessRequirements: ['Proses dokumen otomatis', 'Dukungan parsing markdown'],
        functionalRequirements: [
          {
            id: 'REQ-IMP-001',
            feature: 'Fitur Utama Hasil Impor',
            description: 'Dokumen dikonversi menjadi spesifikasi terstruktur.',
            userStory: 'Sebagai pengguna, saya ingin dokumen terstruktur otomatis agar siap dikirim ke AI Agent.',
            priority: 'P0',
            acceptanceCriteria: ['Given berkas markdown valid, When diimpor, Then terurai ke skema PRD']
          }
        ],
        nonFunctionalRequirements: [
          { category: 'Performa', requirement: 'Waktu respon impor < 2 detik', target: '2s' }
        ],
        userPersonas: [
          { name: 'Developer', role: 'Implementor', painPoints: ['Dokumen tidak jelas'], goals: ['Spesifikasi presisi'] }
        ],
        stakeholders: [
          { role: 'Product Manager', responsibility: 'Review & approval', impact: 'High' }
        ],
        scope: {
          inScope: ['Modul Impor Dokumen', 'Generasi Prompt AI'],
          outOfScope: ['Migrasi data warisan']
        },
        userJourney: [
          { step: 1, userAction: 'Unggah berkas', systemResponse: 'Sistem mengurai konten', keyTouchpoint: 'Halaman Impor' }
        ],
        flowDiagram: {
          nodes: [{ id: 'n1', label: 'Mulai Impor', type: 'start' }],
          edges: []
        },
        informationArchitecture: {
          pages: [{ title: 'Main View', path: '/', components: ['Importer'] }]
        },
        featureList: [
          { name: 'Parser Dokumen', category: 'MoSCoW - Must', effort: 'Small', description: 'Ekstraksi teks markdown' }
        ],
        acceptanceCriteriaSummary: ['Validasi sintaks markdown'],
        securityRequirements: ['Proteksi OWASP Top 10', 'Sanitasi input markdown'],
        accessibilityStandards: ['Standard WCAG 2.1 AA'],
        performanceTargets: [{ metric: 'Import Latency', target: '< 1s' }],
        apiSpecification: [
          { method: 'POST', endpoint: '/api/v1/import', description: 'Endpoint parsing dokumen' }
        ],
        databaseDesign: {
          tables: [
            {
              name: 'imported_documents',
              description: 'Tabel penyimpan dokumen hasil impor',
              columns: [
                { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY' },
                { name: 'raw_content', type: 'TEXT', constraints: 'NOT NULL' }
              ]
            }
          ]
        },
        entityRelationshipSummary: 'Tabel imported_documents independen.',
        rolePermissions: [{ role: 'Admin', permissions: ['Full Access'] }],
        notificationFlow: [],
        uiRequirements: ['Layout bersih dan responsif'],
        designSystem: {
          colors: {
            primary: '#B11226',
            darkRed: '#7A0C12',
            background: '#FAFAFA',
            surface: '#FFFFFF',
          },
          typography: 'Plus Jakarta Sans',
          spacing: '8px',
          borderRadius: '12px',
        },
        componentList: [],
        responsiveRequirements: [],
        seoRequirements: [],
        analyticsStrategy: [],
        testingStrategy: [],
        deploymentStrategy: [{ stage: 'Production', environment: 'Cloud Run', ciCdPipeline: 'GitHub Actions' }],
        riskAssessment: [
          { risk: 'Ketidakcocokan format header', impact: 'Low', likelihood: 'Low', mitigation: 'Sediakan parser fleksibel berbasis LLM' }
        ],
        futureRoadmap: [
          { phase: 'Phase 1', timeframe: 'Week 1', deliverables: ['Fitur Impor V1'] }
        ],
        taskBreakdown: [],
        sprintPlanning: [],
        releaseChecklist: [],
        aiCodingPrompt: `# PROMPT ENGINE FOR CURSOR / CLAUDE CODE\nImplementasikan fitur berdasarkan dokumen impor: ${titleLine}`,
      };

      onImportSuccess(newPrd);
      onClose();
    }, 700);
  };

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
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Import Dokumen PRD</h3>
            <p className="text-gray-500 text-[11px]">Unggah berkas Markdown (.md), Text (.txt), atau tempel teks langsung</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <label className="border-2 border-dashed border-gray-200  dark:border-gray-700 hover:border-[#B11226] rounded-2xl p-6 text-center cursor-pointer block transition-colors bg-gray-50/50 dark:bg-gray-800/30">
            <input type="file" accept=".md,.txt,.json,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="font-bold text-gray-800 dark:text-gray-200 block text-xs">
              {fileName ? `Berkas terpilih: ${fileName}` : 'Klik untuk memilih berkas dari komputer'}
            </span>
            <span className="text-[10px] text-gray-400 block mt-1">Mendukung .MD, .TXT, .JSON</span>
          </label>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Atau Tempelkan Teks Dokumen
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="# Judul PRD Aplikasi...\n\n## Ringkasan Eksekutif\nAplikasi ini bertujuan untuk..."
              className="w-full p-3 rounded-2xl border border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B11226]/50 font-mono text-[11px]"
            />
          </div>

          <button
            onClick={handleProcessImport}
            disabled={!pastedText.trim() || isProcessing}
            className="w-full py-3 px-4 rounded-2xl bg-[#B11226] hover:bg-[#900E1F] transition-colors text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-[#B11226]/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <span>Mengurai Dokumen dengan AI...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Konversi ke Spesifikasi PRD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
