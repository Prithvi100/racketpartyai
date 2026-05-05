import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type Role = 'coach' | 'player' | 'parent' | 'club_admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  sport: 'tennis' | 'pickleball' | 'padel' | 'squash' | 'badminton';
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'open';
  city?: string;
}

interface AuthState {
  loading: boolean;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: Role, fullName: string) => Promise<void>;
  signInDemo: (role: Role) => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

const DEMO_KEY = 'rp.demoProfile';

function demoProfile(role: Role): Profile {
  const map: Record<Role, Profile> = {
    coach: {
      id: 'demo-coach',
      email: 'coach@demo.rp',
      full_name: 'Coach Avery',
      role: 'coach',
      sport: 'pickleball',
      city: 'Austin, TX',
    },
    player: {
      id: 'demo-player',
      email: 'player@demo.rp',
      full_name: 'Sam Rivera',
      role: 'player',
      sport: 'pickleball',
      skill_level: 'intermediate',
      city: 'Austin, TX',
    },
    parent: {
      id: 'demo-parent',
      email: 'parent@demo.rp',
      full_name: 'Jordan Park',
      role: 'parent',
      sport: 'tennis',
      city: 'Austin, TX',
    },
    club_admin: {
      id: 'demo-club',
      email: 'ops@demo.rp',
      full_name: 'Riley Chen',
      role: 'club_admin',
      sport: 'pickleball',
      city: 'Austin, TX',
    },
  };
  return map[role];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const cached = localStorage.getItem(DEMO_KEY);
      if (cached) setProfile(JSON.parse(cached));
      setLoading(false);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        if (active) setLoading(false);
        return;
      }
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      if (active) {
        setProfile(prof as Profile);
        setLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setProfile(null);
        return;
      }
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(prof as Profile);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured. Use Try the demo.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string, role: Role, fullName: string) {
    if (!supabase) throw new Error('Supabase not configured. Use Try the demo.');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: fullName } },
    });
    if (error) throw error;
  }

  function signInDemo(role: Role) {
    const p = demoProfile(role);
    localStorage.setItem(DEMO_KEY, JSON.stringify(p));
    setProfile(p);
  }

  async function signOut() {
    localStorage.removeItem(DEMO_KEY);
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <Ctx.Provider value={{ loading, profile, signIn, signUp, signInDemo, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside provider');
  return v;
}
