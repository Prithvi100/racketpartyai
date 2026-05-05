import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Calendar, MapPin, Users, Plus, Sparkles } from 'lucide-react';

interface Match {
  id: string;
  when: string;
  level: string;
  venue: string;
  city: string;
  filled: number;
  capacity: number;
  organizer: string;
  notes?: string;
  ai_pick?: boolean;
}

const SEED: Match[] = [
  { id: '1', when: 'Tonight 7:00 PM', level: '3.5 Doubles', venue: 'Pickle Rage Austin', city: 'Austin, TX', filled: 3, capacity: 4, organizer: 'Carlos M.', ai_pick: true, notes: 'Friendly group, 90 min play.' },
  { id: '2', when: 'Tomorrow 6:30 AM', level: '3.0–3.5 Open Play', venue: 'Lake Hills Park', city: 'Austin, TX', filled: 6, capacity: 8, organizer: 'Hannah W.' },
  { id: '3', when: 'Sat 9:00 AM', level: '4.0 Doubles', venue: 'Westwood Country Club', city: 'Austin, TX', filled: 2, capacity: 4, organizer: 'Marcus L.' },
  { id: '4', when: 'Sat 11:30 AM', level: '3.5 Mixed', venue: 'The Picklr — Round Rock', city: 'Round Rock, TX', filled: 3, capacity: 4, organizer: 'Priya S.', ai_pick: true, notes: 'Match your level, 12 min drive.' },
  { id: '5', when: 'Sun 5:00 PM', level: '3.5 Singles ladder', venue: 'Pickleball Kingdom', city: 'Austin, TX', filled: 4, capacity: 8, organizer: 'James O.' },
];

export default function Matches() {
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

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
          <span className="ml-auto pill"><Sparkles className="size-3 text-court" /> AI-ranked for you</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {SEED.map((m) => (
            <div key={m.id} className={`card p-5 ${m.ai_pick ? 'border-court/40 bg-court/5' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-court flex items-center gap-2">
                    <Calendar className="size-3.5" /> {m.when}
                  </div>
                  <div className="font-semibold mt-1">{m.level}</div>
                </div>
                {m.ai_pick && (
                  <span className="pill">
                    <Sparkles className="size-3 text-court" /> top pick
                  </span>
                )}
              </div>
              <div className="text-sm text-ink-300 mt-3 flex items-center gap-2">
                <MapPin className="size-3.5 text-ink-500" /> {m.venue} · {m.city}
              </div>
              <div className="text-sm text-ink-300 mt-1.5 flex items-center gap-2">
                <Users className="size-3.5 text-ink-500" /> {m.filled}/{m.capacity} players · org. by {m.organizer}
              </div>
              {m.notes && <p className="mt-3 text-sm text-ink-400 italic">"{m.notes}"</p>}
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
