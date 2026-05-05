import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth, type Role } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { Mic, Trophy, LineChart } from 'lucide-react';

const ROLES: { id: Role; title: string; sub: string; icon: React.ReactNode }[] = [
  { id: 'coach', title: 'Coach', sub: 'Lessons, drills, parent updates', icon: <Mic className="size-5" /> },
  { id: 'player', title: 'Player', sub: 'Match-finding, highlights, leagues', icon: <Trophy className="size-5" /> },
  { id: 'club_admin', title: 'Club operator', sub: 'Yield, churn, programming mix', icon: <LineChart className="size-5" /> },
];

export default function Signup() {
  const { signUp, signInDemo } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>('coach');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signUp(email, password, role, fullName);
      nav('/');
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="card p-6">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-ink-400 mt-1">Pick the side of the court you live on. You can switch roles later.</p>

          <div className="mt-5 grid md:grid-cols-3 gap-3">
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    active
                      ? 'bg-court/10 border-court text-ink-50'
                      : 'border-ink-700 hover:border-ink-500 text-ink-200'
                  }`}
                >
                  <div className={`size-9 rounded-lg flex items-center justify-center border ${active ? 'border-court bg-court/20 text-court' : 'border-ink-600 text-ink-400'}`}>
                    {r.icon}
                  </div>
                  <div className="mt-3 font-medium">{r.title}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{r.sub}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="mt-6 grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="label">Full name</label>
              <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {err && <div className="md:col-span-2 text-sm text-red-400">{err}</div>}
            <div className="md:col-span-2">
              <button className="btn-primary w-full" disabled={busy}>{busy ? '...' : 'Create account'}</button>
            </div>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-500">
            <div className="flex-1 h-px bg-ink-700" /> or skip and try a demo <div className="flex-1 h-px bg-ink-700" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="btn-outline text-sm" onClick={() => { signInDemo('coach'); nav('/coach'); }}>Coach</button>
            <button className="btn-outline text-sm" onClick={() => { signInDemo('player'); nav('/player'); }}>Player</button>
            <button className="btn-outline text-sm" onClick={() => { signInDemo('club_admin'); nav('/club'); }}>Club</button>
          </div>
          <div className="mt-5 text-sm text-ink-400 text-center">
            Already have an account? <Link to="/login" className="text-court">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
