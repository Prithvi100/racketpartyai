import InsightPage from './InsightPage';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const CURRENT = [
  { name: 'Open play', value: 142, fill: '#c4ff3e' },
  { name: 'Leagues', value: 64, fill: '#d97742' },
  { name: 'Clinics', value: 28, fill: '#7a7c89' },
  { name: 'Lessons', value: 38, fill: '#a8a9b3' },
  { name: 'Tournaments', value: 12, fill: '#3c3e4b' },
];

export default function Mix() {
  return (
    <InsightPage
      title="Programming mix optimizer"
      subtitle="Given courts × member skill distribution, what's the revenue-maximizing weekly schedule?"
      kind="mix"
      context={{
        facility: 'Pickleball Kingdom — Austin Domain',
        courts: 14,
        members_by_level: { '2.5': 180, '3.0': 410, '3.5': 520, '4.0': 220, '4.5+': 90 },
        weekly_court_hours: 980,
        current_mix: CURRENT,
        constraints: ['must keep ≥30% open-play', 'leagues need 2-hour blocks'],
      }}
      preface={
        <div className="card p-5">
          <div className="font-semibold">Current mix (weekly court-hours)</div>
          <div className="h-56 mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={CURRENT} dataKey="value" nameKey="name" innerRadius={48} outerRadius={84} paddingAngle={2}>
                  {CURRENT.map((c, i) => <Cell key={i} fill={c.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1c25', border: '1px solid #2a2c37', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-sm mt-2">
            {CURRENT.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="size-3 rounded" style={{ background: c.fill }} />
                <span className="flex-1">{c.name}</span>
                <span className="text-ink-400">{c.value} hrs</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
