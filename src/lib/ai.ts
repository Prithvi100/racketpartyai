import { FUNCTIONS_URL } from './supabase';

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export type Persona = 'coach' | 'player' | 'club' | 'visitor';

// Local demo replies used when no Supabase function URL is configured.
// Lets the UI feel alive without a backend.
function demoReply(messages: ChatMsg[], persona: Persona): string {
  const last = messages[messages.length - 1]?.content?.toLowerCase() ?? '';

  if (/coach|lesson|drill|student/.test(last) || persona === 'coach') {
    return [
      "Got it — I'll set you up as a coach.",
      '',
      "Here's what RacketParty does for you:",
      '• **Voice-to-notes** — talk for 30s after a lesson, get structured notes, a parent update, and tomorrow\'s plan',
      '• **Adaptive drill library** — suggests today\'s drill based on the student\'s last 3 sessions',
      '• **Highlight delivery** — phone-filmed clips auto-edited and sent to parents (with a paid tier you keep a cut of)',
      '',
      'Want me to spin up a sample student so you can try the voice-to-notes flow?',
    ].join('\n');
  }
  if (/club|operator|facility|yield|churn|revenue/.test(last) || persona === 'club') {
    return [
      "Operator mode — let's talk court-hours.",
      '',
      'RacketParty sits on top of CourtReserve / Playbypoint / Club Automation as your decision layer:',
      '• **Yield** — recommended price per court-hour for the next 14 days, with explainability',
      '• **Churn** — at-risk member list with intervention plays',
      '• **Programming mix** — open-play vs leagues vs clinics, optimized for revenue',
      '• **Court conversion** — when to flip a tennis court to two pickleball courts',
      '',
      'What\'s your booking system? I can show a mock dashboard tuned to it.',
    ].join('\n');
  }
  if (/play|game|partner|league|match|find|level|skill/.test(last) || persona === 'player') {
    return [
      "Player mode. The fun stuff.",
      '',
      '• **Match finder** — pickup games near you matched to your level',
      '• **Coach search** — find a coach with verified student outcomes',
      '• **Your highlights** — every clip your coach sends, in one place',
      '',
      'What city are you in and what\'s your level?',
    ].join('\n');
  }
  return [
    "Welcome to RacketParty — the AI operating system for racquet sports.",
    '',
    'Tell me which one you are and I\'ll point you to the right product:',
    '• **Coach** — lesson notes, drills, parent updates, highlights',
    '• **Player or parent** — match-finding, highlights, finding a coach',
    '• **Club operator** — yield, churn, programming mix, court conversion',
  ].join('\n');
}

export async function streamChat(
  messages: ChatMsg[],
  persona: Persona,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!FUNCTIONS_URL) {
    // Demo fallback — type out the canned reply.
    const reply = demoReply(messages, persona);
    for (const ch of reply) {
      if (signal?.aborted) return;
      onDelta(ch);
      // small delay for typing effect
      await new Promise((r) => setTimeout(r, 8));
    }
    return;
  }

  const res = await fetch(`${FUNCTIONS_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''}`,
    },
    body: JSON.stringify({ messages, persona }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);

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
    // Local mock paths
    if (name === 'lesson-notes') return mockLessonNotes(body) as T;
    if (name === 'drill-suggest') return mockDrills() as T;
    if (name === 'club-insights') return mockClubInsight(body) as T;
    throw new Error(`function ${name} not configured`);
  }
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name} ${res.status}`);
  return res.json();
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

// ---------- Mocks (used when no backend) ----------

function mockLessonNotes(body: any): LessonNotes {
  const t: string = body?.transcript ?? '';
  const tags: string[] = [];
  if (/forehand|fh/i.test(t)) tags.push('forehand');
  if (/backhand|bh/i.test(t)) tags.push('backhand');
  if (/serve/i.test(t)) tags.push('serve');
  if (/dink/i.test(t)) tags.push('dinking');
  if (/third\s*shot|drop/i.test(t)) tags.push('third-shot-drop');
  if (/footwork|split[-\s]?step/i.test(t)) tags.push('split-step');
  if (/topspin/i.test(t)) tags.push('topspin');
  if (tags.length === 0) tags.push('consistency', 'positioning');
  const name = body?.student_name ?? 'your student';
  return {
    summary: [
      `• Worked on ${tags.slice(0, 2).join(' and ')} for the bulk of the session`,
      `• Energy was high; ${name} was consistent for 8+ ball rallies`,
      `• Identified that contact point was late on the ${tags[0]} side`,
      `• Confidence built late in the lesson during live points`,
    ].join('\n'),
    parent_update:
      `${name} had a great session today — strong focus on ${tags[0]} and ${tags[1] ?? 'court positioning'}. Big jump in rally consistency by the end. We'll build on this next time.`,
    next_plan: [
      `• Open with 5 min of split-step warm-up`,
      `• Drill ${tags[0]} cross-court targets, 3 sets of 10`,
      `• Live points starting at 2-2; reward ${tags[0]} winners`,
    ].join('\n'),
    technique_tags: tags.slice(0, 5),
  };
}

function mockDrills() {
  return {
    drills: [
      {
        title: 'Cross-court Consistency Ladder',
        goal: 'Build forehand depth & rhythm',
        duration_min: 12,
        description:
          '7 cross-court forehands at three-quarter pace into the deep half-court, then live point. Repeat. Coach feeds.',
        why: 'Last session showed late contact on the forehand — this rebuilds timing without adding power.',
      },
      {
        title: 'Two-bounce Decision Drill',
        goal: 'Decision-making at the kitchen line',
        duration_min: 10,
        description:
          'Two-bounce rule, then players race to the kitchen. First team to 5 wins.',
        why: 'Reinforces the third-shot-drop tag from the prior lesson.',
      },
      {
        title: 'Targets on the T',
        goal: 'Serve placement',
        duration_min: 8,
        description:
          'Cones on the T and out-wide. 3 serves to each. Score one point per cone hit.',
        why: 'Serve was identified as the weakest stroke last week.',
      },
    ],
  };
}

function mockClubInsight(body: any): { analysis: string } {
  const kind = body?.kind ?? 'yield';
  const map: Record<string, string> = {
    yield: `## Yield recommendations — next 14 days

**Highest leverage**
- Tue/Wed 6–8 PM running at 96% utilization → raise from $32 to **$38** (+18.7%). Capture-rate model expects <4% drop in fill.
- Sat 9–11 AM at 92% → raise from $28 to **$32**.

**Soft inventory**
- Mon/Thu 1–3 PM at 28% → introduce a **$14 "Lunch League"** package (open play + clinic).
- Sun 8–10 PM at 19% → bundle with **junior clinic** at no marginal cost.

**Suggested A/B test**
- Split courts 1–4 vs 5–8 for a 14-day price test on Tue evenings. Power analysis says n≈ 96 booked hours per arm to detect 6% lift at p<0.05.

> Modeled lift: **+$11.4K** monthly RevPACH at this facility.`,
    churn: `## At-risk members (top 8)

| Member | Risk | Last visit | Save play |
| --- | --- | --- | --- |
| K. Patel | 0.81 | 31d | Captain a Tue 3.5 league |
| M. Alvarez | 0.78 | 26d | Comp clinic invite (drop-shot) |
| J. Liu | 0.74 | 22d | Personal note from pro + free hour |
| ... | | | |

**Common signal**: missed two consecutive league nights; clinics they attended are no longer on the schedule. Build a "schedule changed" auto-flow that surfaces alternates within 48 h.`,
    mix: `## Programming mix — recommended weekly schedule

Current vs recommended (court-hours/week):
- Open play: 142 → **120** (−22)
- Leagues: 64 → **78** (+14)
- Clinics: 28 → **34** (+6)
- Lessons: 38 → **40** (+2)

**Why**: open-play utilization Tue/Wed evenings is a structural overhang while league waitlists are 19 deep. Modeled revenue lift **+$8.6K/wk** at current pricing.`,
    conversion: `## Court conversion plan

- **Tue 4–9 PM**: convert tennis courts 5 & 6 → 4 pickleball courts. Pickleball demand index 2.4× tennis in this window.
- **Sat 8–11 AM**: keep 5 & 6 as tennis (junior academy demand peaks).
- **Sun 6–10 PM**: dynamic — flip 6 only if pickleball waitlist > 6 at 5:30 PM.

Net upside vs static schedule: **+$4.2K/wk**.`,
  };
  return { analysis: map[kind] ?? map.yield };
}
