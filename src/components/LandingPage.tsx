import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCode,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Copy,
  Check,
  Layout,
  Terminal,
  Database,
  Search,
  Code2,
  ListOrdered,
  Bot,
  Play,
  Share2,
  X
} from 'lucide-react';
import { TemplatePreset } from '../types';
import { TEMPLATES } from '../data/templates';
import { Footer } from './Footer';

interface LandingPageProps {
  onOpenNewPRDModal: () => void;
  onViewDemo: () => void;
  onSelectTemplate: (template: TemplatePreset) => void;
  onViewTemplates: () => void;
  onOpenGuideModal?: () => void;
  onOpenTeamModal?: () => void;
  onViewChange?: (view: 'dashboard' | 'editor' | 'templates' | 'landing') => void;
  onOpenUpgradeModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenNewPRDModal,
  onViewDemo,
  onSelectTemplate,
  onViewTemplates,
  onOpenGuideModal,
  onOpenTeamModal,
  onOpenUpgradeModal,
  onViewChange,
}) => {
  const getAdminPricing = () => {
    try {
      return JSON.parse(localStorage.getItem('admin_pricing') || '{}');
    } catch(e) {
      return {};
    }
  }
  const adminPricing = getAdminPricing();
  const proPrice = adminPricing?.pro?.price || 50000;
  const proCredits = adminPricing?.pro?.credits || 50;
  const entPrice = adminPricing?.enterprise?.price || 150000;
  const entCredits = adminPricing?.enterprise?.credits || 500;

  const [copiedPrompt, setCopiedPrompt] = React.useState(false);

  const samplePrompt = `# SYSTEM PROMPT FOR CURSOR / WINDSURF / CLAUDE CODE
You are a Principal Software Engineer implementing the application according to this PRD.

## PROJECT SPECIFICATION
- **Project**: DocuSpec AI PRD Engine
- **Stack**: React 19 + TypeScript + Tailwind CSS v4 + Express.js + Gemini 3.6 Flash
- **Color Identity**: Red Premium (#B11226), Surface (#FFFFFF), Background (#FAFAFA)
- **Security Rule**: Process all AI calls server-side in /api/generate-prd with GoogleGenAI SDK.

Begin step-by-step implementation following the 36-point PRD backlog.`;

  const handleCopySamplePrompt = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-[#B11226]/20 selection:text-[#B11226]">
      {/* Background Subtle Gradient Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#B11226]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white max-w-5xl mx-auto leading-tight">
          Hasilkan Seluruh Dokumentasi Software Sebelum Coding dalam{' '}
          <span className="bg-gradient-to-r from-[#B11226] via-[#7A0C12] to-red-600 bg-clip-text text-transparent">
            Hitungan Menit
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Platform AI All-in-One untuk mempublikasikan <strong className="text-gray-900 dark:text-white font-bold">PRD, SRS Requirements (ISO 29148), SDD Architecture (IEEE 1016), Diagram Flow, Skema ERD Database, Endpoint REST API (OpenAPI/Swagger), Postman Collection,</strong> hingga <strong className="text-gray-900 dark:text-white font-bold">System Prompt Siap Pakai untuk Cursor AI & Claude Code</strong>.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenNewPRDModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#B11226] to-[#7A0C12] hover:opacity-95 rounded-xl shadow-lg shadow-[#B11226]/25 hover:shadow-xl hover:shadow-[#B11226]/35 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span>Generate Dokumen Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onViewDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 text-base font-bold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs transition-all cursor-pointer"
          >
            <Layout className="w-5 h-5 text-[#B11226]" />
            <span>Buka Dashboard App</span>
          </button>
        </div>

        {/* Feature Badges under CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600 dark:text-gray-300 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>PRD • SRS • SDD • ERD • API</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>Cursor, Windsurf & Claude Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>Postman & GitHub Sync Direct</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>Export PDF, MD, DOCX, Postman JSON</span>
          </div>
        </div>

        {/* Modern Interactive Dashboard Illustration Preview */}
        <div className="mt-16 relative max-w-6xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden text-left">
          {/* Mock Window Header Bar */}
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                DocuSpec AI - Interactive PRD Workspace
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                ● Live Approved PRD
              </span>
            </div>
          </div>

          {/* Mockup Dashboard Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Left Mock TOC */}
            <div className="hidden md:block md:col-span-3 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 p-4 space-y-3 font-sans text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Struktur Dokumen (36 Poin)
              </div>
              <div className="space-y-1">
                {[
                  '1. Executive Summary',
                  '2. Problem Statement',
                  '3. Goals & Non-Goals',
                  '4. Success Metrics',
                  '5. Functional Requirements',
                  '6. API Specification',
                  '7. Database Design (ERD)',
                  '8. Design System',
                  '9. AI Coding Assistant Prompt',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-medium ${
                      idx === 8
                        ? 'bg-[#B11226]/10 text-[#B11226] font-bold dark:bg-[#B11226]/20'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Main Editor Preview */}
            <div className="md:col-span-9 p-6 space-y-6 bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B11226]/10 text-[#B11226] dark:bg-[#B11226]/20 dark:text-red-400 text-xs font-bold">
                    AI SaaS Template
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    DocuSpec AI - Product Requirements Document
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Versi 1.2.0 • Diperbarui oleh Senior Product Manager
                  </p>
                </div>
              </div>

              {/* Sample Output Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                    <Database className="w-4 h-4 text-[#B11226]" />
                    <span>Rancangan Basis Data (ERD Schema)</span>
                  </div>
                  <pre className="text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 overflow-x-auto">
{`Table: prds {
  id: UUID PRIMARY KEY,
  title: VARCHAR(255) NOT NULL,
  content_json: JSONB NOT NULL,
  created_at: TIMESTAMP
}`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                    <Code2 className="w-4 h-4 text-[#22C55E]" />
                    <span>API Endpoint Spec</span>
                  </div>
                  <pre className="text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 overflow-x-auto">
{`POST /api/generate-prd
Header: Content-Type: application/json
Body: { projectName, category, techStack }
Response: 200 OK { prdDocument }`}
                  </pre>
                </div>
              </div>

              {/* AI Prompt Ready Highlight Box */}
              <div className="p-4 rounded-xl bg-gray-900 text-gray-100 border border-gray-800 space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Cursor & Claude System Prompt Generator</span>
                  </div>
                  <button
                    onClick={handleCopySamplePrompt}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tercopy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                  # SYSTEM PROMPT READY FOR CURSOR IDE<br />
                  You are a Principal Engineer implementing DocuSpec AI PRD. Follow architectural guidelines strictly...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B11226]">Fitur Unggulan</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2">
            Segala Hal yang Anda Butuhkan untuk Menghasilkan PRD Kelas Dunia
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-base">
            Dirancang dengan standar industri perangkat lunak tinggi untuk menjembatani ide bisnis dengan eksekusi kode tanpa ambigu.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#B11226]/50 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#B11226]/10 text-[#B11226] flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generasi Otomatis 36 Seksi</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              Mencakup Executive Summary, Given-When-Then Acceptance Criteria, Diagram User Flow, ERD Schema, hingga Sprint Backlog secara instan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#B11226]/50 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#B11226]/10 text-[#B11226] flex items-center justify-center mb-5">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Prompt Khusus AI Coding</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              Setiap PRD menghasilkan System Prompt terstruktur yang dapat disalin langsung ke Cursor, Windsurf, Claude Code, atau Gemini API.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#B11226]/50 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#B11226]/10 text-[#B11226] flex items-center justify-center mb-5">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Toolbar Refine & Detektor Konflik</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              AI dapat secara cerdas mendeteksi kontradiksi antar requirement, memberikan rekomendasi keamanan OWASP, dan merancang skema database.
            </p>
          </div>
        </div>
      </section>

      {/* Templates Section Showcase */}
      <section className="py-16 bg-gray-100/70 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B11226]">16 Kategori Preset</span>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                Galeri Template PRD Siap Pakai
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pilih dari 16 industri terpopuler dan sesuaikan spesifikasi aplikasi dalam hitungan detik.
              </p>
            </div>
            <button
              onClick={onViewTemplates}
              className="px-4 py-2 text-xs font-bold text-[#B11226] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Lihat Semua 16 Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.slice(0, 8).map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#B11226] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {tpl.category}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#B11226]/10 text-[#B11226]">
                      {tpl.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#B11226] transition-colors text-sm">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-[#B11226]">
                  <span>Gunakan Template</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Pilih Paket Sesuai Kebutuhan Anda
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Mulai gratis, upgrade kapan saja untuk fitur tanpa batas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gratis</h3>
              <div className="text-3xl font-black text-gray-900 dark:text-white mb-6">Rp 0</div>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex gap-2"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Akses Editor Manual</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Ekspor Dasar</li>
                <li className="flex gap-2 opacity-50"><X className="w-5 h-5 text-gray-400 shrink-0" /> Tanpa Fitur AI</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/20 border-2 border-[#B11226] relative transform scale-105 shadow-xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#B11226] text-white text-xs font-bold px-4 py-1 rounded-full">
                Paling Populer
              </div>
              <h3 className="text-xl font-bold text-[#B11226] mb-2">Pro</h3>
              <div className="text-3xl font-black text-gray-900 dark:text-white mb-6">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(proPrice)}
              </div>
              <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300 mb-8">
                <li className="flex gap-2"><Check className="w-5 h-5 text-[#B11226] shrink-0" /> Semua Fitur Gratis</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-[#B11226] shrink-0" /> Auto-Generate AI PRD Lengkap</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-[#B11226] shrink-0" /> {proCredits} Poin AI (Credits)</li>
              </ul>
              <button onClick={onOpenUpgradeModal || onOpenNewPRDModal} className="w-full py-3 bg-[#B11226] text-white font-bold rounded-xl hover:bg-[#900E1F] transition-colors">
                Mulai Sekarang
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
              <div className="text-3xl font-black text-gray-900 dark:text-white mb-6">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(entPrice)}
              </div>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400 mb-8">
                <li className="flex gap-2"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Semua Fitur Pro</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> {entCredits} Poin AI (Credits)</li>
                <li className="flex gap-2"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Dukungan Prioritas 24/7</li>
              </ul>
              <button onClick={onOpenUpgradeModal || onOpenNewPRDModal} className="w-full py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-[#B11226] text-white shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Siap Membangun Aplikasi Tanpa Ambigu Spesifikasi?
          </h2>
          <p className="text-red-100 max-w-xl mx-auto text-sm sm:text-base">
            Mulai buat PRD profesional Anda dalam 60 detik dengan asisten AI terstruktur.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenNewPRDModal}
              className="px-8 py-3.5 text-base font-bold text-[#B11226] bg-white hover:bg-gray-100 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Buat PRD Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        onViewChange={onViewChange || ((view) => {
          if (view === 'dashboard' || view === 'templates') {
            onViewDemo();
          }
        })}
        onOpenGuideModal={onOpenGuideModal}
        onOpenTeamModal={onOpenTeamModal}
      />
    </div>
  );
};
