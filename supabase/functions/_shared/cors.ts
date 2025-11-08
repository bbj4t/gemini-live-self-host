// This is a new file: supabase/functions/_shared/cors.ts
//
// Defines shared Cross-Origin Resource Sharing (CORS) headers
// to be used by multiple Edge Functions.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
