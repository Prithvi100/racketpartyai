import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import ChatBox from '../../components/ChatBox';
import { useAuth } from '../../contexts/AuthContext';
import { Mic, Dumbbell, Sparkles, Users, ArrowRight } from 'lucide-react';

export default function CoachHome() {
  const { profile } = useAuth();
  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] ?? 'Coach'}.`}
        subtitle="One tap after every lesson. The AI does the rest."
      />
      <div className="px-8 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat n={42} label="Students" />
            <Stat n={186} label="Lessons logged" />
            <Stat n={612} label="Drills assigned" />
            <Stat n="$3.4K" label="Highlight revenue (30d)" />
          </div>

          <Link
            to="/coach/lessons/new"
            className="card p-6 flex items-center gap-4 hover:border-court/40 transition group"
          >
            <div className="size-12 rounded-xl bg-court/15 border border-court/30 text-court flex items-center justify-center">
              <Mic className="size-6" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Just finished a lesson?</div>
              <div className="text-sm text-ink-400">
                Tap once, talk for 30 seconds, get notes + parent update + tomorrow's plan.
              </div>
            </div>
            <ArrowRight className="size-5 text-ink-400 group-hover:text-court group-hover:translate-x-0.5 transition" />
          </Link>

          <div className="grid md:grid-cols-2 gap-4">
            <ShortcutCard
              to="/coach/drills"
              icon={<Dumbbell className="size-5" />}
              title="Suggest today's drill"
              body="AI picks from your library based on the student's last 3 sessions."
            />
            <ShortcutCard
              to="/coach/students"
              icon={<Users className="size-5" />}
              title="Student progress"
              body="See technique tags trending, and who hasn't been on the court in 14 days."
            />
            <ShortcutCard
              to="/coach/lessons/new"
              icon={<Sparkles className="size-5" />}
              title="Generate a highlight reel"
              body="Upload phone footage, AI clips the best 5 rallies and writes captions."
            />
            <ShortcutCard
              to="/coach/drills"
              icon={<Dumbbell className="size-5" />}
              title="Browse the community library"
              body="Drills your peers swear by. Vote, remix, save."
            />
          </div>
        </div>

        <div>
          <ChatBox
            persona="coach"
            intro="I'm your coaching copilot. Ask me to draft a lesson plan, suggest a drill for a 3.5 player working on their third-shot drop, or write a parent update."
            suggestions={[
              'Plan a 60-min lesson for a 10-year-old learning topspin forehand',
              'Suggest 3 drills for dinking consistency',
              'Draft a parent update for an 8-year-old who served their first ace',
            ]}
            compact
          />
        </div>
      </div>
    </>
  );
}

function Stat({ n, label }: { n: string | number; label: string }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-semibold">{n}</div>
      <div className="text-xs text-ink-400 mt-1">{label}</div>
    </div>
  );
}

function ShortcutCard({
  to,
  icon,
  title,
  body,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
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
