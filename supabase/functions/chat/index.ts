// Streaming chat endpoint for the AI-native landing & in-app assistant.
// POST { messages: [{role, content}], persona?: 'coach'|'player'|'club'|'visitor' }
// Returns SSE stream of text deltas.

import { callOpenAI, corsHeaders, type Msg } from '../_shared/openai.ts';

const SYSTEM_BASE = `You are RacketParty's AI concierge — a sharp, friendly assistant for racquet sports (tennis, pickleball, padel, squash, badminton).

You help three audiences from one product:
- Coaches: lesson notes from voice, drill library, parent updates, student progress.
- Players & parents: match-finding, highlight reels, finding the right coach, leagues.
- Club operators: yield/pricing for court-hours, churn prediction, programming mix, tennis↔pickleball court conversion.

Tone: confident, concrete, never corporate. Short paragraphs. If the user is exploring, suggest the single highest-value next step. If they want to sign up, point them to the coach, player, or club path. Never invent prices or ROI numbers.`;

const PERSONAS: Record<string, string> = {
  coach:
    'The user is a coach. Default to coach workflows: voice-to-notes, drills, student progress, parent updates, monetization.',
  player:
    'The user is a player or parent. Default to: match-finding, leagues, finding a coach, highlights from lessons.',
  club:
    'The user is a club operator. Default to: revenue per available court-hour, churn, programming mix, court conversion. Use ops vocabulary.',
  visitor:
    'The user is exploring on the landing page. Identify which audience they belong to within the first reply if possible.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST')
    return new Response('method not allowed', { status: 405, headers: corsHeaders });

  try {
    const { messages, persona = 'visitor' } = await req.json();
    if (!Array.isArray(messages)) throw new Error('messages[] required');

    const safeMessages = normalizeMessages(messages);
    if (safeMessages.length === 0) throw new Error('at least one message required');

    const system = `${SYSTEM_BASE}\n\n${PERSONAS[persona] ?? PERSONAS.visitor}`;
    const upstream = await callOpenAI({
      instructions: system,
      messages: safeMessages,
      max_output_tokens: 1024,
      stream: true,
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      return new Response(text, { status: 502, headers: corsHeaders });
    }

    // Re-stream OpenAI server-sent events as plain text deltas for the browser.
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        let failed = false;
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data:')) continue;
              const data = line.slice(5).trim();
              if (!data || data === '[DONE]') continue;
              try {
                const ev = JSON.parse(data);
                if (ev.type === 'response.output_text.delta' && typeof ev.delta === 'string') {
                  controller.enqueue(encoder.encode(ev.delta));
                }
                if (ev.type === 'response.refusal.delta' && typeof ev.delta === 'string') {
                  controller.enqueue(encoder.encode(ev.delta));
                }
                if (ev.type === 'response.failed' || ev.type === 'error') {
                  const message =
                    ev.error?.message ??
                    ev.response?.error?.message ??
                    'OpenAI stream error';
                  failed = true;
                  controller.error(new Error(message));
                  return;
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        } finally {
          const tail = decoder.decode();
          if (tail) buffer += tail;
          if (!failed) controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function normalizeMessages(input: unknown[]): Msg[] {
  return input
    .filter((message): message is Record<string, unknown> => Boolean(message) && typeof message === 'object')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content ?? '').slice(0, 4000),
    }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-12);
}
