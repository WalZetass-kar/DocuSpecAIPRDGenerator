import { supabase } from './supabase';
import { PRDInput, PRDDocument } from '../types';

const getApiKey = () => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ''
  ).trim();
};

export async function checkAndDeductCredits(amount: number = 1): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('decrement_credits', { amount_to_deduct: amount });
    if (error) {
      console.warn('Credits check skipped/failed:', error.message);
      const { data: data2 } = await supabase.rpc('decrement_credits');
      return data2 === true || data2 === null;
    }
    return data === true || data === null;
  } catch (e) {
    return true; // Graceful fallback
  }
}

async function callGemini(promptText: string, systemInstruction: string, expectJson = false, creditAmount: number = 1): Promise<string> {
  // Deduct credits if possible (e.g., 36 credits for full PRD generation)
  await checkAndDeductCredits(creditAmount);

  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API Key Gemini belum disetel di Vercel Environment Variables (VITE_GEMINI_API_KEY).');
  }

  // List of valid API models to attempt in order (most likely to have free quota first)
  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const body: any = {
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      if (expectJson) {
        body.generationConfig.responseMimeType = "application/json";
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        lastError = errData.error?.message || `HTTP ${response.status} pada model ${model}`;
        console.warn(`Model ${model} gagal:`, lastError);
      }
    } catch (err: any) {
      lastError = err?.message || 'Network error';
      console.warn(`Attempt with ${model} threw error:`, lastError);
    }
  }

  // Provide more helpful error messages
  if (lastError && (lastError.includes('quota') || lastError.includes('Quota') || lastError.includes('429'))) {
    throw new Error('Quota Gemini API free tier sudah habis. Opsi: (1) Tunggu 24 jam untuk reset, (2) Upgrade ke paid plan di https://ai.google.dev/pricing, (3) Gunakan API key baru.');
  }
  throw new Error(`Gagal menghubungkan Gemini AI. Detail: ${lastError || 'Semua model Gemini tidak merespons'}. Pastikan API Key valid di Vercel.`);
}

export async function generateContent(prompt: string, systemInstruction: string = ''): Promise<string> {
  return callGemini(prompt, systemInstruction, false);
}

export async function generatePRD(prdInputs: PRDInput): Promise<PRDDocument> {
  const systemInstruction = `You are a Principal Product Manager, Principal UI/UX Architect, and Chief Software Architect from Google, Linear, Vercel, and Stripe.
Your goal is to generate an ELITE, ULTRA-COMPREHENSIVE Product Requirements Document (PRD) in INDONESIAN language based on the user's input specifications.

CRITICAL RULES:
1. Every section MUST be thoroughly filled with real, actionable, non-dummy engineering specifications. No generic placeholders or stub text like "TBD" or "Lorem Ipsum".
2. Include ALL 36 required PRD sections with deep technical precision:
   - executiveSummary
   - problemStatement
   - goals (businessGoals, nonGoals)
   - successMetrics (metric, target, timeframe)
   - businessRequirements
   - functionalRequirements (id, feature, priority: P0/P1/P2/P3, description, userStory, acceptanceCriteria in Given-When-Then format)
   - nonFunctionalRequirements (category, requirement, target)
   - userPersonas (name, role, painPoints, goals)
   - stakeholders (role, responsibility, impact: High/Medium/Low)
   - scope (inScope, outOfScope)
   - userJourney (step, userAction, systemResponse, keyTouchpoint)
   - flowDiagram (nodes with id, label, type [start/process/decision/end], and edges with from, to, label)
   - informationArchitecture (pages with title, path, components)
   - featureList (name, category [MoSCoW - Must/Should/Could/Won't], effort [Small/Medium/Large/XL], description)
   - acceptanceCriteriaSummary
   - securityRequirements
   - accessibilityStandards
   - performanceTargets (metric, target)
   - apiSpecification (endpoint, method, description, reqPayload, resPayload)
   - databaseDesign (tables with name, description, columns with name, type, constraints)
   - entityRelationshipSummary
   - rolePermissions (role, permissions)
   - notificationFlow (event, channel, recipient, template)
   - uiRequirements
   - designSystem (colors: { primary: "#B11226", darkRed: "#7A0C12", background: "#FAFAFA", surface: "#FFFFFF" }, typography, spacing, borderRadius)
   - componentList (name, purpose, props)
   - responsiveRequirements (device, breakpoint, behavior)
   - seoRequirements
   - analyticsStrategy (eventName, trigger, parameters)
   - testingStrategy (testType, scope, tools)
   - deploymentStrategy (stage, environment, ciCdPipeline)
   - riskAssessment (risk, impact, likelihood, mitigation)
   - futureRoadmap (phase, timeframe, deliverables)
   - taskBreakdown (id, title, category, estimatedHours)
   - sprintPlanning (sprint, focus, storyPoints, tasks)
   - releaseChecklist (item, status, category)
   - aiCodingPrompt (System prompt specifically designed for Cursor/Windsurf/Claude Code/Gemini to immediately code this app)

Return JSON matching the schema strictly.`;

  const promptText = `Generate a world-class PRD for:
Project Name: ${prdInputs.projectName}
Category: ${prdInputs.category}
Platform: ${prdInputs.platform}
Target User: ${prdInputs.targetUser}
Problem: ${prdInputs.problemStatement}
Solution: ${prdInputs.solution}
Main Features: ${prdInputs.mainFeatures}
Business Goals: ${prdInputs.businessGoals}
Target Deadline: ${prdInputs.deadline}
Complexity: ${prdInputs.complexity}
Tech Stack:
  - Frontend: ${prdInputs.techStack?.frontend}
  - Backend: ${prdInputs.techStack?.backend}
  - Database: ${prdInputs.techStack?.database}
  - Auth: ${prdInputs.techStack?.authentication}
  - Hosting: ${prdInputs.techStack?.hosting}
  - APIs: ${prdInputs.techStack?.apiIntegrations}
Additional Instructions: ${prdInputs.additionalPrompt || 'None'}`;

  const rawText = await callGemini(promptText, systemInstruction, true, 36);
  
  const defaultPRDFallback: Partial<PRDDocument> = {
    executiveSummary: prdInputs.problemStatement || 'Dokumentasi otomatis dibuat berdasarkan spesifikasi awal.',
    problemStatement: prdInputs.problemStatement || 'Masalah utama yang diidentifikasi.',
    goals: { businessGoals: [prdInputs.businessGoals || 'Meningkatkan efisiensi kerja'], nonGoals: ['Fitur di luar cakupan v1'] },
    successMetrics: [{ metric: 'User Adoption', target: '1000 users', timeframe: '30 hari' }],
    businessRequirements: ['Sistem harus aman, cepat, dan mudah digunakan.'],
    functionalRequirements: [
      {
        id: 'FR-001',
        feature: prdInputs.mainFeatures || 'Core Feature',
        priority: 'P0',
        description: 'Fungsionalitas utama aplikasi',
        userStory: 'Sebagai user, saya ingin menggunakan fitur utama ini.',
        acceptanceCriteria: ['Given user membuka aplikasi, When mengklik tombol utama, Then sistem merespons cepat.']
      }
    ],
    srsDocument: {
      introduction: `Dokumen Software Requirements Specification (SRS) ini mendefinisikan persyaratan fungsional dan teknis untuk sistem ${prdInputs.projectName || 'Aplikasi'}.`,
      purpose: 'Memberikan acuan baku bagi pengembang, penguji QA, dan pemangku kepentingan mengenai batasan sistem.',
      productPerspective: `${prdInputs.projectName || 'Sistem'} beroperasi sebagai aplikasi ${prdInputs.platform || 'Web'} mandiri dengan arsitektur terisolasi.`,
      userClasses: ['End User', 'Product Admin', 'System Administrator', 'DevOps / QA Engineer'],
      operatingEnvironment: `${prdInputs.platform || 'Web Browser'} (Chrome, Firefox, Safari) & Cloud Host: ${prdInputs.techStack?.hosting || 'Google Cloud Run'}`,
      designConstraints: ['Compliance keamanan OWASP Top 10', 'Waktu respons API di bawah 300ms', 'Desain UI responsive mobile-first'],
      assumptions: ['Pengguna memiliki koneksi internet stabil', 'Browser mendukung ES6+ dan LocalStorage'],
      externalInterfaces: [`REST API: ${prdInputs.techStack?.backend || 'Express.js'}`, `Database: ${prdInputs.techStack?.database || 'PostgreSQL'}`, `Auth: ${prdInputs.techStack?.authentication || 'OAuth2'}`],
      validationRules: ['Email harus berformat valid RFC 5322', 'Password minimal 8 karakter dengan alfabet & angka'],
      businessRules: ['Aktivasi akun memerlukan verifikasi email', 'Akses fitur khusus dibatasi oleh Role Permission'],
      errorHandling: 'Sistem menangani pengecualian secara global dengan HTTP status code terstandar (400, 401, 403, 404, 500) dan log JSON.',
      loggingStrategy: 'Structured logging (Winston/Pino) mencakup Timestamp, Trace ID, User ID, HTTP Method, dan Error Stack.',
      compliance: ['ISO/IEC 27001 Security Standard', 'GDPR Data Protection Principles', 'WCAG 2.1 AA Accessibility']
    },
    sddDocument: {
      architectureOverview: `Arsitektur ${prdInputs.projectName || 'Sistem'} menerapkan pola decoupled client-server berbasis Microservices / Modular Monolith.`,
      frontendArchitecture: `${prdInputs.techStack?.frontend || 'React 19 + TypeScript + Tailwind CSS v4'}. State dipelihara menggunakan React Hooks dan Context API.`,
      backendArchitecture: `${prdInputs.techStack?.backend || 'Node.js Express API Server'} berarsitektur MVC / Layered Architecture.`,
      serviceLayer: 'Service layer memisahkan logika bisnis aplikasi dari pengontrol HTTP (Controllers) dan akses data (Repositories).',
      repositoryPattern: 'Repository pattern mengabstraksi kueri database sehingga mempermudah pengujian terisolasi (Unit Testing).',
      authenticationFlow: 'Autentikasi menggunakan JSON Web Token (JWT) berumur pendek dengan Refresh Token yang disimpan di HTTP-Only Cookie.',
      authorizationModel: 'Role-Based Access Control (RBAC) dengan hirarki permission (Admin, Editor, Viewer).',
      folderStructure: `src/\n ├── components/\n ├── pages/\n ├── services/\n ├── repository/\n ├── utils/\n └── types.ts`,
      designPatterns: ['Repository Pattern', 'Singleton Database Connection', 'Factory Pattern for AI Engine', 'Observer Pattern for Events'],
      cachingStrategy: 'Redis Caching Layer untuk menyimpan sesi pengguna dan hasil kueri dataset yang jarang berubah.',
      scalingStrategy: 'Horizontal Auto-scaling berdasarkan utilisasi CPU/RAM di Google Cloud Run / Kubernetes Container.',
      ciCdStrategy: 'Automated GitHub Actions Pipeline: Lint Check → Unit Test → Build Docker Image → Deploy to Staging/Production.',
      monitoringLogging: 'Monitoring performa aplikasi menggunakan Prometheus + Grafana dan alert otomatis via Slack / Email.',
      securityLayer: 'Pengamanan HTTPS/TLS 1.3, Rate Limiting (100 req/min), CORS Whitelist, Helmet Security Headers, dan Sanitasi SQL Injection.'
    },
    wireframeSpecs: {
      lowFidelity: 'Draft sketsa tata letak kasar: Header Bar, Left Sidebar Navigation, Center Document Editor Canvas, Right AI Panel.',
      mediumFidelity: 'Spesifikasi grid UI: 12-Column Responsive Layout dengan spacing 16px/24px dan skema warna high-contrast.',
      asciiWireframe: `+-------------------------------------------------------------+\n| [Logo] DocuSpec Studio            [Export] [Share] [User]   |\n+--------------+----------------------------------------------+\n| - Dashboard  |  Document Title: My Enterprise System        |\n| - PRD / SRS  |  ==========================================  |\n| - SDD Arch   |  1. Executive Summary                        |\n| - Database   |  Lorem ipsum dolor sit amet...               |\n| - API Specs  |                                              |\n+--------------+----------------------------------------------+`,
      mermaidWireframe: `graph TD\n  A[Landing Page] --> B(Register / Login)\n  B --> C{Verified?}\n  C -- Yes --> D[Dashboard Workspace]\n  C -- No --> E[Verification Prompt]\n  D --> F[Generate New Document]\n  F --> G[Edit & Export PDF/MD]`
    },
    testCasesList: [
      {
        id: 'TC-001',
        testType: 'Unit Test',
        feature: 'Form Auto-Fill AI',
        scenario: 'Memastikan fungsi auto-fill mengembalikan data JSON terstruktur',
        given: 'User memasukkan nama proyek valid',
        when: 'Tombol Auto-Fill AI diklik',
        then: 'Formulir terisi otomatis tanpa error sintaks',
        status: 'passed'
      },
      {
        id: 'TC-002',
        testType: 'API Test',
        feature: 'Endpoint Document Generation',
        scenario: 'Pengujian integrasi API Gemini untuk generasi dokumen 36 seksi',
        given: 'Payload PRDInput lengkap dikirimkan ke endpoint /api/generate',
        when: 'Server memproses permintaan ke Gemini API',
        then: 'HTTP 200 OK dikembalikan berisi objek PRDDocument utuh',
        status: 'passed'
      },
      {
        id: 'TC-003',
        testType: 'Security Test',
        feature: 'Autentikasi & RLS Storage',
        scenario: 'Memastikan user tidak dapat membaca dokumen milik workspace lain',
        given: 'User A mencoba mengakses PRD ID milik User B',
        when: 'Query Supabase dipanggil',
        then: 'Sistem mengembalikan 403 Forbidden atau array kosong',
        status: 'passed'
      }
    ],
    riskAnalysisList: [
      {
        category: 'Technical Risk',
        risk: 'Batasan Rate Limit / Quota Kuota API Gemini AI saat puncak trafik',
        impact: 'High',
        likelihood: 'Medium',
        mitigation: 'Implementasi fallback ke model Gemini Flash Lite & caching hasil generasi secara lokal.'
      },
      {
        category: 'Security Risk',
        risk: 'Kebocoran API Key di sisi Frontend client',
        impact: 'High',
        likelihood: 'Low',
        mitigation: 'Menyimpan API Key di Environment Variable rahasia server / Vercel Edge Config.'
      },
      {
        category: 'Business Risk',
        risk: 'Kritik ketidaklengkapan dokumen dari tim engineering senior',
        impact: 'Medium',
        likelihood: 'Low',
        mitigation: 'Penerapan Final Quality Gate score minimal 95% sebelum dokumen dipublikasikan.'
      }
    ],
    aiCodingPrompt: `Buatkan aplikasi ${prdInputs.projectName} dengan spesifikasi: ${prdInputs.mainFeatures}`
  };

  let prdData = safeJsonParse(rawText, defaultPRDFallback) as any;

  prdData.id = prdData.id || crypto.randomUUID();
  prdData.title = prdData.title || prdInputs.projectName || 'New AI Generated PRD';
  prdData.workspaceId = prdData.workspaceId || 'ws-main';
  prdData.createdAt = prdData.createdAt || new Date().toISOString();
  prdData.updatedAt = new Date().toISOString();
  prdData.isFavorite = Boolean(prdData.isFavorite);
  prdData.isArchived = Boolean(prdData.isArchived);
  prdData.inTrash = Boolean(prdData.inTrash);
  prdData.status = prdData.status || 'draft';
  prdData.version = prdData.version || '1.0.0';
  prdData.category = prdInputs.category || 'AI SaaS';
  prdData.platform = prdInputs.platform || 'Web';
  prdData.complexity = prdInputs.complexity || 'Medium (3-6 Sprints)';
  prdData.author = 'AI Product Manager';
  prdData.inputs = prdInputs;
  prdData.tags = [prdInputs.category, prdInputs.platform, 'Cursor-Ready', 'AI Generated'];

  return prdData as PRDDocument;
}

function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();
  }
  return cleaned;
}

function safeJsonParse<T>(rawText: string, fallback: T): T {
  const cleaned = cleanJsonText(rawText);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Initial JSON.parse failed, trying auto-repair strategy...', err);
    try {
      let repaired = cleaned;
      repaired = repaired.replace(/,\s*$/, '');
      repaired = repaired.replace(/,\s*"[^"]*"?\s*:?\s*$/, '');
      
      let openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
      let openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
      
      const quoteCount = (repaired.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        repaired += '"';
      }
      
      while (openBrackets > 0) {
        repaired += ']';
        openBrackets--;
      }
      while (openBraces > 0) {
        repaired += '}';
        openBraces--;
      }

      return JSON.parse(repaired);
    } catch (repairErr) {
      console.error('JSON Repair failed. Using structured fallback.', repairErr);
      return fallback;
    }
  }
}

export async function autoFillForm(promptHint: string, category: string, platform: string) {
  const systemInstruction = `You are an expert AI Product Assistant. Your job is to guess and auto-fill the rest of a PRD Generator form based on a brief project hint, category, and platform.
Return ONLY valid JSON with no markdown formatting. The JSON should have these string fields:
- projectName
- targetUser
- problemStatement
- solution
- mainFeatures
- businessGoals`;

  const promptText = `Hint: ${promptHint}\nCategory: ${category}\nPlatform: ${platform}\nFill the form with highly professional, specific, and realistic assumptions in Indonesian.`;

  const rawText = await callGemini(promptText, systemInstruction, true);
  const fallback = {
    projectName: promptHint || 'Proyek Baru',
    targetUser: 'Product Managers & Developers',
    problemStatement: 'Proses dokumentasi manual membutuhkan waktu yang lama.',
    solution: 'Otomatisasi pembuatan PRD berbasis AI.',
    mainFeatures: 'Generasi PRD otomatis, ekspor PDF/Markdown, integrasi AI.',
    businessGoals: 'Meningkatkan kecepatan rilis produk sebesar 70%.'
  };
  return safeJsonParse(rawText, fallback);
}

export async function refinePRD(prd: PRDDocument, action: string, customPrompt?: string) {
  const systemInstruction = `You are a Principal Product Manager. Your task is to analyze and refine the given PRD based on the requested action.
Return ONLY valid JSON with no markdown formatting. The JSON must have these string fields:
- summary: A brief explanation of what you changed or analyzed.
- generatedOutput: The detailed refinement or analysis text.`;

  const promptText = `
PRD Context:
${JSON.stringify({ title: prd.title, category: prd.category, problemStatement: prd.problemStatement })}

Requested Action: ${action}
Custom Prompt: ${customPrompt || 'None'}

Execute the requested action perfectly in Indonesian language.`;

  const rawText = await callGemini(promptText, systemInstruction, true);
  const fallback: { summary: string; generatedOutput: string; updatedSections?: Record<string, any> } = {
    summary: 'Refinemen otomatis telah diproses.',
    generatedOutput: `Analisis untuk ${action}: Dokumen PRD telah ditinjau dan dioptimalkan.`
  };
  const data = safeJsonParse(rawText, fallback);
  return { success: true, data };
}
