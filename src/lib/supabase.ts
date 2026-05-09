import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const publicKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  anon
) as string | undefined;

export const isSupabaseConfigured = Boolean(url && publicKey);

export const supabase =
  isSupabaseConfigured ? createClient(url!, publicKey!, { auth: { persistSession: true } }) : null;

export const FUNCTIONS_URL =
  (import.meta.env.VITE_FUNCTIONS_URL as string | undefined) ||
  (url && publicKey ? `${url}/functions/v1` : '');

export const SUPABASE_PUBLIC_KEY = publicKey ?? '';
export const SUPABASE_FUNCTION_AUTH_KEY = anon || publicKey || '';
