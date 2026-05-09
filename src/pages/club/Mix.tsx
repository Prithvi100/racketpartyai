import { useEffect, useState } from 'react';
import InsightPage from './InsightPage';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { buildClubMetrics, loadClubBookings, type ClubMetrics } from '../../lib/clubMetrics';

export default function Mix() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<ClubMetrics | null>(null);

  useEffect(() => {
    loadClubBookings(profile?.club_id).then((bookings) => setMetrics(buildClubMetrics(bookings))).catch(() => {
      setMetrics(null);
    });
  }, [profile?.club_id]);

  const current = metrics?.mix ?? [];

  return (
    <InsightPage
      title="Programming mix optimizer"
      subtitle="Given courts × member skill distribution, what's the revenue-maximizing weekly schedule?"
      kind="mix"
      context={{
        club_id: profile?.club_id,
        current_mix: current,
      }}
      preface={
        <div className="card p-5">
          <div className="font-semibold">Current mix (weekly court-hours)</div>
          <div className="h-56 mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={current} dataKey="value" nameKey="name" innerRadius={48} outerRadius={84} paddingAngle={2}>
                  {current.map((c) => <Cell key={c.name} fill={c.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1c25', border: '1px solid #2a2c37', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-sm mt-2">
            {current.map((c) => (
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
