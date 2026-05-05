import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import {
  LayoutDashboard,
  Users,
  Mic,
  Dumbbell,
  Calendar,
  Trophy,
  Sparkles,
  LineChart,
  AlertTriangle,
  Shuffle,
  LogOut,
  Search,
  UserCircle2,
} from 'lucide-react';
import type { ReactNode } from 'react';

const NAVS: Record<string, { to: string; label: string; icon: ReactNode }[]> = {
  coach: [
    { to: '/coach', label: 'Home', icon: <LayoutDashboard className="size-4" /> },
    { to: '/coach/students', label: 'Students', icon: <Users className="size-4" /> },
    { to: '/coach/lessons/new', label: 'Voice → Notes', icon: <Mic className="size-4" /> },
    { to: '/coach/drills', label: 'Drill library', icon: <Dumbbell className="size-4" /> },
    { to: '/coach/schedule', label: 'Schedule', icon: <Calendar className="size-4" /> },
  ],
  player: [
    { to: '/player', label: 'Home', icon: <LayoutDashboard className="size-4" /> },
    { to: '/player/matches', label: 'Match finder', icon: <Trophy className="size-4" /> },
    { to: '/player/highlights', label: 'My highlights', icon: <Sparkles className="size-4" /> },
    { to: '/player/coaches', label: 'Find a coach', icon: <Search className="size-4" /> },
  ],
  parent: [
    { to: '/player', label: 'Home', icon: <LayoutDashboard className="size-4" /> },
    { to: '/player/highlights', label: 'Highlights', icon: <Sparkles className="size-4" /> },
    { to: '/player/coaches', label: 'Find a coach', icon: <Search className="size-4" /> },
  ],
  club_admin: [
    { to: '/club', label: 'Overview', icon: <LayoutDashboard className="size-4" /> },
    { to: '/club/yield', label: 'Yield', icon: <LineChart className="size-4" /> },
    { to: '/club/churn', label: 'Churn', icon: <AlertTriangle className="size-4" /> },
    { to: '/club/mix', label: 'Programming mix', icon: <Shuffle className="size-4" /> },
    { to: '/club/conversion', label: 'Court conversion', icon: <Shuffle className="size-4" /> },
  ],
};

export default function Layout() {
  const { profile, signOut } = useAuth();
  const nav = useNavigate();

  const items = profile ? NAVS[profile.role] ?? [] : [];

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-ink-800 bg-ink-900/80 flex flex-col">
        <div className="px-4 py-4 border-b border-ink-800">
          <Link to="/">
            <Logo size={24} />
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to.split('/').length === 2}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-court/10 text-court border border-court/30'
                    : 'text-ink-300 hover:bg-ink-800'
                }`
              }
            >
              {it.icon}
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-800">
          <div className="flex items-center gap-2 px-2 py-2">
            <UserCircle2 className="size-7 text-ink-400" />
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{profile?.full_name}</div>
              <div className="text-xs text-ink-400 capitalize">{profile?.role.replace('_', ' ')}</div>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              nav('/');
            }}
            className="btn-ghost w-full justify-start text-sm"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
