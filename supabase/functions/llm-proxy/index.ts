// This is a new file: supabase/functions/llm-proxy/index.ts
//
// Deploys a Supabase Edge Function that acts as a secure proxy for
// self-hosted LLM services. It reads endpoints and credentials
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
    const { prompt, model } = await req.json();

    // @ts-ignore
    const llmEndpoint = Deno.env.get('LLM_ENDPOINT');
    if (!llmEndpoint) throw new Error('LLM_ENDPOINT is not set in Supabase secrets.');

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

    if (!res.ok) throw new Error(`LLM API error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    
    // Standardize the response by finding the text in common keys.
    let responseText = '';
    if (data.response) responseText = data.response;
    else if (data.text) responseText = data.text;
    else if (data.completion) responseText = data.completion;
    else if (data.choices && data.choices[0]?.message?.content) responseText = data.choices[0].message.content;
    else if (data.choices && data.choices[0]?.text) responseText = data.choices[0].text;
    else {
        throw new Error('Could not find a valid response text in the LLM output. Supported keys: response, text, completion, or OpenAI `choices` format.');
    }

    return new Response(JSON.stringify({ responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});