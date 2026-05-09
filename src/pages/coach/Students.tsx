import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  id: string;
  name: string;
  age?: number;
  skill_level: string | null;
  goals: string | null;
}

export default function Students() {
  const { profile } = useAuth();
  const [q, setQ] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const filtered = students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase is not configured.');
      return;
    }

    async function load() {
      const { data, error } = await supabase!
        .from('students')
        .select('id, name, age, skill_level, goals')
        .eq('coach_id', profile?.id)
        .order('name');

        if (error) throw error;
        setStudents((data ?? []) as Student[]);
    }

    load().catch((e: unknown) => setErr(String(e)));
  }, [profile?.id]);

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Progression tracking across coaches. Travels with the player when they switch."
        actions={<button className="btn-primary"><Plus className="size-4" /> Add student</button>}
      />
      <div className="px-8 py-6 space-y-6">
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
          <div className="text-sm text-ink-400">{filtered.length} of {students.length}</div>
        </div>

        {err && <div className="card p-5 text-sm text-red-400">{err}</div>}
        {!err && students.length === 0 && (
          <div className="card p-5">
            <div className="font-semibold">No students yet</div>
            <p className="text-sm text-ink-400 mt-1">Add real student records to Supabase `students` to start tracking lessons.</p>
          </div>
        )}
        <div className="card divide-y divide-ink-700/60 overflow-hidden">
          {filtered.map((s) => (
            <button key={s.id} className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-ink-800/40">
              <div className="size-10 rounded-full bg-ink-700/60 border border-ink-600 flex items-center justify-center font-medium">
                {s.name.split(' ').map((p) => p[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {s.name} <span className="text-ink-500 font-normal text-sm">· {s.age ?? 'age not set'} · {s.skill_level ?? 'level not set'}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {s.goals && <span className="pill">{s.goals}</span>}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-ink-400">Profile</div>
              </div>
              <ChevronRight className="size-4 text-ink-500" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
