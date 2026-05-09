import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { suggestDrills, type DrillSuggestion } from '../../lib/ai';
import { Sparkles, Heart, Plus, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CommunityDrill {
  id: string;
  title: string;
  goal: string;
  skill_level: string | null;
  duration_min: number | null;
  upvotes: number | null;
  author?: { full_name: string | null } | null;
  description: string | null;
}

export default function Drills() {
  const [busy, setBusy] = useState(false);
  const [picks, setPicks] = useState<DrillSuggestion[] | null>(null);
  const [level, setLevel] = useState('Intermediate');
  const [tags, setTags] = useState('');
  const [community, setCommunity] = useState<CommunityDrill[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase is not configured.');
      return;
    }

    async function load() {
      const { data, error } = await supabase!
        .from('drills')
        .select('id, title, goal, skill_level, duration_min, upvotes, description, author:profiles(full_name)')
        .eq('is_public', true)
        .order('upvotes', { ascending: false });

        if (error) throw error;
      setCommunity((data ?? []).map((row: any) => ({
        ...row,
        author: Array.isArray(row.author) ? row.author[0] : row.author,
      })));
    }

    load().catch((e: unknown) => setErr(String(e)));
  }, []);

  async function suggest() {
    setBusy(true);
    try {
      const out = await suggestDrills({
        student_level: level.toLowerCase(),
        last_tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setPicks(out.drills);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Drill library"
        subtitle="Adaptive recommendations from your data, plus a community-voted catalog."
        actions={<button className="btn-outline"><Plus className="size-4" /> New drill</button>}
      />
      <div className="px-8 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card p-5 h-fit">
          <h3 className="font-semibold flex items-center gap-2"><Sparkles className="size-4 text-court" /> Suggest today's drill</h3>
          <p className="text-sm text-ink-400 mt-1">Based on the student's last lesson tags.</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Student level</label>
              <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">Recent tags (comma-separated)</label>
              <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Optional" />
            </div>
            <button onClick={suggest} disabled={busy} className="btn-primary w-full">
              <Sparkles className="size-4" />
              {busy ? 'Thinking…' : 'Suggest 3 drills'}
            </button>
          </div>
          {picks && (
            <div className="mt-5 space-y-3">
              {picks.map((p) => (
                <div key={p.title} className="rounded-lg border border-court/30 bg-court/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.title}</div>
                    <span className="pill">{p.duration_min}m</span>
                  </div>
                  <div className="text-xs text-court mt-1">{p.goal}</div>
                  <p className="text-sm text-ink-200 mt-2">{p.description}</p>
                  <p className="text-xs text-ink-400 mt-2 italic">Why: {p.why}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-semibold">Community library</h3>
            <span className="pill">{community.length} drills</span>
            <button className="btn-ghost text-xs ml-auto"><Filter className="size-3.5" /> Filter</button>
          </div>
          {err && <div className="card p-5 text-sm text-red-400">{err}</div>}
          {!err && community.length === 0 && (
            <div className="card p-5">
              <div className="font-semibold">No public drills yet</div>
              <p className="text-sm text-ink-400 mt-1">Create public drills in Supabase to populate this library.</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {community.map((d) => (
              <div key={d.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{d.title}</div>
                  <button className="text-ink-400 hover:text-clay text-xs flex items-center gap-1">
                    <Heart className="size-3.5" /> {d.upvotes ?? 0}
                  </button>
                </div>
                <div className="text-xs text-court mt-0.5">{d.goal}</div>
                <div className="text-xs text-ink-400 mt-1">
                  {d.skill_level ?? 'Any level'} · {d.duration_min ?? 0} min · {d.author?.full_name ?? 'Unknown author'}
                </div>
                {d.description && <p className="text-sm text-ink-300 mt-3">{d.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
