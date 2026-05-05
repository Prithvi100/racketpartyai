import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { suggestDrills, type DrillSuggestion } from '../../lib/ai';
import { Sparkles, Heart, Plus, Filter } from 'lucide-react';

interface CommunityDrill {
  id: string;
  title: string;
  goal: string;
  level: string;
  duration: number;
  upvotes: number;
  author: string;
  tags: string[];
}

const COMMUNITY: CommunityDrill[] = [
  { id: '1', title: 'Cross-court Consistency Ladder', goal: 'Forehand depth', level: 'Intermediate', duration: 12, upvotes: 142, author: 'Coach Avery', tags: ['forehand', 'depth'] },
  { id: '2', title: 'Two-bounce Decision Drill', goal: 'Kitchen-line decisions', level: 'Beginner', duration: 10, upvotes: 88, author: 'Coach Park', tags: ['third-shot-drop', 'positioning'] },
  { id: '3', title: 'Targets on the T', goal: 'Serve placement', level: 'Intermediate', duration: 8, upvotes: 76, author: 'Coach Sims', tags: ['serve'] },
  { id: '4', title: 'Mirror Footwork', goal: 'Lateral footwork', level: 'Beginner', duration: 6, upvotes: 64, author: 'Coach Reyes', tags: ['footwork', 'split-step'] },
  { id: '5', title: 'Dink Battle', goal: 'Soft-game patience', level: 'Intermediate', duration: 15, upvotes: 122, author: 'Coach Le', tags: ['dinking'] },
  { id: '6', title: 'Approach & Volley Combo', goal: 'Net transition', level: 'Advanced', duration: 12, upvotes: 51, author: 'Coach Ndiaye', tags: ['approach-shot', 'volley'] },
];

export default function Drills() {
  const [busy, setBusy] = useState(false);
  const [picks, setPicks] = useState<DrillSuggestion[] | null>(null);
  const [level, setLevel] = useState('Intermediate');
  const [tags, setTags] = useState('topspin-forehand, split-step');

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
              <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} />
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
            <span className="pill">{COMMUNITY.length} drills</span>
            <button className="btn-ghost text-xs ml-auto"><Filter className="size-3.5" /> Filter</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {COMMUNITY.map((d) => (
              <div key={d.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{d.title}</div>
                  <button className="text-ink-400 hover:text-clay text-xs flex items-center gap-1">
                    <Heart className="size-3.5" /> {d.upvotes}
                  </button>
                </div>
                <div className="text-xs text-court mt-0.5">{d.goal}</div>
                <div className="text-xs text-ink-400 mt-1">{d.level} · {d.duration} min · {d.author}</div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {d.tags.map((t) => (
                    <span key={t} className="pill">#{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
