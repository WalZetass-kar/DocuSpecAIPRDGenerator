import { GoogleGenAI } from "npm:@google/genai";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const prdInputs = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let prdData = JSON.parse(rawText);

    prdData.id = 'prd-' + Date.now();
    prdData.title = prdInputs.projectName || 'New AI Generated PRD';
    prdData.workspaceId = 'ws-main';
    prdData.createdAt = new Date().toISOString();
    prdData.updatedAt = new Date().toISOString();
    prdData.isFavorite = false;
    prdData.isArchived = false;
    prdData.inTrash = false;
    prdData.status = 'draft';
    prdData.version = '1.0.0';
    prdData.category = prdInputs.category || 'AI SaaS';
    prdData.platform = prdInputs.platform || 'Web';
    prdData.complexity = prdInputs.complexity || 'Medium (3-6 Sprints)';
    prdData.author = 'AI Product Manager';
    prdData.inputs = prdInputs;
    prdData.tags = [prdInputs.category, prdInputs.platform, 'Cursor-Ready', 'AI Generated'];

    return new Response(JSON.stringify({ success: true, data: prdData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
