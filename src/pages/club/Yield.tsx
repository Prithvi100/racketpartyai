import { useEffect, useState } from 'react';
import InsightPage from './InsightPage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { buildClubMetrics, loadClubBookings, type ClubMetrics } from '../../lib/clubMetrics';

export default function Yield() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<ClubMetrics | null>(null);

  useEffect(() => {
    loadClubBookings(profile?.club_id).then((bookings) => setMetrics(buildClubMetrics(bookings))).catch(() => {
      setMetrics(null);
    });
  }, [profile?.club_id]);

  const heat = metrics?.utilization ?? [];

  return (
    <InsightPage
      title="Yield management"
      subtitle="Demand forecasting + dynamic pricing for court-hours. Like RevPAR, but for racquet courts."
      kind="yield"
      context={{
        club_id: profile?.club_id,
        avg_utilization: metrics?.totals.utilization,
        revpach: metrics?.totals.revpach,
        slots: heat,
      }}
      preface={
        <div className="card p-5">
          <div className="font-semibold">Today by hour</div>
          <div className="text-xs text-ink-400 mb-3">Util % vs current price</div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={heat}>
                <CartesianGrid stroke="#2a2c37" strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="#7a7c89" fontSize={11} />
                <YAxis stroke="#7a7c89" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a1c25', border: '1px solid #2a2c37', borderRadius: 8 }} />
                <Bar dataKey="util" fill="#c4ff3e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-sm mt-2">
            <thead className="text-xs text-ink-400">
              <tr><th className="text-left">Hour</th><th className="text-left">Util</th><th className="text-left">Price</th></tr>
            </thead>
            <tbody>
              {heat.map((h) => (
                <tr key={h.hour} className="border-t border-ink-800">
                  <td className="py-1.5">{h.hour}</td>
                  <td className={h.util > 85 ? 'text-court' : h.util < 35 ? 'text-clay' : 'text-ink-200'}>{h.util}%</td>
                  <td>${h.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    />
  );
}
