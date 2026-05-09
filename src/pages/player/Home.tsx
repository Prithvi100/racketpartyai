import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import ChatBox from '../../components/ChatBox';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trophy, Sparkles, Search, ArrowRight, Calendar } from 'lucide-react';

export default function PlayerHome() {
  const { profile } = useAuth();
  const [upcomingMatch, setUpcomingMatch] = useState<any | null>(null);
  const [stats, setStats] = useState({ matches: 0, highlights: 0 });

  useEffect(() => {
    if (!supabase || !profile?.id) return;
    const playerId = profile.id;

    async function load() {
      const [matches, highlights, nextMatch] = await Promise.all([
        supabase!.from('match_signups').select('match_id', { count: 'exact', head: true }).eq('player_id', playerId),
        supabase!.from('highlights').select('id', { count: 'exact', head: true }),
        supabase!
          .from('matches')
          .select('id, starts_at, skill_level, venue, city, max_players, match_signups(player_id)')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      setStats({ matches: matches.count ?? 0, highlights: highlights.count ?? 0 });
      setUpcomingMatch(nextMatch.data);
    }

    load().catch(() => {});
  }, [profile?.id]);

  return (
    <>
      <PageHeader
        title={`Welcome, ${profile?.full_name?.split(' ')[0] ?? 'player'}.`}
        subtitle="Find a game tonight. See your latest highlights. Track your skill."
      />
      <div className="px-8 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat n={profile?.skill_level ?? 'Not set'} label="Skill level" />
            <Stat n={stats.matches} label="Matches joined" />
            <Stat n={profile?.sport ?? 'Not set'} label="Sport" />
            <Stat n={stats.highlights} label="Highlights" />
          </div>

          <div className="card p-6 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-court/15 border border-court/30 text-court flex items-center justify-center">
              <Trophy className="size-6" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{upcomingMatch ? formatWhen(upcomingMatch.starts_at) : 'No upcoming matches found'}</div>
              <div className="text-sm text-ink-400">
                {upcomingMatch
                  ? `${upcomingMatch.skill_level} · ${upcomingMatch.venue ?? 'Venue TBD'} · ${upcomingMatch.match_signups?.length ?? 0}/${upcomingMatch.max_players} players`
                  : 'Post or join a real match to populate this panel.'}
              </div>
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

function formatWhen(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
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
