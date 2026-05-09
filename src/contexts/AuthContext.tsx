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
  club_id?: string | null;
}

interface AuthState {
  loading: boolean;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: Role, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let active = true;
    client.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        if (active) setLoading(false);
        return;
      }
      const { data: prof } = await client
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      if (active) {
        setProfile(prof as Profile);
        setLoading(false);
      }
    });
    const { data: sub } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setProfile(null);
        return;
      }
      const { data: prof } = await client
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
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string, role: Role, fullName: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: fullName } },
    });
    if (error) throw error;
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <Ctx.Provider value={{ loading, profile, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside provider');
  return v;
}
