// Club operator insights: yield, churn, programming mix.
// POST { kind: 'yield'|'churn'|'mix'|'conversion', context: any }
// Returns markdown analysis with concrete recommendations.

import { claudeText, corsHeaders } from '../_shared/anthropic.ts';

const SYSTEMS: Record<string, string> = {
  yield: `You are a yield-management analyst for racquet facilities. Treat court-time as perishable inventory like an airline seat. Given the data, produce: (1) the lowest- and highest-utilization slots, (2) recommended price actions for the next 14 days with explainability, (3) one experiment to A/B test. Be concrete. Use markdown.`,
  churn: `You are a member-retention analyst. Given booking, attendance and lesson activity, identify at-risk members and recommend specific save plays (free clinic, comp lesson, captain-of-league nudge). Output a prioritized list with the rationale per member. Markdown.`,
  mix: `You are a programming-mix optimizer for racquet clubs. Given current ratio of open-play / leagues / clinics / lessons / tournaments and member skill distribution, recommend the revenue-maximizing weekly schedule. Show the diff vs current. Markdown.`,
  conversion: `You are a court-conversion analyst for mixed tennis/pickleball facilities. Given hourly demand for each sport, recommend which courts to flip and when over the next 7 days. Quantify the upside. Markdown.`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST')
    return new Response('method not allowed', { status: 405, headers: corsHeaders });

  try {
    const { kind, context } = await req.json();
    const system = SYSTEMS[kind];
    if (!system) throw new Error(`unknown kind: ${kind}`);

    const text = await claudeText({
      system,
      messages: [
        {
          role: 'user',
          content: `Data:\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\``,
        },
      ],
      max_tokens: 1500,
    });

    return new Response(JSON.stringify({ analysis: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
