import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Plus, Search, ChevronRight } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  age?: number;
  level: string;
  lastSession?: string;
  trend: 'up' | 'flat' | 'down';
  tags: string[];
}

const SEED: Student[] = [
  { id: '1', name: 'Maya Patel', age: 11, level: 'Intermediate', lastSession: '2 days ago', trend: 'up', tags: ['topspin-forehand', 'split-step'] },
  { id: '2', name: 'Diego Alvarez', age: 9, level: 'Beginner', lastSession: '5 days ago', trend: 'up', tags: ['serve', 'consistency'] },
  { id: '3', name: 'Sofia Nguyen', age: 14, level: 'Advanced', lastSession: 'yesterday', trend: 'flat', tags: ['backhand-slice', 'volleys'] },
  { id: '4', name: 'Owen Kim', age: 12, level: 'Intermediate', lastSession: '11 days ago', trend: 'down', tags: ['third-shot-drop'] },
  { id: '5', name: 'Lila Brooks', age: 10, level: 'Beginner', lastSession: 'today', trend: 'up', tags: ['dinking', 'positioning'] },
  { id: '6', name: 'Theo Singh', age: 13, level: 'Intermediate', lastSession: '17 days ago', trend: 'down', tags: ['serve', 'footwork'] },
  { id: '7', name: 'Aria Chen', age: 8, level: 'Beginner', lastSession: '3 days ago', trend: 'up', tags: ['ground-strokes'] },
  { id: '8', name: 'Marcus Lee', age: 16, level: 'Advanced', lastSession: '4 days ago', trend: 'flat', tags: ['kick-serve', 'approach-shot'] },
];

export default function Students() {
  const [q, setQ] = useState('');
  const filtered = SEED.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  const stale = SEED.filter((s) => s.trend === 'down');

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Progression tracking across coaches. Travels with the player when they switch."
        actions={<button className="btn-primary"><Plus className="size-4" /> Add student</button>}
      />
      <div className="px-8 py-6 space-y-6">
        {stale.length > 0 && (
          <div className="card p-4 border-clay/30 bg-clay/5">
            <div className="text-sm font-medium text-clay">⚠ {stale.length} students at risk of churn</div>
            <div className="text-sm text-ink-300 mt-1">
              {stale.map((s) => s.name).join(', ')} haven't been on court in 10+ days. Tap to send a comp clinic invite.
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="size-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search students…"
              className="input pl-9"
            />
          </div>
          <div className="text-sm text-ink-400">{filtered.length} of {SEED.length}</div>
        </div>

        <div className="card divide-y divide-ink-700/60 overflow-hidden">
          {filtered.map((s) => (
            <button key={s.id} className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-ink-800/40">
              <div className="size-10 rounded-full bg-ink-700/60 border border-ink-600 flex items-center justify-center font-medium">
                {s.name.split(' ').map((p) => p[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{s.name} <span className="text-ink-500 font-normal text-sm">· {s.age} · {s.level}</span></div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {s.tags.map((t) => (
                    <span key={t} className="pill">{t}</span>
                  ))}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className={s.trend === 'up' ? 'text-court' : s.trend === 'down' ? 'text-clay' : 'text-ink-400'}>
                  {s.trend === 'up' ? '↑ improving' : s.trend === 'down' ? '↓ at risk' : '→ steady'}
                </div>
                <div className="text-xs text-ink-500">{s.lastSession}</div>
              </div>
              <ChevronRight className="size-4 text-ink-500" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
