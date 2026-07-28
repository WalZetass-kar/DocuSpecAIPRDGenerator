import { GoogleGenAI, Type } from "npm:@google/genai";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { promptHint, category, platform } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

    const systemInstruction = `You are a Senior Product Manager at Google/Linear/Vercel.
The user provides a brief project idea or title: "${promptHint || 'A new web or mobile app'}".
Selected Category: "${category || 'AI SaaS'}".
Selected Platform: "${platform || 'Web'}".

Your task is to automatically extrapolate and generate realistic, highly professional PRD form fields in Indonesian language. Return ONLY JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate detailed PRD form inputs for project idea: "${promptHint || 'Inovatif App'}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            category: { type: Type.STRING },
            platform: { type: Type.STRING },
            targetUser: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            solution: { type: Type.STRING },
            mainFeatures: { type: Type.STRING },
            businessGoals: { type: Type.STRING },
            deadline: { type: Type.STRING },
            complexity: { type: Type.STRING },
            techStack: {
              type: Type.OBJECT,
              properties: {
                frontend: { type: Type.STRING },
                backend: { type: Type.STRING },
                database: { type: Type.STRING },
                authentication: { type: Type.STRING },
                hosting: { type: Type.STRING },
                apiIntegrations: { type: Type.STRING },
              },
              required: ['frontend', 'backend', 'database', 'authentication', 'hosting', 'apiIntegrations'],
            },
            additionalPrompt: { type: Type.STRING },
          },
          required: [
            'projectName', 'category', 'platform', 'targetUser',
            'problemStatement', 'solution', 'mainFeatures',
            'businessGoals', 'deadline', 'complexity', 'techStack',
          ],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);

    return new Response(JSON.stringify({ success: true, data: parsed }), {
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
