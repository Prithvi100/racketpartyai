import { Fragment, useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p'];

interface Session {
  id: string;
  scheduled_at: string;
  student?: { name: string } | null;
  status: string | null;
}

export default function Schedule() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase is not configured.');
      return;
    }

    async function load() {
      const { data, error } = await supabase!
        .from('lessons')
        .select('id, scheduled_at, status, student:students(name)')
        .eq('coach_id', profile?.id)
        .gte('scheduled_at', weekStart().toISOString())
        .lt('scheduled_at', weekEnd().toISOString())
        .order('scheduled_at');

        if (error) throw error;
      setSessions((data ?? []).map((row: any) => ({
        ...row,
        student: Array.isArray(row.student) ? row.student[0] : row.student,
      })));
    }

    load().catch((e: unknown) => setErr(String(e)));
  }, [profile?.id]);

  return (
    <>
      <PageHeader
        title="Schedule"
        subtitle="Drag to reschedule (in MVP). AI suggests fills for empty slots."
      />
      <div className="px-8 py-6">
        {err && <div className="card p-5 text-sm text-red-400 mb-4">{err}</div>}
        <div className="card p-4 overflow-x-auto">
          <div className="grid grid-cols-[64px_repeat(7,1fr)] min-w-[820px]">
            <div></div>
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs text-ink-400 font-medium py-2 border-b border-ink-700">
                {d}
              </div>
            ))}
            {HOURS.map((h, hi) => (
              <Fragment key={h}>
                <div className="text-xs text-ink-500 pr-2 py-3 text-right border-r border-ink-800">{h}</div>
                {DAYS.map((_, di) => {
                  const s = sessions.find((x) => lessonDay(x.scheduled_at) === di && new Date(x.scheduled_at).getHours() === hi + 7);
                  return (
                    <div key={`${di}-${hi}`} className="border-r border-b border-ink-800 min-h-[44px] p-1">
                      {s && (
                        <div
                          className={
                            'text-xs px-2 py-1 rounded ' +
                            (s.status === 'completed'
                              ? 'bg-court/20 border border-court/40 text-court'
                              : s.status === 'cancelled'
                              ? 'bg-clay/20 border border-clay/40 text-clay'
                              : 'bg-ink-700/40 border border-ink-600 text-ink-200')
                          }
                        >
                          {s.student?.name ?? 'Lesson'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
        {!err && sessions.length === 0 && (
          <div className="mt-6 card p-5">
            <div className="text-sm font-medium">No lessons scheduled this week</div>
            <div className="text-xs text-ink-400 mt-1">Create real lesson records to populate this calendar.</div>
          </div>
        )}
      </div>
    </>
  );
}

function weekStart() {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function weekEnd() {
  const date = weekStart();
  date.setDate(date.getDate() + 7);
  return date;
}

function lessonDay(value: string) {
  const day = new Date(value).getDay();
  return day === 0 ? 6 : day - 1;
}
