// This is a new file: supabase/functions/llm-proxy/index.ts
//
// Deploys a Supabase Edge Function that acts as a secure proxy for
// self-hosted LLM and TTS services. It reads endpoints and credentials
// from your project's environment variables (secrets).

// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, prompt, model, text } = await req.json();

    if (type === 'llm') {
      // FIX: Added @ts-ignore to suppress Deno type errors in non-Deno environments.
      // @ts-ignore
      const llmEndpoint = Deno.env.get('LLM_ENDPOINT');
      if (!llmEndpoint) throw new Error('LLM_ENDPOINT is not set in Supabase secrets.');

      // FIX: Added @ts-ignore to suppress Deno type errors in non-Deno environments.
      // @ts-ignore
      const llmApiCred = Deno.env.get('LLM_API_CRED');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (llmApiCred) {
        headers['Authorization'] = llmApiCred.startsWith('Bearer ') ? llmApiCred : `Bearer ${llmApiCred}`;
      }
      
      const payload: { prompt: string, model?: string } = { prompt };
      if (model) payload.model = model;

      const res = await fetch(llmEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`LLM API error: ${res.statusText}`);
      const data = await res.json();
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (type === 'tts') {
      // FIX: Added @ts-ignore to suppress Deno type errors in non-Deno environments.
      // @ts-ignore
      const ttsEndpoint = Deno.env.get('TTS_ENDPOINT');
      if (!ttsEndpoint) throw new Error('TTS_ENDPOINT is not set in Supabase secrets.');
      
      // FIX: Added @ts-ignore to suppress Deno type errors in non-Deno environments.
      // @ts-ignore
      const ttsApiCred = Deno.env.get('TTS_API_CRED');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (ttsApiCred) {
        headers['Authorization'] = ttsApiCred.startsWith('Bearer ') ? ttsApiCred : `Bearer ${ttsApiCred}`;
      }
      
      const res = await fetch(ttsEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`TTS API error: ${res.statusText}`);
      const data = await res.json();
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error('Invalid type specified. Must be "llm" or "tts".');
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Note: You might need a `_shared/cors.ts` file for the headers.
// Create supabase/functions/_shared/cors.ts and add:
/*
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
*/