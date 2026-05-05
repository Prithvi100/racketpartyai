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

const REVENUE = [
  { day: 'Mon', current: 4200, baseline: 3800 },
  { day: 'Tue', current: 4800, baseline: 4100 },
  { day: 'Wed', current: 5100, baseline: 4300 },
  { day: 'Thu', current: 4600, baseline: 4000 },
  { day: 'Fri', current: 5400, baseline: 4500 },
  { day: 'Sat', current: 6800, baseline: 5800 },
  { day: 'Sun', current: 5200, baseline: 4700 },
];

const UTILIZATION = [
  { hour: '7a', util: 22 },
  { hour: '9a', util: 64 },
  { hour: '11a', util: 41 },
  { hour: '1p', util: 28 },
  { hour: '3p', util: 35 },
  { hour: '5p', util: 78 },
  { hour: '7p', util: 96 },
  { hour: '9p', util: 52 },
];

export default function ClubHome() {
  return (
    <>
      <PageHeader
        title="Operations overview"
        subtitle="Demo facility: Pickleball Kingdom — Austin Domain. 14 courts, 1,420 members."
      />
      <div className="px-8 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat n="$33.5K" label="Revenue (week)" delta="+11.4%" up />
            <Stat n="71%" label="Utilization" delta="+6 pts" up />
            <Stat n="42" label="At-risk members" delta="−14" up />
            <Stat n="$48.10" label="RevPACH" delta="+$5.10" up />
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">Revenue: this week vs baseline</div>
                <div className="text-xs text-ink-400">Modeled lift attributable to RacketParty pricing recommendations</div>
              </div>
              <Link to="/club/yield" className="btn-ghost text-sm">
                Yield detail <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={REVENUE}>
                  <CartesianGrid stroke="#2a2c37" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#7a7c89" fontSize={12} />
                  <YAxis stroke="#7a7c89" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1a1c25', border: '1px solid #2a2c37', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="baseline" stroke="#555766" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="current" stroke="#c4ff3e" strokeWidth={2.5} dot={{ r: 3, fill: '#c4ff3e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="font-semibold">Court utilization (today)</div>
              <div className="text-xs text-ink-400 mb-3">Peak at 7 PM. Lunch slots are 28–35%.</div>
              <div className="h-40">
                <ResponsiveContainer>
                  <AreaChart data={UTILIZATION}>
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
