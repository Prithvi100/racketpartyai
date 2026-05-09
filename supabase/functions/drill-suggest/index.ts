// Suggest the next drill for a student based on recent lesson tags.
// POST { student_level, last_tags: string[], goal?: string, group_size?: string }

import { corsHeaders, openAIJson } from '../_shared/openai.ts';

const SYSTEM = `You are a drill recommender for racquet-sport coaches. Output 3 drill options as STRICT JSON:
{
  "drills": [
    { "title": string, "goal": string, "duration_min": number, "description": string, "why": string }
  ]
}
No prose outside JSON. Drills must be progressive and tied to the student's recent technique tags.`;

const DRILL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['drills'],
  properties: {
    drills: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'goal', 'duration_min', 'description', 'why'],
        properties: {
          title: { type: 'string' },
          goal: { type: 'string' },
          duration_min: { type: 'number' },
          description: { type: 'string' },
          why: { type: 'string' },
        },
      },
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST')
    return new Response('method not allowed', { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const parsed = await openAIJson({
      instructions: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Student level: ${body.student_level ?? 'intermediate'}\nRecent tags: ${(body.last_tags ?? []).join(', ')}\nGoal: ${body.goal ?? 'general improvement'}\nGroup size: ${body.group_size ?? '1-on-1'}\n\nReturn JSON.`,
        },
      ],
      schemaName: 'drill_suggestions',
      schema: DRILL_SCHEMA,
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
