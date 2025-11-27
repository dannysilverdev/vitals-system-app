'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function DashboardPage() {
  const router = useRouter()
  const { session, profile, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login')
    }
  }, [loading, session, router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-600">Cargando sesión…</p>
      </main>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow border border-slate-200 p-6 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Usuario</p>
            <p className="text-sm font-semibold text-slate-900">
              {profile?.full_name ?? '(sin nombre)'}
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Cerrar sesión
          </button>
        </header>

        <section className="space-y-1">
          <p className="text-xs text-slate-500">Empresa</p>
          <p className="text-base font-semibold text-slate-900">
            {profile?.company_name ?? '(sin empresa asociada)'}
          </p>
        </section>
      </div>
    </main>
  )
}
