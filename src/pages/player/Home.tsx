import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import ChatBox from '../../components/ChatBox';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Sparkles, Search, ArrowRight, Calendar } from 'lucide-react';

export default function PlayerHome() {
  const { profile } = useAuth();
  return (
    <>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] ?? 'player'}.`}
        subtitle="Find a game tonight. See your latest highlights. Track your skill."
      />
      <div className="px-8 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat n="3.5" label="Skill rating" />
            <Stat n="12" label="Matches played" />
            <Stat n="74%" label="Win rate (30d)" />
            <Stat n={9} label="New highlights" />
          </div>

          <div className="card p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-court/15 border border-court/30 text-court flex items-center justify-center">
              <Trophy className="size-6" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Tonight at 7 PM — looking for a 4th</div>
              <div className="text-sm text-ink-400">3.5 doubles · Pickle Rage Austin · 3 spots filled</div>
            </div>
            <Link to="/player/matches" className="btn-primary">Join <ArrowRight className="size-4" /></Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ShortcutCard
              to="/player/matches"
              icon={<Trophy className="size-5" />}
              title="Match finder"
              body="Pickup games at your level near you."
            />
            <ShortcutCard
              to="/player/highlights"
              icon={<Sparkles className="size-5" />}
              title="My highlights"
              body="Every clip your coach has sent, in one feed."
            />
            <ShortcutCard
              to="/player/coaches"
              icon={<Search className="size-5" />}
              title="Find a coach"
              body="Verified outcomes. Book a single lesson or a package."
            />
            <ShortcutCard
              to="/player/matches"
              icon={<Calendar className="size-5" />}
              title="Leagues near me"
              body="Spring 3.5 mixed-doubles starts in 9 days."
            />
          </div>
        </div>

        <div>
          <ChatBox
            persona="player"
            intro="I'm your RacketParty AI. Tell me where you play, when you're free, and your level — I'll line up matches and coaches."
            suggestions={[
              "I'm 3.5 in Austin and free Tuesdays",
              'Find me a coach who specializes in third-shot drops',
              'When does the spring league start?',
            ]}
            compact
          />
        </div>
      </div>
    </>
  );
}

function Stat({ n, label }: { n: string | number; label: string }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-semibold">{n}</div>
      <div className="text-xs text-ink-400 mt-1">{label}</div>
    </div>
  );
}

function ShortcutCard({ to, icon, title, body }: any) {
  return (
    <Link to={to} className="card p-4 flex gap-3 hover:border-ink-600 transition">
      <div className="size-9 rounded-lg bg-ink-700/40 border border-ink-600 flex items-center justify-center text-ink-200">
        {icon}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-ink-400 mt-0.5">{body}</div>
      </div>
    </Link>
  );
}
