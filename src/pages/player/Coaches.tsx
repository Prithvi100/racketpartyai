import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { MapPin, BadgeCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Coach {
  id: string;
  full_name: string | null;
  city: string | null;
  sport: string | null;
  skill_level: string | null;
  bio: string | null;
}

export default function Coaches() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase is not configured.');
      return;
    }

    async function load() {
      const { data, error } = await supabase!
        .from('profiles')
        .select('id, full_name, city, sport, skill_level, bio')
        .eq('role', 'coach')
        .order('full_name');

        if (error) throw error;
        setCoaches((data ?? []) as Coach[]);
    }

    load().catch((e: unknown) => setErr(String(e)));
  }, []);

  return (
    <>
      <PageHeader
        title="Find a coach"
        subtitle="Verified outcomes, not just star ratings."
      />
      <div className="px-8 py-6 grid md:grid-cols-2 gap-4">
        {err && <div className="card p-5 text-sm text-red-400 md:col-span-2">{err}</div>}
        {!err && coaches.length === 0 && (
          <div className="card p-5 md:col-span-2">
            <div className="font-semibold">No coaches listed</div>
            <p className="text-sm text-ink-400 mt-1">Coach profiles appear here after real accounts are created.</p>
          </div>
        )}
        {coaches.map((c) => {
          const name = c.full_name ?? 'Unnamed coach';
          return (
          <div key={c.id} className="card p-5">
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-full bg-ink-700/60 border border-ink-600 flex items-center justify-center font-medium">
                {initials(name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{name}</span>
                  <BadgeCheck className="size-4 text-court" />
                </div>
                <div className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3.5" /> {c.city ?? 'Location not set'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {c.sport && <span className="pill">{c.sport}</span>}
              {c.skill_level && <span className="pill">{c.skill_level}</span>}
            </div>
            {c.bio && <p className="text-sm text-ink-300 mt-3">{c.bio}</p>}
            <div className="mt-4 flex gap-2">
              <button className="btn-primary text-sm">Book a lesson</button>
              <button className="btn-ghost text-sm">View profile</button>
            </div>
          </div>
          );
        })}
      </div>
    </>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
