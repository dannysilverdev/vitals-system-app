// src/app/logout/page.tsx
'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

export default function LogoutPage() {
  const { signOut } = useAuth()

  useEffect(() => {
    const run = async () => {
      try {
        // Cerramos sesión usando el contexto (que ya sabe hablar con Supabase)
        await signOut()
      } finally {
        // Pase lo que pase, forzamos ir al login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    run()
  }, [signOut])

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <p className="text-sm text-slate-600">Cerrando sesión…</p>
    </main>
  )
}
