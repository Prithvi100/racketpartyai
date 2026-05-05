// Voice-to-lesson-note structuring.
// POST { transcript, student_name?, student_level?, prior_notes? }
// Returns { summary, parent_update, next_plan, technique_tags[] }

import { claudeText, corsHeaders } from '../_shared/anthropic.ts';

const SYSTEM = `You turn a coach's spoken lesson recap into structured outputs.

Return STRICT JSON with this shape:
{
  "summary": string,             // 3-5 bullet lines for the coach's records
  "parent_update": string,       // 3-line, warm, parent-friendly recap
  "next_plan": string,           // bullets for next session focus
  "technique_tags": string[]     // 3-6 lowercase tags like "topspin-forehand", "third-shot-drop", "split-step"
}

No prose outside the JSON. No markdown fences.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST')
    return new Response('method not allowed', { status: 405, headers: corsHeaders });

  try {
    const { transcript, student_name, student_level, prior_notes } = await req.json();
    if (!transcript || typeof transcript !== 'string')
      throw new Error('transcript required');

    const userMsg = `Coach recap (spoken):\n"""${transcript}"""\n\n` +
      (student_name ? `Student: ${student_name}\n` : '') +
      (student_level ? `Level: ${student_level}\n` : '') +
      (prior_notes ? `Prior notes:\n${prior_notes}\n` : '') +
      `\nReturn the JSON now.`;

    const text = await claudeText({
      system: SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
      max_tokens: 1024,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('non-JSON response');
      parsed = JSON.parse(match[0]);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
