import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Mic,
  Sparkles,
  Trophy,
  LineChart,
  Bot,
  ArrowRight,
  Zap,
  Users,
  ShieldCheck,
} from 'lucide-react';
import ChatBox from '../components/ChatBox';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import type { Persona } from '../lib/ai';

export default function Landing() {
  const nav = useNavigate();
  const { signInDemo } = useAuth();
  const [, setDetected] = useState<Persona>('visitor');

  function tryDemo(role: 'coach' | 'player' | 'club_admin') {
    signInDemo(role);
    nav(role === 'coach' ? '/coach' : role === 'player' ? '/player' : '/club');
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-300">
          <a href="#coaches" className="hover:text-ink-50">For coaches</a>
          <a href="#players" className="hover:text-ink-50">For players</a>
          <a href="#clubs" className="hover:text-ink-50">For clubs</a>
          <a href="#how" className="hover:text-ink-50">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm">Get started</Link>
        </div>
      </header>

      {/* Hero with chat */}
      <section className="px-6 pt-8 pb-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-court/40 bg-court/10 text-court text-xs font-medium mb-6">
              <Bot className="size-3.5" /> AI-native from the first click
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              The AI operating system for{' '}
              <span className="text-court">racquet sports</span>.
            </h1>
            <p className="mt-5 text-lg text-ink-300 max-w-xl">
              One product for coaches, players, and clubs. Voice-to-lesson notes.
              Highlight reels parents pay for. Yield, churn, and programming-mix
              optimization for facilities. Built on the booking systems you already use.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/signup" className="btn-primary">
                Start free — talk to the AI <ArrowRight className="size-4" />
              </Link>
              <button onClick={() => tryDemo('coach')} className="btn-outline">
                Try the coach demo
              </button>
              <button onClick={() => tryDemo('club_admin')} className="btn-ghost">
                Or club operator demo →
              </button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
              <Stat n="30s" label="lesson note" />
              <Stat n="+12-18%" label="RevPACH" />
              <Stat n="3 sports" label="one product" />
            </div>
          </div>

          <div>
            <ChatBox
              persona="visitor"
              onPersonaDetected={setDetected}
            />
            <p className="text-xs text-ink-500 mt-3 text-center">
              Yes, this chatbox is the actual product surface. Try asking what RacketParty does for a 12-court club.
            </p>
          </div>
        </div>
      </section>

      {/* Three audiences */}
      <section className="px-6 py-16 border-t border-ink-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">One platform. Three sides of the court.</h2>
          <p className="text-ink-400 mt-2 max-w-2xl">
            Coaches bring students. Students invite their playing partners. Parents come in for the
            highlights. Clubs see the whole picture and pay for the analytics.
          </p>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <AudienceCard
              id="coaches"
              tone="court"
              title="Coaches"
              tagline="Linear for tennis & pickleball pros."
              bullets={[
                'Voice-to-notes after every lesson',
                'Adaptive drill library that suggests today\'s drill',
                'Highlight reels parents pay for',
                'Coach-to-coach handoffs that travel with the player',
              ]}
              cta="Try the coach demo"
              onTry={() => tryDemo('coach')}
              icon={<Mic className="size-5" />}
            />
            <AudienceCard
              id="players"
              title="Players & parents"
              tone="clay"
              tagline="The party half of RacketParty."
              bullets={[
                'Pickup games matched to your level',
                'Find a coach with verified outcomes',
                'Every highlight your coach sends',
                'Skill progression tracked across coaches',
              ]}
              cta="Try the player demo"
              onTry={() => tryDemo('player')}
              icon={<Trophy className="size-5" />}
            />
            <AudienceCard
              id="clubs"
              title="Club operators"
              tone="court"
              tagline="Decision-intelligence on top of CourtReserve, Playbypoint, Club Automation."
              bullets={[
                'Yield: $/court-hour for the next 14 days, with explainability',
                'Churn prediction with save plays',
                'Programming-mix optimizer (open-play / leagues / clinics)',
                'Tennis ↔ pickleball court conversion plan',
              ]}
              cta="Try the club demo"
              onTry={() => tryDemo('club_admin')}
              icon={<LineChart className="size-5" />}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-20 border-t border-ink-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            <Step
              n={1}
              icon={<Mic className="size-5" />}
              title="Coaches log lessons by voice"
              body="Tap one button after a session, talk for 30 seconds. AI structures notes, drafts a parent update, plans tomorrow."
            />
            <Step
              n={2}
              icon={<Users className="size-5" />}
              title="Students & parents see the value"
              body="Highlight reels. Skill progression. Notes that travel between coaches. The tool everyone in the family uses."
            />
            <Step
              n={3}
              icon={<LineChart className="size-5" />}
              title="Clubs get the analytics layer"
              body="Once your coaches and members are in the app, we sell the operator dashboard upstream. Yield, churn, programming mix."
            />
          </div>
        </div>
      </section>

      {/* Defensibility */}
      <section className="px-6 py-20 border-t border-ink-800 bg-gradient-to-b from-ink-900 to-ink-800/40">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <Defensibility
            icon={<Zap className="size-5" />}
            title="Cross-system by design"
            body="One analytics layer across CourtReserve, Square POS, Mailchimp, access control. Incumbents are sleepy on AI; we're not a feature they can swallow."
          />
          <Defensibility
            icon={<Sparkles className="size-5" />}
            title="Real ML, not SQL dashboards"
            body="Demand forecasting, churn modeling, schedule optimization, court conversion. Modeling work the booking systems don't have the talent to build."
          />
          <Defensibility
            icon={<ShieldCheck className="size-5" />}
            title="An industry data layer"
            body="Once we're integrated with three booking systems and have benchmark data across chains, we become the IDeaS of racquet sports."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight">Talk to the AI. Pick your side.</h2>
          <p className="text-ink-400 mt-3">
            The fastest way to see RacketParty is to use it. Sign in or jump into a demo.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => tryDemo('coach')} className="btn-primary">Coach demo</button>
            <button onClick={() => tryDemo('player')} className="btn-outline">Player demo</button>
            <button onClick={() => tryDemo('club_admin')} className="btn-outline">Club demo</button>
            <Link to="/signup" className="btn-ghost">Or create a real account →</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-800 py-8 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} RacketParty. Built AI-first.
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-court">{n}</div>
      <div className="text-xs text-ink-400">{label}</div>
    </div>
  );
}

function AudienceCard({
  id,
  title,
  tagline,
  bullets,
  cta,
  onTry,
  icon,
  tone,
}: {
  id: string;
  title: string;
  tagline: string;
  bullets: string[];
  cta: string;
  onTry: () => void;
  icon: React.ReactNode;
  tone: 'court' | 'clay';
}) {
  const accent = tone === 'court' ? 'text-court border-court/30 bg-court/10' : 'text-clay border-clay/30 bg-clay/10';
  return (
    <div id={id} className="card p-6 hover:border-ink-600 transition">
      <div className={`size-10 rounded-lg flex items-center justify-center border ${accent}`}>
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-ink-400 mt-1">{tagline}</p>
      <ul className="mt-4 space-y-2 text-sm text-ink-200">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-2 size-1.5 rounded-full bg-court shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <button onClick={onTry} className="btn-outline w-full mt-6">
        {cta} <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  icon,
}: {
  n: number;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-court">
        <span className="size-7 rounded-full bg-court/15 border border-court/30 flex items-center justify-center text-xs font-semibold">
          {n}
        </span>
        {icon}
      </div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-ink-400 leading-relaxed">{body}</p>
    </div>
  );
}

function Defensibility({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card p-6">
      <div className="size-9 rounded-lg flex items-center justify-center border border-court/30 bg-court/10 text-court">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-400 leading-relaxed">{body}</p>
    </div>
  );
}
