import { createClient } from '@supabase/supabase-js';

// Browser-side Supabase client (anon key). Not used for data fetching in this
// MVP — all reads/writes go through server actions — but kept available for
// future client-side needs like direct evidence photo uploads to Storage.
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.');
  }

  return createClient(url, key);
}
