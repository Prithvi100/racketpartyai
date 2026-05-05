import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { signIn, signInDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signIn(email, password);
      nav('/');
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="card p-6">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-ink-400 mt-1">Welcome back.</p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {err && <div className="text-sm text-red-400">{err}</div>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? '...' : 'Sign in'}</button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-ink-500">
            <div className="flex-1 h-px bg-ink-700" /> or jump into a demo <div className="flex-1 h-px bg-ink-700" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="btn-outline text-sm" onClick={() => { signInDemo('coach'); nav('/coach'); }}>Coach</button>
            <button className="btn-outline text-sm" onClick={() => { signInDemo('player'); nav('/player'); }}>Player</button>
            <button className="btn-outline text-sm" onClick={() => { signInDemo('club_admin'); nav('/club'); }}>Club</button>
          </div>
          <div className="mt-5 text-sm text-ink-400 text-center">
            New here? <Link to="/signup" className="text-court">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
