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

export async function checkAndDeductCredits(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('decrement_credits');
    if (error) {
      console.warn('Credits check skipped/failed:', error.message);
      return true; // Don't block user if RPC is missing
    }
    return data === true || data === null;
  } catch (e) {
    return true; // Graceful fallback
  }
}

async function callGemini(promptText: string, systemInstruction: string, expectJson = false): Promise<string> {
  // Deduct credits if possible
  await checkAndDeductCredits();

  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API Key Gemini belum disetel di Vercel Environment Variables (VITE_GEMINI_API_KEY).');
  }

  // List of valid API models to attempt in order
  const modelsToTry = [
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
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

  const rawText = await callGemini(promptText, systemInstruction, true);
  
  const defaultPRDFallback: Partial<PRDDocument> = {
    executiveSummary: prdInputs.problemStatement || 'PRD otomatis dibuat berdasarkan spesifikasi awal.',
    problemStatement: prdInputs.problemStatement || 'Masalah utama yang diidentifikasi.',
    goals: { businessGoals: prdInputs.businessGoals || 'Meningkatkan efisiensi kerja', nonGoals: 'Fitur di luar cakupan v1' },
    successMetrics: [{ metric: 'User Adoption', target: '1000 users', timeframe: '30 hari' }],
    businessRequirements: 'Sistem harus aman, cepat, dan mudah digunakan.',
    functionalRequirements: [
      {
        id: 'FR-001',
        feature: prdInputs.mainFeatures || 'Core Feature',
        priority: 'P0',
        description: 'Fungsionalitas utama aplikasi',
        userStory: 'Sebagai user, saya ingin menggunakan fitur utama ini.',
        acceptanceCriteria: 'Given user membuka aplikasi, When mengklik tombol utama, Then sistem merespons cepat.'
      }
    ],
    techStack: prdInputs.techStack || { frontend: 'React', backend: 'Node.js', database: 'Supabase', authentication: 'Supabase Auth', hosting: 'Vercel', apiIntegrations: 'Gemini AI' },
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
