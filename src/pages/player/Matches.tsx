import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Calendar, MapPin, Users, Plus, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Match {
  id: string;
  starts_at: string;
  skill_level: string;
  venue: string | null;
  city: string | null;
  filled: number;
  max_players: number;
  organizer?: { full_name: string | null } | null;
  notes?: string | null;
}

export default function Matches() {
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase is not configured.');
      return;
    }

    async function load() {
      const { data, error } = await supabase!
        .from('matches')
        .select('id, starts_at, skill_level, venue, city, max_players, notes, organizer:profiles(full_name), match_signups(player_id)')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true });

        if (error) throw error;
      setMatches((data ?? []).map((row: any) => ({
        ...row,
        organizer: Array.isArray(row.organizer) ? row.organizer[0] : row.organizer,
        filled: row.match_signups?.length ?? 0,
      })));
    }

    load().catch((e: unknown) => setErr(String(e)));
  }, []);

  return (
    <>
      <PageHeader
        title="Match finder"
        subtitle="Pickup games matched to your level, schedule, and venue radius."
        actions={<button className="btn-primary"><Plus className="size-4" /> Post a match</button>}
      />
      <div className="px-8 py-6">
        <div className="flex items-center gap-2 mb-4">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All matches</FilterChip>
          <FilterChip active={filter === 'mine'} onClick={() => setFilter('mine')}>Where I'm in</FilterChip>
          <span className="ml-auto pill"><Sparkles className="size-3 text-court" /> Live matches</span>
        </div>

        {err && <div className="card p-5 text-sm text-red-400">{err}</div>}
        {!err && matches.length === 0 && (
          <div className="card p-5">
            <div className="font-semibold">No upcoming matches</div>
            <p className="text-sm text-ink-400 mt-1">Post a match or import events into Supabase `matches`.</p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((m) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-court flex items-center gap-2">
                    <Calendar className="size-3.5" /> {formatWhen(m.starts_at)}
                  </div>
                  <div className="font-semibold mt-1">{m.skill_level}</div>
                </div>
              </div>
              <div className="text-sm text-ink-300 mt-3 flex items-center gap-2">
                <MapPin className="size-3.5 text-ink-500" /> {m.venue ?? 'Venue TBD'} · {m.city ?? 'City TBD'}
              </div>
              <div className="text-sm text-ink-300 mt-1.5 flex items-center gap-2">
                <Users className="size-3.5 text-ink-500" /> {m.filled}/{m.max_players} players · org. by {m.organizer?.full_name ?? 'Unknown'}
              </div>
              {m.notes && <p className="mt-3 text-sm text-ink-400 italic">{m.notes}</p>}
              <div className="mt-4 flex gap-2">
                <button className="btn-primary text-sm">Join match</button>
                <button className="btn-ghost text-sm">Details</button>
              </div>
            </div>
          ))}
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

function FilterChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border ${
        active ? 'border-court bg-court/15 text-court' : 'border-ink-700 text-ink-300 hover:bg-ink-800'
      }`}
    >
      {children}
    </button>
  );
}
