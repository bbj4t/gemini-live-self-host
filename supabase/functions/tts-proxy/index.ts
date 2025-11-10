// This is a new file: supabase/functions/tts-proxy/index.ts
//
// Deploys a Supabase Edge Function that acts as a secure proxy for
// self-hosted Text-to-Speech (TTS) services. It reads the endpoint 
// and credentials from your project's environment variables (secrets).

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
    const { text } = await req.json();
    if (!text) throw new Error('A "text" property is required in the request body.');
    
    // @ts-ignore
    const ttsEndpoint = Deno.env.get('TTS_ENDPOINT');
    if (!ttsEndpoint) throw new Error('TTS_ENDPOINT is not set in Supabase secrets.');
    
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

    if (!res.ok) throw new Error(`TTS API error: ${res.status} ${res.statusText}`);
    const data = await res.json();

    // Standardize the TTS response by looking for base64 audio in common keys.
    let audioContent = '';
    if (data.audioContent) audioContent = data.audioContent;
    else if (data.audio) audioContent = data.audio;
    else if (data.data) audioContent = data.data;
    else {
        throw new Error('Could not find valid audio data in the TTS output. Supported keys: audioContent, audio, data.');
    }
    
    return new Response(JSON.stringify({ audioContent }), {
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