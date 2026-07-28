import React from 'react';
import { X, FileText, Download, Copy, Check, Code, FileCode, Printer, Terminal, Sparkles, ArrowUpRight, Bot, Cpu } from 'lucide-react';
import { PRDDocument } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prd: PRDDocument;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, prd }) => {
  const [copiedMd, setCopiedMd] = React.useState(false);
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);
  const [launchedPlatform, setLaunchedPlatform] = React.useState<string | null>(null);

  if (!isOpen || !prd) return null;

  // Helper to copy prompt and launch external AI tool directly
  const handleLaunchAITool = (url: string, platformName: string) => {
    if (prd.aiCodingPrompt) {
      navigator.clipboard.writeText(prd.aiCodingPrompt);
      setCopiedPrompt(true);
      setLaunchedPlatform(platformName);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        setCopiedPrompt(false);
        setLaunchedPlatform(null);
      }, 4000);
    }
  };

  // Generate Clean Markdown representation of the PRD
  const generateMarkdown = () => {
    const safeGoals = prd.goals || { businessGoals: [], nonGoals: [] };
    const safeMetrics = prd.successMetrics || [];
    const safeReqs = prd.functionalRequirements || [];
    const safeApis = prd.apiSpecification || [];
    const safeDb = prd.databaseDesign || { tables: [] };

    return `# ${prd.title || 'Untitled PRD'}
*Category: ${prd.category || '-'} | Platform: ${prd.platform || '-'} | Version: ${prd.version || '-'} | Date: ${prd.updatedAt ? new Date(prd.updatedAt).toLocaleDateString() : '-'}*

## 1. Executive Summary
${prd.executiveSummary || '-'}

## 2. Problem Statement
${prd.problemStatement || '-'}

## 3. Goals & Non-Goals
### Business Goals
${safeGoals.businessGoals?.map((g) => `- ${g}`).join('\n') || '-'}

### Non-Goals
${safeGoals.nonGoals?.map((ng) => `- ${ng}`).join('\n') || '-'}

## 4. Success Metrics
${safeMetrics.map((m) => `| ${m.metric} | Target: ${m.target} | Timeframe: ${m.timeframe} |`).join('\n') || '-'}

## 5. Functional Requirements
${safeReqs
  .map(
    (req) => `### ${req.id}: ${req.feature} [Priority: ${req.priority}]
*User Story*: "${req.userStory}"
*Acceptance Criteria*:
${(Array.isArray(req.acceptanceCriteria)
  ? req.acceptanceCriteria
  : typeof req.acceptanceCriteria === 'string'
  ? (req.acceptanceCriteria as string).split('\n').filter(Boolean)
  : []
).map((ac) => `- Given-When-Then: ${ac}`).join('\n')}
`
  )
  .join('\n')}

## 6. API Specification
${safeApis.map((api) => `- **${api.method} ${api.endpoint}**: ${api.description}`).join('\n') || '-'}

## 7. Database Design
${safeDb.tables
  ?.map(
    (t) => `### Table: ${t.name} (${t.description})
${t.columns?.map((c) => `- ${c.name} (${c.type}) - ${c.constraints}`).join('\n')}
`
  )
  .join('\n') || '-'}

## 8. AI Coding Assistant Prompt
\`\`\`
${prd.aiCodingPrompt || '(Belum tersedia)'}
\`\`\`
`;
  };

  // Export handlers
  const handleDownloadMarkdown = () => {
    const mdContent = generateMarkdown();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(prd.title || 'prd').toLowerCase().replace(/\s+/g, '-')}-prd.md`;
    a.click();
  };

  const handleDownloadJSON = () => {
    const jsonContent = JSON.stringify(prd, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(prd.title || 'prd').toLowerCase().replace(/\s+/g, '-')}-prd.json`;
    a.click();
  };

  const handleDownloadTXT = () => {
    const txtContent = generateMarkdown();
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(prd.title || 'prd').toLowerCase().replace(/\s+/g, '-')}-prd.txt`;
    a.click();
  };

  const handleDownloadDOCX = () => {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const safeGoals = prd.goals || { businessGoals: [], nonGoals: [] };
    const safeMetrics = prd.successMetrics || [];
    const safeReqs = prd.functionalRequirements || [];
    const safeNfr = prd.nonFunctionalRequirements || [];
    const safePersonas = prd.userPersonas || [];
    const safeApis = prd.apiSpecification || [];
    const safeDb = prd.databaseDesign || { tables: [] };

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8" />
        <title>${prd.title}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.6; margin: 0; padding: 0; }
          h1 { font-size: 28pt; color: #B11226; border-bottom: 3px solid #B11226; padding-bottom: 8px; margin-top: 32px; page-break-after: avoid; }
          h2 { font-size: 16pt; color: #B11226; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 28px; page-break-after: avoid; }
          h3 { font-size: 13pt; color: #374151; margin-top: 16px; page-break-after: avoid; }
          p { font-size: 11pt; color: #374151; margin: 8px 0; }
          li { font-size: 11pt; color: #374151; margin: 4px 0; }
          table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 10pt; }
          th { background-color: #B11226; color: white; padding: 8px 12px; text-align: left; font-weight: bold; }
          td { border: 1px solid #e5e7eb; padding: 8px 12px; color: #374151; }
          tr:nth-child(even) td { background-color: #f9fafb; }
          .cover { text-align: center; padding: 80px 40px; page-break-after: always; }
          .cover-title { font-size: 36pt; color: #B11226; font-weight: bold; margin-bottom: 16px; }
          .cover-subtitle { font-size: 14pt; color: #6b7280; margin-bottom: 48px; }
          .cover-badge { display: inline-block; background: #B11226; color: white; padding: 6px 20px; border-radius: 20px; font-size: 11pt; font-weight: bold; }
          .cover-meta { margin-top: 48px; font-size: 11pt; color: #6b7280; }
          .cover-meta strong { color: #374151; }
          .toc { page-break-after: always; padding: 20px 0; }
          .toc-title { font-size: 20pt; color: #B11226; font-weight: bold; border-bottom: 2px solid #B11226; padding-bottom: 8px; margin-bottom: 20px; }
          .toc-item { padding: 4px 0; font-size: 11pt; color: #374151; }
          .badge-p0 { background: #fef2f2; color: #B11226; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold; }
          .badge-p1 { background: #fff7ed; color: #c2410c; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold; }
          .badge-p2 { background: #fefce8; color: #a16207; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: Consolas, monospace; font-size: 10pt; }
          pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; font-family: Consolas, monospace; font-size: 9pt; white-space: pre-wrap; word-break: break-word; }
        </style>
      </head>
      <body>
        <!-- COVER PAGE -->
        <div class="cover">
          <div style="width:80px;height:80px;background:#B11226;border-radius:20px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
            <p style="color:white;font-size:36pt;margin:0;font-weight:900">D</p>
          </div>
          <div class="cover-title">${prd.title}</div>
          <div class="cover-subtitle">Product Requirements Document (PRD)</div>
          <div class="cover-badge">${prd.category}</div>
          <div class="cover-meta" style="margin-top:60px;">
            <p><strong>Platform:</strong> ${prd.platform} &nbsp;|&nbsp; <strong>Version:</strong> ${prd.version} &nbsp;|&nbsp; <strong>Status:</strong> ${prd.status}</p>
            <p><strong>Author:</strong> ${prd.author || 'Tim Produk'} &nbsp;|&nbsp; <strong>Tanggal:</strong> ${today}</p>
            <p style="margin-top:8px;font-size:9pt;color:#9ca3af;">Dibuat oleh DocuSpec AI — Platform Pembuatan PRD Profesional</p>
          </div>
        </div>

        <!-- TABLE OF CONTENTS -->
        <div class="toc">
          <div class="toc-title">Daftar Isi</div>
          <div class="toc-item">1. Executive Summary .............. 3</div>
          <div class="toc-item">2. Problem Statement &amp; Solution .... 4</div>
          <div class="toc-item">3. Goals &amp; Success Metrics ........ 5</div>
          <div class="toc-item">4. Functional Requirements ......... 6</div>
          <div class="toc-item">5. Non-Functional Requirements ..... 7</div>
          <div class="toc-item">6. User Personas &amp; Stakeholders ... 8</div>
          <div class="toc-item">7. API Specification ............... 9</div>
          <div class="toc-item">8. Database Design ................. 10</div>
          <div class="toc-item">9. AI Coding Prompt ............... 11</div>
        </div>

        <!-- 1. EXECUTIVE SUMMARY -->
        <h1>1. Executive Summary</h1>
        <p>${prd.executiveSummary?.replace(/\n/g, '<br/>') || '-'}</p>

        <!-- 2. PROBLEM & SOLUTION -->
        <h1>2. Problem Statement &amp; Solution</h1>
        <h2>Masalah Utama</h2>
        <p>${prd.problemStatement?.replace(/\n/g, '<br/>') || '-'}</p>
        <h2>Solusi Produk</h2>
        <p>${(prd.inputs?.solution || '-').replace(/\n/g, '<br/>')}</p>

        <!-- 3. GOALS & METRICS -->
        <h1>3. Target Bisnis &amp; Success Metrics</h1>
        <h2>Goal Bisnis</h2>
        <ul>${safeGoals.businessGoals?.map(g => `<li>${g}</li>`).join('') || '<li>-</li>'}</ul>
        <h2>Non-Goals</h2>
        <ul>${safeGoals.nonGoals?.map(ng => `<li>${ng}</li>`).join('') || '<li>-</li>'}</ul>
        <h2>Success Metrics (KPIs)</h2>
        <table>
          <tr><th>Metrik KPI</th><th>Target Spesifik</th><th>Waktu Pencapaian</th></tr>
          ${safeMetrics.map(m => `<tr><td>${m.metric}</td><td>${m.target}</td><td>${m.timeframe}</td></tr>`).join('') || '<tr><td colspan="3">-</td></tr>'}
        </table>

        <!-- 4. FUNCTIONAL REQUIREMENTS -->
        <h1>4. Functional Requirements</h1>
        ${safeReqs.map(req => `
          <h3>${req.id}: ${req.feature} <span class="badge-${(req.priority || 'p1').toLowerCase()}">${req.priority}</span></h3>
          <p><em>User Story:</em> "${req.userStory}"</p>
          <p><strong>Acceptance Criteria:</strong></p>
          <ul>${(Array.isArray(req.acceptanceCriteria) ? req.acceptanceCriteria : [req.acceptanceCriteria]).map(ac => `<li>${ac}</li>`).join('')}</ul>
        `).join('') || '<p>-</p>'}

        <!-- 5. NON-FUNCTIONAL REQUIREMENTS -->
        <h1>5. Non-Functional Requirements</h1>
        <table>
          <tr><th>Kategori</th><th>Requirement</th><th>Target</th></tr>
          ${safeNfr.map(r => `<tr><td><strong>${r.category}</strong></td><td>${r.requirement}</td><td>${r.target}</td></tr>`).join('') || '<tr><td colspan="3">-</td></tr>'}
        </table>

        <!-- 6. USER PERSONAS -->
        <h1>6. User Personas &amp; Stakeholders</h1>
        ${safePersonas.map(p => `
          <h3>${p.name} — ${p.role}</h3>
          <p><strong>Pain Points:</strong> ${(Array.isArray(p.painPoints) ? p.painPoints : [p.painPoints]).join(', ')}</p>
          <p><strong>Goals:</strong> ${(Array.isArray(p.goals) ? p.goals : [p.goals]).join(', ')}</p>
        `).join('') || '<p>-</p>'}

        <!-- 7. API SPECIFICATION -->
        <h1>7. API Specification</h1>
        <table>
          <tr><th>Method</th><th>Endpoint</th><th>Deskripsi</th></tr>
          ${safeApis.map(api => `<tr><td><code>${api.method}</code></td><td><code>${api.endpoint}</code></td><td>${api.description}</td></tr>`).join('') || '<tr><td colspan="3">-</td></tr>'}
        </table>

        <!-- 8. DATABASE DESIGN -->
        <h1>8. Database Design</h1>
        ${safeDb.tables?.map(t => `
          <h3>Tabel: ${t.name}</h3>
          <p>${t.description}</p>
          <table>
            <tr><th>Column</th><th>Type</th><th>Constraints</th></tr>
            ${t.columns?.map(c => `<tr><td><code>${c.name}</code></td><td>${c.type}</td><td>${c.constraints}</td></tr>`).join('') || ''}
          </table>
        `).join('') || '<p>-</p>'}

        <!-- 9. AI CODING PROMPT -->
        <h1>9. AI Coding Assistant Prompt</h1>
        <p>Salin prompt berikut ke Cursor, Windsurf, atau Claude untuk langsung mulai coding:</p>
        <pre>${prd.aiCodingPrompt || '(Belum tersedia)'}</pre>

        <hr style="margin-top:48px;border-color:#e5e7eb;" />
        <p style="text-align:center;color:#9ca3af;font-size:9pt;">© ${new Date().getFullYear()} DocuSpec AI — Dokumen ini dibuat secara otomatis oleh AI. Harap tinjau sebelum digunakan secara resmi.</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(prd.title || 'prd').toLowerCase().replace(/\s+/g, '-')}-prd.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prd.aiCodingPrompt || '');
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadGitHubIssues = () => {
    let csvContent = 'Title,Priority,User Story,Acceptance Criteria\n';
    prd.functionalRequirements?.forEach((req) => {
      const title = `"${req.id}: ${req.feature.replace(/"/g, '""')}"`;
      const priority = `"${req.priority}"`;
      const story = `"${req.userStory.replace(/"/g, '""')}"`;
      const ac = `"${(Array.isArray(req.acceptanceCriteria) ? req.acceptanceCriteria.join(' | ') : req.acceptanceCriteria || '').replace(/"/g, '""')}"`;
      csvContent += `${title},${priority},${story},${ac}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(prd.title || 'prd').toLowerCase().replace(/\s+/g, '-')}-github-issues.csv`;
    a.click();
  };

  const [companyName, setCompanyName] = React.useState('DocuSpec AI Enterprise');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 no-print">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-gray-900 dark:text-gray-100 text-xs max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100/10 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B11226]/10 text-[#B11226] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Ekspor Dokumen PRD & GitHub/Jira Integrasi</h3>
              <p className="text-[11px] text-gray-500">Pilih format unduhan, ekspor ke GitHub Issues, atau salin prompt AI.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Options */}
        <div className="p-6 space-y-4">
          {/* Custom Branding Input */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
            <span className="font-bold text-[11px] text-gray-700 dark:text-gray-300 block">Kustomisasi Branding Perusahaan (DOCX / PDF):</span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nama Perusahaan / Organisasi..."
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs outline-none focus:border-[#B11226]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadMarkdown}
              className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#B11226] bg-gray-50 dark:bg-gray-800/60 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-[#B11226]">
                  Markdown (.md)
                </span>
                <FileText className="w-4 h-4 text-[#B11226]" />
              </div>
              <p className="text-[10px] text-gray-500">Standar GitHub, Notion & Obsidian.</p>
            </button>

            <button
              onClick={handleDownloadDOCX}
              className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#B11226] bg-gray-50 dark:bg-gray-800/60 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-[#B11226]">
                  Word (.DOCX / .DOC)
                </span>
                <FileCode className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-[10px] text-gray-500">Dokumen terstruktur Microsoft Word.</p>
            </button>

            <button
              onClick={handleDownloadGitHubIssues}
              className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600">
                  GitHub & Jira CSV
                </span>
                <Terminal className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-[10px] text-gray-500">Ekspor User Stories ke Tiket Issues.</p>
            </button>

            <button
              onClick={handlePrintPDF}
              className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#B11226] bg-gray-50 dark:bg-gray-800/60 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-[#B11226]">
                  PDF / Cetak
                </span>
                <Printer className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[10px] text-gray-500">Tampilan cetak siap presentasi.</p>
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100/10 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B11226]" />
                Buka Langsung Prompt di AI Agent (1-Click Launch)
              </span>
              <span className="text-[10px] text-gray-400">Autocopy to clipboard</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleLaunchAITool('https://gemini.google.com/app', 'Gemini AI')}
                className="p-2 rounded-2xl border border-gray-200  dark:border-gray-800 hover:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-blue-600 dark:text-blue-400">Gemini AI</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                </div>
              </button>

              <button
                onClick={() => handleLaunchAITool('https://chatgpt.com', 'ChatGPT')}
                className="p-2 rounded-2xl border border-gray-200  dark:border-gray-800 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">ChatGPT</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-emerald-500" />
                </div>
              </button>

              <button
                onClick={() => handleLaunchAITool('https://claude.ai/new', 'Claude AI')}
                className="p-2 rounded-2xl border border-gray-200  dark:border-gray-800 hover:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-amber-600 dark:text-amber-400">Claude AI</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-amber-500" />
                </div>
              </button>

              <button
                onClick={() => handleLaunchAITool('https://cursor.com', 'Cursor IDE')}
                className="p-2 rounded-2xl border border-gray-200  dark:border-gray-800 hover:border-[#B11226] bg-red-50/50 dark:bg-red-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[#B11226]">Cursor IDE</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-[#B11226]" />
                </div>
              </button>
            </div>

            {launchedPlatform && (
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Prompt disalin! Membuka <strong>{launchedPlatform}</strong>. Silakan langsung Ctrl+V di aplikasi.</span>
              </div>
            )}

            <button
              onClick={handleCopyPrompt}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#B11226] to-[#7A0C12] text-white font-bold rounded-2xl shadow-md transition-opacity cursor-pointer mt-1"
            >
              {copiedPrompt && !launchedPlatform ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>System Prompt Tercopy!</span>
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  <span>Salin System Prompt untuk Cursor / Windsurf</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-semibold rounded-2xl transition-colors cursor-pointer"
            >
              {copiedMd ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Seluruh Markdown Tercopy!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Seluruh Markdown PRD</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
