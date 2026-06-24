import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client. Uses the service role key so server actions /
// route handlers can bypass RLS — this app is a single-tenant admin tool,
// not a multi-tenant public app, so there is no end-user auth layer yet.
export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. Copy .env.example to .env.local and fill them in.'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
