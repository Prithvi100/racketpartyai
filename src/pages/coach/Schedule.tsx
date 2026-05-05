import { Fragment } from 'react';
import PageHeader from '../../components/PageHeader';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p'];

interface Session {
  day: number;
  hour: number;
  student: string;
  type: 'lesson' | 'clinic' | 'match';
}

const SESSIONS: Session[] = [
  { day: 0, hour: 8, student: 'Maya P.', type: 'lesson' },
  { day: 0, hour: 13, student: 'Diego A.', type: 'lesson' },
  { day: 1, hour: 9, student: 'Junior Clinic (6)', type: 'clinic' },
  { day: 1, hour: 17, student: 'Sofia N.', type: 'lesson' },
  { day: 2, hour: 11, student: 'Lila B.', type: 'lesson' },
  { day: 3, hour: 16, student: 'Owen K.', type: 'lesson' },
  { day: 3, hour: 18, student: 'Adult Clinic (4)', type: 'clinic' },
  { day: 4, hour: 7, student: 'Marcus L.', type: 'lesson' },
  { day: 5, hour: 10, student: 'Saturday Showcase', type: 'match' },
  { day: 5, hour: 14, student: 'Aria C.', type: 'lesson' },
];

export default function Schedule() {
  return (
    <>
      <PageHeader
        title="Schedule"
        subtitle="Drag to reschedule (in MVP). AI suggests fills for empty slots."
      />
      <div className="px-8 py-6">
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
                  const s = SESSIONS.find((x) => x.day === di && x.hour === hi + 7);
                  return (
                    <div key={`${di}-${hi}`} className="border-r border-b border-ink-800 min-h-[44px] p-1">
                      {s && (
                        <div
                          className={
                            'text-xs px-2 py-1 rounded ' +
                            (s.type === 'lesson'
                              ? 'bg-court/20 border border-court/40 text-court'
                              : s.type === 'clinic'
                              ? 'bg-clay/20 border border-clay/40 text-clay'
                              : 'bg-ink-700/40 border border-ink-600 text-ink-200')
                          }
                        >
                          {s.student}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="mt-6 card p-5">
          <div className="text-sm font-medium">AI fill suggestions</div>
          <div className="text-xs text-ink-400 mt-1">Empty Tue 2 PM and Thu 11 AM. Recommend offering them as comp clinics to at-risk students (Owen, Theo).</div>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary text-xs">Send invites</button>
            <button className="btn-ghost text-xs">Skip</button>
          </div>
        </div>
      </div>
    </>
  );
}
