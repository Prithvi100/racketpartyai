// Streaming chat endpoint for the AI-native landing & in-app assistant.
// POST { messages: [{role, content}], persona?: 'coach'|'player'|'club'|'visitor' }
// Returns SSE stream of text deltas.

import { callClaude, corsHeaders, type Msg } from '../_shared/anthropic.ts';

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

    const system = `${SYSTEM_BASE}\n\n${PERSONAS[persona] ?? PERSONAS.visitor}`;
    const upstream = await callClaude({
      system,
      messages: messages as Msg[],
      max_tokens: 1024,
      stream: true,
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      return new Response(text, { status: 502, headers: corsHeaders });
    }

    // Re-stream as plain text deltas (one chunk per content_block_delta).
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
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
                if (ev.type === 'content_block_delta' && ev.delta?.text) {
                  controller.enqueue(encoder.encode(ev.delta.text));
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        } finally {
          controller.close();
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
