import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import ChatBox from '../../components/ChatBox';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { LineChart as LineIcon, AlertTriangle, Shuffle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildClubMetrics, loadClubBookings, type ClubMetrics } from '../../lib/clubMetrics';

export default function ClubHome() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<ClubMetrics | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadClubBookings(profile?.club_id)
      .then((bookings) => {
        if (active) setMetrics(buildClubMetrics(bookings));
      })
      .catch((e) => {
        if (active) setErr(String(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [profile?.club_id]);

  const hasData = Boolean(metrics?.bookings.length);

  return (
    <>
      <PageHeader
        title="Operations overview"
        subtitle="Live facility metrics from connected court bookings."
      />
      <div className="px-8 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loading && <div className="card p-5 text-sm text-ink-400">Loading club metrics...</div>}
          {err && <div className="card p-5 text-sm text-red-400">{err}</div>}
          {!loading && !err && !hasData && (
            <div className="card p-5">
              <div className="font-semibold">No court bookings connected</div>
              <p className="text-sm text-ink-400 mt-1">
                Import bookings into Supabase `court_bookings` to populate revenue, utilization, and programming mix.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat n={currency(metrics?.totals.revenue ?? 0)} label="Revenue" />
            <Stat n={`${metrics?.totals.utilization ?? 0}%`} label="Utilization" />
            <Stat n="N/A" label="At-risk members" />
            <Stat n={currency(metrics?.totals.revpach ?? 0)} label="RevPACH" />
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">Revenue by day</div>
                <div className="text-xs text-ink-400">Computed from connected court bookings</div>
              </div>
              <Link to="/club/yield" className="btn-ghost text-sm">
                Yield detail <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={metrics?.revenue ?? []}>
                  <CartesianGrid stroke="#2a2c37" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#7a7c89" fontSize={12} />
                  <YAxis stroke="#7a7c89" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1a1c25', border: '1px solid #2a2c37', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#c4ff3e" strokeWidth={2.5} dot={{ r: 3, fill: '#c4ff3e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="font-semibold">Court utilization (today)</div>
              <div className="text-xs text-ink-400 mb-3">Average utilization by booked hour.</div>
              <div className="h-40">
                <ResponsiveContainer>
                  <AreaChart data={metrics?.utilization ?? []}>
                    <defs>
                      <linearGradient id="util" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#c4ff3e" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#c4ff3e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" stroke="#7a7c89" fontSize={11} />
                    <YAxis stroke="#7a7c89" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1a1c25', border: '1px solid #2a2c37', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="util" stroke="#c4ff3e" strokeWidth={2} fill="url(#util)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <ShortcutCard
              to="/club/yield"
              icon={<LineIcon className="size-5" />}
              title="Yield management"
              body="Recommended price per court-hour for the next 14 days."
            />
            <ShortcutCard
              to="/club/churn"
              icon={<AlertTriangle className="size-5" />}
              title="Churn prediction"
              body="At-risk members + intervention plays to run this week."
            />
            <ShortcutCard
              to="/club/mix"
              icon={<Shuffle className="size-5" />}
              title="Programming mix"
              body="Re-balance open play / leagues / clinics for revenue."
            />
          </div>
        </div>

        <div>
          <ChatBox
            persona="club"
            intro="I'm your facility AI. Ask me to compare yield this week, surface at-risk members, or plan tomorrow's court conversions."
            suggestions={[
              "What's my biggest pricing miss this week?",
              'Top 5 at-risk members and what to do',
              'Should we flip court 6 to pickleball Saturday afternoon?',
            ]}
            compact
          />
        </div>
      </div>
    </>
  );
}

function Stat({ n, label, delta, up }: { n: string; label: string; delta?: string; up?: boolean }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-semibold">{n}</div>
      <div className="flex items-center gap-2 mt-1">
        <div className="text-xs text-ink-400">{label}</div>
        {delta && (
          <span className={`text-xs ${up ? 'text-court' : 'text-clay'}`}>{delta}</span>
        )}
      </div>
    </div>
  );
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 ? 2 : 0,
  }).format(value);
}

function ShortcutCard({ to, icon, title, body }: any) {
  return (
    <Link to={to} className="card p-4 flex gap-3 hover:border-ink-600 transition">
      <div className="size-9 rounded-lg bg-ink-700/40 border border-ink-600 flex items-center justify-center text-ink-200">
        {icon}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-ink-400 mt-0.5">{body}</div>
      </div>
    </Link>
  );
}
