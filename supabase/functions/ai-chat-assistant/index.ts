import { GoogleGenAI } from "npm:@google/genai";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prdContext, userMessage, chatHistory } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

    const systemInstruction = `You are DocuSpec AI Assistant, an expert Senior Product Manager and Tech Lead helper.
You are helping the user refine, query, and edit their Product Requirements Document for "${prdContext?.title || 'Current Project'}".
Answer concisely, professionally, and directly in Indonesian.
If the user asks to modify a section, provide exact suggested text edits.`;

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({
      message: `Project Context: ${JSON.stringify({
        title: prdContext?.title,
        category: prdContext?.category,
        platform: prdContext?.platform,
        problem: prdContext?.problemStatement,
        solution: prdContext?.solution,
      })}\n\nUser Question: ${userMessage}`,
    });

    return new Response(JSON.stringify({ success: true, reply: response.text }), {
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
