'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type Company = { id: string; name: string };
type Profile = {
  id: string;
  full_name?: string | null;
  company_id?: string | null;
  role?: string | null;
  approved?: boolean | null;
  companies?: Company[];
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  companyName: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session ?? null);

      if (!session) {
        setProfile(null);
        setCompanyName(null);
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, company_id, approved, companies (id, name)')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
        setCompanyName(null);
      } else {
        const p = data as Profile;
        setProfile(p);
        const nameFromJoin = p?.companies?.[0]?.name ?? null;
        if (nameFromJoin) setCompanyName(nameFromJoin);
        else if (p?.company_id) {
          const { data: c } = await supabase.from('companies').select('id,name').eq('id', p.company_id).single();
          setCompanyName((c as Company)?.name ?? null);
        } else {
          setCompanyName(null);
        }

        // Si existe profile y no está aprobado: redirigir a awaiting-approval
        if (p && p.approved === false) {
          router.push('/awaiting-approval');
        }
      }

      setLoading(false);
    }

    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      if (session) {
        (async () => {
          const userId = session.user.id;
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, role, company_id, approved, companies (id, name)')
            .eq('id', userId)
            .single();
          const p = data as Profile;
          setProfile(p ?? null);
          setCompanyName(p?.companies?.[0]?.name ?? null);

          if (p && p.approved === false) {
            router.push('/awaiting-approval');
          }
        })();
      } else {
        setProfile(null);
        setCompanyName(null);
      }
    });

    return () => {
      mounted = false;
      try { (listener as any)?.subscription?.unsubscribe?.(); } catch (e) {}
    };
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setCompanyName(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ session, profile, companyName, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
