import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anon);

// Stub-friendly client. If env not set, exports `null` and the app falls back
// to demo-mode (in-memory) so the UI is fully usable without a backend.
export const supabase =
  isSupabaseConfigured ? createClient(url!, anon!, { auth: { persistSession: true } }) : null;

export const FUNCTIONS_URL =
  (import.meta.env.VITE_FUNCTIONS_URL as string | undefined) ||
  (url ? `${url}/functions/v1` : '');
