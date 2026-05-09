import { useEffect, useState } from 'react';
import InsightPage from './InsightPage';
import { useAuth } from '../../contexts/AuthContext';
import { loadClubBookings, type CourtBooking } from '../../lib/clubMetrics';

interface DemandPoint {
  hour: string;
  tennis: number;
  pickleball: number;
}

export default function Conversion() {
  const { profile } = useAuth();
  const [demand, setDemand] = useState<DemandPoint[]>([]);

  useEffect(() => {
    loadClubBookings(profile?.club_id).then((bookings) => setDemand(buildDemand(bookings))).catch(() => {
      setDemand([]);
    });
  }, [profile?.club_id]);

  return (
    <InsightPage
      title="Court conversion plan"
      subtitle="When does a tennis court flip to two pickleball courts? Daily, by hour, with quantified upside."
      kind="conversion"
      context={{
        club_id: profile?.club_id,
        demand_index_hourly: demand,
      }}
      preface={
        <div className="card p-5">
          <div className="font-semibold">Demand index by hour</div>
          <div className="text-xs text-ink-400 mb-2">Pickleball &gt; Tennis means flip is favorable.</div>
          <div className="space-y-1.5">
            {demand.map((d) => {
              const ratio = d.pickleball / Math.max(d.tennis, 0.01);
              return (
                <div key={d.hour} className="flex items-center gap-2 text-sm">
                  <span className="w-10 text-ink-400">{d.hour}</span>
                  <div className="flex-1 grid grid-cols-2 gap-1">
                    <div className="h-2 rounded bg-ink-800 overflow-hidden">
                      <div className="h-full bg-clay" style={{ width: `${Math.min(d.tennis * 50, 100)}%` }} />
                    </div>
                    <div className="h-2 rounded bg-ink-800 overflow-hidden">
                      <div className="h-full bg-court" style={{ width: `${Math.min(d.pickleball * 50, 100)}%` }} />
                    </div>
                  </div>
                  <span className={`w-12 text-right text-xs ${ratio > 1.5 ? 'text-court' : 'text-ink-400'}`}>
                    {ratio.toFixed(1)}×
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="size-2.5 bg-clay rounded" /> tennis</span>
            <span className="flex items-center gap-1"><span className="size-2.5 bg-court rounded" /> pickleball</span>
          </div>
        </div>
      }
    />
  );
}

function buildDemand(bookings: CourtBooking[]): DemandPoint[] {
  const buckets = new Map<string, { tennis: number; pickleball: number }>();

  for (const booking of bookings) {
    if (!booking.starts_at) continue;
    const surface = booking.surface?.toLowerCase() ?? '';
    const hour = formatHour(new Date(booking.starts_at));
    const duration = (booking.duration_min ?? 60) / 60;
    const bucket = buckets.get(hour) ?? { tennis: 0, pickleball: 0 };

    if (surface.includes('pickle')) bucket.pickleball += duration;
    if (surface.includes('tennis')) bucket.tennis += duration;
    buckets.set(hour, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => hourSortValue(a) - hourSortValue(b))
    .map(([hour, value]) => ({ hour, ...value }));
}

function formatHour(date: Date) {
  const hour = date.getHours();
  const suffix = hour >= 12 ? 'p' : 'a';
  const h12 = hour % 12 || 12;
  return `${h12}${suffix}`;
}

function hourSortValue(hour: string) {
  const match = /^(\d+)([ap])$/.exec(hour);
  if (!match) return 0;
  const raw = Number(match[1]) % 12;
  return raw + (match[2] === 'p' ? 12 : 0);
}
