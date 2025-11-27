'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

type Profile = {
  id: string
  user_id: string
  full_name: string | null
  company_name: string | null
}

type AuthContextType = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        setSession(null)
        setUser(null)
        setProfile(null)
        setError('No se pudo obtener la sesión')
        setLoading(false)
        return
      }

      const currentSession = data.session ?? null
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        await loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, company_name')
        .eq('user_id', userId)
        .maybeSingle()

      if (error && (error as any).message) {
        console.error('Error loading profile from DB:', error)
        setProfile(null)
        setError('No se pudo cargar el perfil')
        return
      }

      if (!data) {
        setProfile(null)
        return
      }

      setProfile(data as Profile)
    } catch (err) {
      console.error('Unexpected error loading profile:', err)
      setProfile(null)
      setError('Error inesperado cargando el perfil')
    }
  }

  const refreshProfile = async () => {
    if (!user?.id) return
    await loadProfile(user.id)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    error,
    refreshProfile,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
