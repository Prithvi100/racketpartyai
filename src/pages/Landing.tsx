import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  AudioLines,
  Bot,
  Building2,
  CalendarCheck,
  DatabaseZap,
  Gauge,
  LineChart,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import ChatBox from '../components/ChatBox';
import Logo from '../components/Logo';
import type { Persona } from '../lib/ai';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=2200&q=85';

export default function Landing() {
  const [, setDetected] = useState<Persona>('visitor');

  return (
    <div className="min-h-screen bg-ink-900 text-ink-50">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-ink-900/70 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" aria-label="RacketParty home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-ink-300 md:flex">
            <a href="#product" className="hover:text-ink-50">Product</a>
            <a href="#coaches" className="hover:text-ink-50">Coaches</a>
            <a href="#clubs" className="hover:text-ink-50">Clubs</a>
            <a href="#system" className="hover:text-ink-50">Data layer</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative flex min-h-[92svh] items-end overflow-hidden px-5 pb-10 pt-28"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(13,14,20,.96) 0%, rgba(13,14,20,.76) 42%, rgba(13,14,20,.24) 100%), linear-gradient(0deg, rgba(13,14,20,.98) 0%, rgba(13,14,20,0) 38%), url(${HERO_IMAGE})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div className="max-w-3xl pb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-court/40 bg-court/10 px-3 py-1 text-xs font-medium text-court">
                <Bot className="size-3.5" /> AI ops for the whole racquet business
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
                Turn every court, lesson, and player signal into action.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-200">
                RacketParty connects coaches, players, parents, and club operators with one AI layer:
                lesson notes, match discovery, live court economics, and the operating decisions that move revenue.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/signup" className="btn-primary">
                  Connect real data <ArrowRight className="size-4" />
                </Link>
                <a href="#product" className="btn-outline">See the product</a>
              </div>
              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                <HeroSignal icon={<AudioLines className="size-4" />} value="Voice" label="to lesson notes" />
                <HeroSignal icon={<Gauge className="size-4" />} value="RevPACH" label="from bookings" />
                <HeroSignal icon={<DatabaseZap className="size-4" />} value="Supabase" label="live system" />
              </div>
            </div>

            <div className="hidden pb-2 lg:block">
              <div className="grid gap-3">
                <OpsTile
                  icon={<Activity className="size-4" />}
                  title="Today’s court pulse"
                  value="Live once bookings sync"
                  detail="Utilization, price, surface, and programming mix flow into the club workspace."
                />
                <OpsTile
                  icon={<CalendarCheck className="size-4" />}
                  title="Coach workflow"
                  value="Recap in 30 seconds"
                  detail="Lesson transcript becomes coach notes, parent update, and the next-session plan."
                />
                <OpsTile
                  icon={<Search className="size-4" />}
                  title="Player network"
                  value="Matches and coaches"
                  detail="Players see real matches, highlights, and coach profiles from your database."
                />
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="border-y border-ink-800 bg-ink-900 px-5 py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-court">Product surface</div>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
                A working front door, not a brochure.
              </h2>
              <p className="mt-4 max-w-xl text-ink-400">
                The chat is still the landing experience, but it now sits beside concrete product flows:
                connected court bookings, real coach data, actual matches, and empty states when data is not present.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <ProductPoint icon={<Mic className="size-4" />} title="Coach copilot" body="Lesson notes, drill suggestions, student records." />
                <ProductPoint icon={<Trophy className="size-4" />} title="Player hub" body="Matches, highlights, coach discovery." />
                <ProductPoint icon={<Building2 className="size-4" />} title="Club ops" body="Yield, mix, utilization, conversion planning." />
                <ProductPoint icon={<ShieldCheck className="size-4" />} title="Production posture" body="No silent demos or fake fallback numbers." />
              </div>
            </div>
            <ChatBox
              persona="visitor"
              onPersonaDetected={setDetected}
              suggestions={[
                'How would a coach use this after a lesson?',
                'What data do club analytics need?',
                'Show me the player experience',
              ]}
            />
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-court">Three workspaces</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                One platform for the people who make courts busy.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <AudienceCard
                id="coaches"
                icon={<Mic className="size-5" />}
                title="Coaches"
                description="Capture what happened on court and turn it into notes, parent communication, and drills."
                items={['Voice-to-notes', 'Student history', 'Adaptive drills']}
              />
              <AudienceCard
                id="players"
                icon={<Trophy className="size-5" />}
                title="Players & parents"
                description="Find the right game, track progress, and keep every highlight in one feed."
                items={['Match finder', 'Coach search', 'Highlight library']}
              />
              <AudienceCard
                id="clubs"
                icon={<LineChart className="size-5" />}
                title="Club operators"
                description="See revenue per available court-hour and program courts around real demand."
                items={['Yield', 'Programming mix', 'Court conversion']}
              />
            </div>
          </div>
        </section>

        <section id="system" className="border-y border-ink-800 bg-ink-800/35 px-5 py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-court">Data layer</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Built to tell the truth when data is missing.
              </h2>
              <p className="mt-4 text-ink-400">
                Production software should not make up KPIs. RacketParty now reads from Supabase and shows a clear connection state until real data arrives.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <SystemRow title="Supabase project" value="xegzwzsyoxgwwyxyaabu" />
              <SystemRow title="Court bookings" value="Revenue, utilization, RevPACH" />
              <SystemRow title="Coach data" value="Students, lessons, drills" />
              <SystemRow title="Player data" value="Matches, signups, highlights" />
            </div>
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-court/30 bg-court/10 text-court">
              <Sparkles className="size-6" />
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight">Bring the real data online.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink-400">
              Add the Supabase anon key, deploy the Edge Functions, then import bookings and profiles. The app will populate from live tables instead of placeholders.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="btn-primary">Create account</Link>
              <Link to="/login" className="btn-outline">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-800 px-5 py-8 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} RacketParty. Built AI-first.
      </footer>
    </div>
  );
}

function HeroSignal({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md">
      <div className="flex items-center gap-2 text-court">
        {icon}
        <span className="text-sm font-semibold">{value}</span>
      </div>
      <div className="mt-1 text-xs text-ink-300">{label}</div>
    </div>
  );
}

function OpsTile({
  icon,
  title,
  value,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/62 p-4 shadow-2xl shadow-black/25 backdrop-blur-md">
      <div className="flex items-center gap-2 text-sm text-ink-300">
        <span className="flex size-8 items-center justify-center rounded-lg border border-court/25 bg-court/10 text-court">{icon}</span>
        {title}
      </div>
      <div className="mt-3 text-xl font-semibold">{value}</div>
      <p className="mt-1 text-sm leading-6 text-ink-400">{detail}</p>
    </div>
  );
}

function ProductPoint({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-800/60 p-4">
      <div className="flex items-center gap-2 text-court">
        {icon}
        <span className="font-medium text-ink-50">{title}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-400">{body}</p>
    </div>
  );
}

function AudienceCard({
  id,
  icon,
  title,
  description,
  items,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div id={id} className="card p-6 transition hover:border-ink-500">
      <div className="flex size-11 items-center justify-center rounded-lg border border-court/30 bg-court/10 text-court">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-2 min-h-[72px] text-sm leading-6 text-ink-400">{description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="pill">{item}</span>
        ))}
      </div>
      <Link to="/signup" className="btn-outline mt-6 w-full">
        Start here <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function SystemRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900/55 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Zap className="size-4 text-court" />
        {title}
      </div>
      <div className="mt-2 text-sm text-ink-400">{value}</div>
    </div>
  );
}
