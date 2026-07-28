import { GoogleGenAI } from "npm:@google/genai";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prd, action, customPrompt } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

    const systemInstruction = `You are a Principal Technical Product Manager and AI Refinement Engine.
You have been provided an existing Product Requirements Document (PRD) for "${prd?.title}".
Your task is to execute the requested refinement action: "${action}".

Action Options:
- "detect_conflicts": Analyze requirements and identify any conflicting logic, impossible timelines, or security/architectural risks.
- "fix_requirements": Sharpen vague requirements into crisp, testable Given-When-Then statements and P0/P1 prioritization.
- "add_missing": Identify missing edge cases, rate limits, error states, accessibility standards, or compliance items and append them.
- "ux_recommendations": Suggest specific high-converting UX improvements, micro-interactions, layout rhythms, and mobile adaptations.
- "db_recommendations": Review database design, recommend missing tables, foreign key constraints, indexes, and caching strategies.
- "api_recommendations": Review API specifications, add missing status codes (400/401/403/429/500) and request validation schemas.
- "security_recommendations": Provide a comprehensive security hardening checklist (OWASP Top 10, CORS, CSP, JWT handling).
- "estimate_complexity": Recalculate story points, sprint allocations, and developer hours with a detailed breakdown.
- "generate_backlog": Format all functional requirements into ready-to-import Jira / Linear User Stories & Acceptance Criteria.
- "generate_ai_prompt": Produce an upgraded, ultra-optimized system prompt for Cursor / Windsurf / Claude Code / Gemini.
- "custom": Apply the custom instruction "${customPrompt}".

Return a JSON response in Indonesian containing:
{
  "action": "${action}",
  "summary": "High-level summary of analysis and recommendations",
  "recommendations": ["Point 1", "Point 2", "Point 3"],
  "updatedSections": { ... optional updated fields for the PRD },
  "generatedOutput": "Formatted text or markdown snippet if applicable"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Existing PRD Data:\n${JSON.stringify(prd, null, 2)}\n\nRefinement Request: ${action}. Custom Prompt: ${customPrompt || 'None'}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    
    return new Response(JSON.stringify({ success: true, data: result }), {
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
