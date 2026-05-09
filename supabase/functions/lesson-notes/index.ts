// Voice-to-lesson-note structuring.
// POST { transcript, student_name?, student_level?, prior_notes? }
// Returns { summary, parent_update, next_plan, technique_tags[] }

import { corsHeaders, openAIJson } from '../_shared/openai.ts';

const SYSTEM = `You turn a coach's spoken lesson recap into structured outputs.

Return STRICT JSON with this shape:
{
  "summary": string,             // 3-5 bullet lines for the coach's records
  "parent_update": string,       // 3-line, warm, parent-friendly recap
  "next_plan": string,           // bullets for next session focus
  "technique_tags": string[]     // 3-6 lowercase tags like "topspin-forehand", "third-shot-drop", "split-step"
}

No prose outside the JSON. No markdown fences.`;

const LESSON_NOTES_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'parent_update', 'next_plan', 'technique_tags'],
  properties: {
    summary: { type: 'string' },
    parent_update: { type: 'string' },
    next_plan: { type: 'string' },
    technique_tags: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: { type: 'string' },
    },
  },
};

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

    const parsed = await openAIJson({
      instructions: SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
      schemaName: 'lesson_notes',
      schema: LESSON_NOTES_SCHEMA,
      max_output_tokens: 1024,
    });

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
