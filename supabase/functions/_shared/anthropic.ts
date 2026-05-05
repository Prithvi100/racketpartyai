// Shared Anthropic client for Supabase Edge Functions (Deno runtime).
// Reads ANTHROPIC_API_KEY from the function environment.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

export interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export async function callClaude(opts: {
  system?: string;
  messages: Msg[];
  max_tokens?: number;
  stream?: boolean;
}): Promise<Response> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing');

  return fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.max_tokens ?? 1024,
      system: opts.system,
      messages: opts.messages,
      stream: opts.stream ?? false,
    }),
  });
}

export async function claudeText(opts: {
  system?: string;
  messages: Msg[];
  max_tokens?: number;
}): Promise<string> {
  const r = await callClaude({ ...opts, stream: false });
  if (!r.ok) throw new Error(`Anthropic error ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.content?.[0]?.text ?? '';
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
