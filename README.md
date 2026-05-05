# RacketParty

The AI operating system for racquet sports — coaches, players & parents, club operators, all in one product.

## Why this shape

- **Coaches** are the wedge: voice-to-lesson-notes, adaptive drill library, parent updates, highlight reels.
- **Players & parents** show up for the social half: match-finder, leagues, highlights, finding a coach.
- **Club operators** are the high-ACV expansion: yield, churn, programming mix, court conversion — sitting on top of CourtReserve / Playbypoint / Club Automation.

The landing page is itself the product surface: an AI chat box that routes you to the right side of the platform.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- React Router
- Supabase (auth + Postgres + Edge Functions)
- Anthropic Claude (Sonnet 4.6) via Edge Functions
- Recharts for ops analytics

## Project layout

```
src/
  pages/
    Landing.tsx          AI-native landing with chat box
    Login.tsx / Signup.tsx
    coach/               voice-to-notes, students, drills, schedule
    player/              home, matches, highlights, coaches
    club/                yield, churn, programming mix, court conversion
  components/            ChatBox, Layout, Markdown, Logo
  contexts/AuthContext.tsx
  lib/                   supabase.ts, ai.ts (streaming chat + insights)
supabase/
  migrations/0001_init.sql
  functions/
    chat/                streaming AI concierge
    lesson-notes/        voice → structured notes
    drill-suggest/       adaptive drill recommender
    club-insights/       yield / churn / mix / conversion analyses
```

## Getting started

```bash
npm install
cp .env.example .env   # fill in Supabase URL + anon key (or skip — demo mode works without)
npm run dev
```

The app runs in **demo mode** without Supabase configured: auth uses local-storage profiles
(`Try the coach demo`, etc.), and the AI surfaces use canned-but-realistic responses so the UI
feels alive in any environment.

## Wiring up Supabase

1. Create a project at supabase.com.
2. Run the migration in `supabase/migrations/0001_init.sql`.
3. Deploy the Edge Functions (`supabase functions deploy chat lesson-notes drill-suggest club-insights`).
4. Set `ANTHROPIC_API_KEY` as a function secret.
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

## Demo accounts

Click **Try the coach / player / club demo** on the landing page or login screen — it
bypasses auth and seeds a local profile so you can walk all three workspaces.

## Roadmap (90-day MVP)

1. Voice-to-notes + parent updates (the wedge).
2. Highlight reel pipeline (phone-first; club-cam integration via partners).
3. Drill library with community voting and adaptive recommendations.
4. Match-finder with skill-level matching.
5. Club analytics dashboard (yield first, then churn, then mix).
