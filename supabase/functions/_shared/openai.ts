// Shared OpenAI client for Supabase Edge Functions (Deno runtime).
// Reads OPENAI_API_KEY from the function environment. Never expose this key to Vite.

const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-5.4-mini';
const REASONING_EFFORT = Deno.env.get('OPENAI_REASONING_EFFORT');

export interface Msg {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export async function callOpenAI(opts: {
  instructions?: string;
  messages: Msg[];
  max_output_tokens?: number;
  stream?: boolean;
  text?: Record<string, unknown>;
}): Promise<Response> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  const body: Record<string, unknown> = {
    model: MODEL,
    instructions: opts.instructions,
    input: opts.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    max_output_tokens: opts.max_output_tokens ?? 1024,
    stream: opts.stream ?? false,
    store: false,
  };

  if (opts.text) body.text = opts.text;
  if (REASONING_EFFORT) body.reasoning = { effort: REASONING_EFFORT };

  return fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
}

export async function openAIText(opts: {
  instructions?: string;
  messages: Msg[];
  max_output_tokens?: number;
}): Promise<string> {
  const r = await callOpenAI({ ...opts, stream: false });
  if (!r.ok) throw new Error(`OpenAI error ${r.status}: ${await r.text()}`);
  return extractOutputText(await r.json());
}

export async function openAIJson<T>(opts: {
  instructions?: string;
  messages: Msg[];
  schemaName: string;
  schema: Record<string, unknown>;
  max_output_tokens?: number;
}): Promise<T> {
  const r = await callOpenAI({
    instructions: opts.instructions,
    messages: opts.messages,
    max_output_tokens: opts.max_output_tokens,
    stream: false,
    text: jsonSchemaFormat(opts.schemaName, opts.schema),
  });
  if (!r.ok) throw new Error(`OpenAI error ${r.status}: ${await r.text()}`);
  const text = extractOutputText(await r.json());

  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('non-JSON response');
    return JSON.parse(match[0]) as T;
  }
}

export function jsonSchemaFormat(name: string, schema: Record<string, unknown>) {
  return {
    format: {
      type: 'json_schema',
      name,
      strict: true,
      schema,
    },
  };
}

function extractOutputText(response: any): string {
  if (typeof response.output_text === 'string') return response.output_text;

  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join('');
}
