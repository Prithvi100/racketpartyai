import { FUNCTIONS_URL, SUPABASE_FUNCTION_AUTH_KEY, SUPABASE_PUBLIC_KEY } from './supabase';

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export type Persona = 'coach' | 'player' | 'club' | 'visitor';

export async function streamChat(
  messages: ChatMsg[],
  persona: Persona,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!FUNCTIONS_URL) {
    throw new Error('AI is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  if (!SUPABASE_FUNCTION_AUTH_KEY) {
    throw new Error('AI is not configured. Set VITE_SUPABASE_ANON_KEY so Edge Functions can be called.');
  }

  const res = await fetch(`${FUNCTIONS_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_PUBLIC_KEY,
      Authorization: `Bearer ${SUPABASE_FUNCTION_AUTH_KEY}`,
    },
    body: JSON.stringify({ messages, persona }),
    signal,
  });
  if (!res.ok) throw new Error(await functionErrorMessage('chat', res));
  if (!res.body) throw new Error('chat returned an empty response');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onDelta(decoder.decode(value));
  }
}

async function postFunction<T>(name: string, body: unknown): Promise<T> {
  if (!FUNCTIONS_URL) {
    throw new Error(`function ${name} not configured`);
  }
  if (!SUPABASE_FUNCTION_AUTH_KEY) {
    throw new Error(`function ${name} is not configured. Set VITE_SUPABASE_ANON_KEY.`);
  }
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_PUBLIC_KEY,
      Authorization: `Bearer ${SUPABASE_FUNCTION_AUTH_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await functionErrorMessage(name, res));
  return res.json();
}

async function functionErrorMessage(name: string, res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  if (!text) return `${name} failed (${res.status})`;

  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string };
    const detail = parsed.error || parsed.message;
    return detail ? `${name} failed (${res.status}): ${detail}` : `${name} failed (${res.status})`;
  } catch {
    return `${name} failed (${res.status}): ${text.slice(0, 300)}`;
  }
}

export interface LessonNotes {
  summary: string;
  parent_update: string;
  next_plan: string;
  technique_tags: string[];
}

export function generateLessonNotes(input: {
  transcript: string;
  student_name?: string;
  student_level?: string;
  prior_notes?: string;
}) {
  return postFunction<LessonNotes>('lesson-notes', input);
}

export interface DrillSuggestion {
  title: string;
  goal: string;
  duration_min: number;
  description: string;
  why: string;
}

export function suggestDrills(input: {
  student_level?: string;
  last_tags?: string[];
  goal?: string;
  group_size?: string;
}) {
  return postFunction<{ drills: DrillSuggestion[] }>('drill-suggest', input);
}

export function clubInsight(input: { kind: 'yield' | 'churn' | 'mix' | 'conversion'; context: unknown }) {
  return postFunction<{ analysis: string }>('club-insights', input);
}
