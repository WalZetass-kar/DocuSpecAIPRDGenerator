import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
  X,
  ChevronRight,
  Code2,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: 'panduan' | 'contoh' | 'best_practice' | 'cursor_integration';
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, activeTab = 'panduan' }) => {
  const [tab, setTab] = React.useState(activeTab);
  const [copiedCodeIndex, setCopiedCodeIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 text-xs font-sans">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200  dark:border-gray-800 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3.5 bg-gray-50/50 dark:bg-black/50">
          <div className="w-11 h-11 rounded-2xl bg-[#B11226]/10 text-[#B11226] flex items-center justify-center font-bold shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
              Pusat Dokumentasi & Panduan PRD AI
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              Standar industri pembuatan spesifikasi produk yang presisi untuk AI Coding Agent & Tim Engineer
            </p>
          </div>
        </div>

        {/* Sub-tabs Bar */}
        <div className="flex overflow-x-auto border-b border-gray-100/10 dark:border-gray-800 px-4 sm:px-6 bg-gray-50/80 dark:bg-gray-850/50 custom-scrollbar shrink-0">
          <button
            onClick={() => setTab('panduan')}
            className={`px-4 py-3 font-bold text-xs border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              tab === 'panduan'
                ? 'border-[#B11226] text-[#B11226]'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Panduan PRD</span>
          </button>

          <button
            onClick={() => setTab('contoh')}
            className={`px-4 py-3 font-bold text-xs border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              tab === 'contoh'
                ? 'border-[#B11226] text-[#B11226]'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Contoh PRD Industri</span>
          </button>

          <button
            onClick={() => setTab('best_practice')}
            className={`px-4 py-3 font-bold text-xs border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              tab === 'best_practice'
                ? 'border-[#B11226] text-[#B11226]'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Best Practices & Checklist</span>
          </button>

          <button
            onClick={() => setTab('cursor_integration')}
            className={`px-4 py-3 font-bold text-xs border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              tab === 'cursor_integration'
                ? 'border-[#B11226] text-[#B11226]'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Integrasi Cursor & Agent AI</span>
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 custom-scrollbar text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          {/* TAB 1: PANDUAN PRD */}
          {tab === 'panduan' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#B11226] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#B11226] dark:text-red-400 text-sm">
                    Mengapa PRD Sangat Penting untuk AI Coding Agent?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-normal">
                    AI Coding Agent (seperti Cursor AI, Antigravity, Claude Code) bekerja sangat cepat berdasarkan konteks teks. PRD yang ambigu atau terlalu umum akan menghasilkan kodingan yang salah arah. PRD yang terstruktur ketat menjamin hasil kodingan siap pakai tanpa bug arsitektur.
                  </p>
                </div>
              </div>

              {/* 6 Essential Sections */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B11226]" /> 6 Elemen Wajib PRD Standar Industri
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#B11226]/10 text-[#B11226] font-mono font-bold text-[10px]">
                      BAGIAN 1
                    </span>
                    <h5 className="font-bold text-gray-900 dark:text-white">Problem Statement & Vision</h5>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Jelaskan latar belakang masalah pengguna, KPI kesuksesan kuantitatif (misal: "Meningkatkan konversi pembayaran hingga 25%"), serta batasan solusi.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#B11226]/10 text-[#B11226] font-mono font-bold text-[10px]">
                      BAGIAN 2
                    </span>
                    <h5 className="font-bold text-gray-900 dark:text-white">User Persona & User Journey</h5>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Uraikan siapa target penggunanya (misal: UMKM Merchant) dan alur eksplorasi produk langkah demi langkah (Step 1 → Step 2 → Outcome).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#B11226]/10 text-[#B11226] font-mono font-bold text-[10px]">
                      BAGIAN 3
                    </span>
                    <h5 className="font-bold text-gray-900 dark:text-white">Functional Requirements & User Stories</h5>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Tuliskan fitur spesifik berformat: <em>"As a [user], I want [action] so that [benefit]"</em>. Hindari deskripsi terlalu abstrak.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#B11226]/10 text-[#B11226] font-mono font-bold text-[10px]">
                      BAGIAN 4
                    </span>
                    <h5 className="font-bold text-gray-900 dark:text-white">BDD Acceptance Criteria (Given-When-Then)</h5>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Kriteria kelulusan fitur wajib menggunakan BDD. Format ini dapat langsung diubah menjadi Unit Test & Automated E2E Test oleh Cursor AI.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#B11226]/10 text-[#B11226] font-mono font-bold text-[10px]">
                      BAGIAN 5
                    </span>
                    <h5 className="font-bold text-gray-900 dark:text-white">API & Skema Database Specifications</h5>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Definisikan method HTTP (GET/POST), endpoint URI, request payload JSON, response status code, serta struktur tabel atau relasi database.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#B11226]/10 text-[#B11226] font-mono font-bold text-[10px]">
                      BAGIAN 6
                    </span>
                    <h5 className="font-bold text-gray-900 dark:text-white">Non-Goals & Boundary Boundaries</h5>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Tentukan apa yang DILARANG dikerjakan pada iterasi ini (Pencegahan Feature Creep). Ini menjaga AI agent fokus pada lingkup awal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTOH PRD INDUSTRI */}
          {tab === 'contoh' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm mb-1">
                  Contoh PRD Industri: Modul Pembayaran QRIS Dinamis
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                  Berikut adalah kutipan spesifikasi teknis siap pakai yang memenuhi standar BDD dan siap dieksekusi Cursor AI.
                </p>
              </div>

              {/* Code Snippet 1 */}
              <div className="rounded-2xl bg-gray-950 border border-gray-800 overflow-hidden text-gray-200 font-mono text-[11px]">
                <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-gray-400 font-bold flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    AcceptanceCriteria_qris_payment.feature
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `Feature: Generasi QRIS & Verification Webhook\n  Scenario: Berhasil melakukan pembayaran QRIS\n    Given Pembeli memilih metode 'QRIS' dengan total tagihan Rp 150.000\n    When Pembeli mengklik 'Bayar Sekarang'\n    Then Backend menerbitkan QRIS string berformat EMVCo dengan expired_at +15 menit\n    And Tampilan frontend memunculkan modal QRIS beserta timer countdown\n    When Webhook Midtrans/Xendit mengirimkan payload { "status": "SETTLED" }\n    Then Status order berubah otomatis menjadi 'PAID'\n    And Pengguna menerima notifikasi push dan email konfirmasi pembayaran.`,
                        1
                      )
                    }
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-[10px] font-sans font-bold flex items-center gap-1.5 text-gray-300 cursor-pointer"
                  >
                    {copiedCodeIndex === 1 ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCodeIndex === 1 ? 'Tersalin' : 'Salin Text'}</span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto leading-relaxed text-emerald-300">
{`Feature: Generasi QRIS & Verification Webhook
  Scenario: Berhasil melakukan pembayaran QRIS
    Given Pembeli memilih metode 'QRIS' dengan total tagihan Rp 150.000
    When Pembeli mengklik 'Bayar Sekarang'
    Then Backend menerbitkan QRIS string berformat EMVCo dengan expired_at +15 menit
    And Tampilan frontend memunculkan modal QRIS beserta timer countdown
    When Webhook Midtrans/Xendit mengirimkan payload { "status": "SETTLED" }
    Then Status order berubah otomatis menjadi 'PAID'
    And Pengguna menerima notifikasi push dan email konfirmasi pembayaran.`}
                </pre>
              </div>

              {/* Database Schema Spec */}
              <div className="rounded-2xl bg-gray-950 border border-gray-800 overflow-hidden text-gray-200 font-mono text-[11px]">
                <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-gray-400 font-bold flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    Schema_Database_Transactions.json
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `{\n  "table": "transactions",\n  "columns": {\n    "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",\n    "order_id": "VARCHAR(64) UNIQUE NOT NULL",\n    "amount": "DECIMAL(12,2) NOT NULL",\n    "qris_payload": "TEXT NULL",\n    "status": "ENUM('PENDING', 'SETTLED', 'EXPIRED', 'FAILED')",\n    "created_at": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"\n  }\n}`,
                        2
                      )
                    }
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-[10px] font-sans font-bold flex items-center gap-1.5 text-gray-300 cursor-pointer"
                  >
                    {copiedCodeIndex === 2 ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCodeIndex === 2 ? 'Tersalin' : 'Salin Text'}</span>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto leading-relaxed text-blue-300">
{`{
  "table": "transactions",
  "columns": {
    "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
    "order_id": "VARCHAR(64) UNIQUE NOT NULL",
    "amount": "DECIMAL(12,2) NOT NULL",
    "qris_payload": "TEXT NULL",
    "status": "ENUM('PENDING', 'SETTLED', 'EXPIRED', 'FAILED')",
    "created_at": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: BEST PRACTICES & CHECKLIST */}
          {tab === 'best_practice' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm mb-1">
                  12 Poin Checklist Kesiapan PRD (Audit Kelengkapan)
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                  Sebelum menyerahkan PRD ke tim pengembang atau memproses via AI Agent, pastikan semua item bernilai hijau:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Tujuan Bisnis & Metrik KPI Jelas', desc: 'Sertakan target persentase atau angka pencapaian kuantitatif.' },
                  { title: 'User Persona & Role Auth', desc: 'Jelaskan perbedaan hak akses Admin, Member, dan Guest.' },
                  { title: 'Scope Non-Goals Terdefinisi', desc: 'Tuliskan secara eksplisit fitur yang dilarang dikerjakan.' },
                  { title: 'Kriteria BDD (Given-When-Then)', desc: 'Setiap skenario pengguna memiliki syarat kondisi masukan dan luaran.' },
                  { title: 'Skema Database / ERD', desc: 'Definisikan tipe data, kunci primary/foreign, serta indeks.' },
                  { title: 'Spesifikasi REST API / GraphQL', desc: 'URI Endpoint, HTTP Method, Headers, Payload, & Response Code.' },
                  { title: 'Penanganan Error & Fallback', desc: 'Gaya UI saat koneksi terputus, timeout, atau API error 500.' },
                  { title: 'Proteksi Keamanan OWASP', desc: 'Sanitasi input, rate limiting, enkripsi password, CSRF/CORS.' },
                  { title: 'Responsif & Mobile Friendly', desc: 'Penyesuaian tata letak untuk ukuran layar handphone dan tablet.' },
                  { title: 'Rencana Migrasi Data', desc: 'Prosedur pemindahan data lama jika melakukan pembaruan sistem.' },
                  { title: 'SLA Response Time Performance', desc: 'Batas maksimal latensi loading (misal: API response < 300ms).' },
                  { title: 'Prompt System Khusus AI Agent', desc: 'Set direktif khusus yang bisa disalin ke .cursorrules / AGENTS.md.' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-gray-900 dark:text-white block text-xs">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-gray-600 dark:text-gray-300 block mt-0.5 leading-snug">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INTEGRASI CURSOR & AGENT AI */}
          {tab === 'cursor_integration' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
                <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-blue-900 dark:text-blue-300 text-sm">
                    Cara Menggunakan PRD Ini di Cursor AI & Agent IDE
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-normal">
                    Ikuti langkah berikut untuk mengotomatisasi pembuatan aplikasi dari PRD menggunakan Cursor AI atau IDE berbasis LLM:
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-[#B11226] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Export PRD ke Format Markdown (.md)</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] pl-7">
                    Buka PRD di PRD Editor, lalu klik tombol <strong>Export PRD</strong> di pojok kanan atas, kemudian pilih <strong>Download Markdown (.md)</strong>. Simpan file sebagai <code>PRD.md</code> di folder akar proyek Anda.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-[#B11226] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Salin System Prompt Khusus ke File <code>.cursorrules</code> / <code>AGENTS.md</code></span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] pl-7 mb-2">
                    Di bagian bawah PRD Editor terdapat tab <strong>Prompt Agent AI</strong>. Salin teks tersebut dan tempelkan ke file <code>.cursorrules</code> di root project.
                  </p>

                  <div className="rounded-2xl bg-gray-950 p-3 text-emerald-400 font-mono text-[10px] overflow-x-auto ml-7 border border-gray-800">
                    # Example .cursorrules content<br />
                    You are an expert fullstack engineer. Refer to @PRD.md for all architectural constraints.<br />
                    Always write TypeScript strictly with no explicit 'any'. Implement BDD acceptance criteria.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200  dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-[#B11226] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Jalankan Prompt di Composer / Agent Chat</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] pl-7">
                    Tekan <code>Cmd + I</code> atau <code>Ctrl + I</code> di Cursor AI, tag file <code>@PRD.md</code>, lalu ketik prompt: <em className="text-gray-900 dark:text-white font-medium">"Implementasikan modul pembayaran QRIS sesuai dengan skenario Given-When-Then dan skema database yang ada di @PRD.md"</em>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100/10 dark:border-gray-800 bg-gray-50/50 dark:bg-black/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-[#B11226]" />
            <span>Membutuhkan bantuan khusus? Tanya AI Assistant di tombol melayang kanan bawah.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#B11226] hover:bg-[#900E1F] transition-colors text-white font-bold rounded-2xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
