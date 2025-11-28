'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function DashboardPage() {
  const router = useRouter()
  const { session, profile, loading } = useAuth()

  // Proteger ruta: si no hay sesión, mandar a /login
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login')
    }
  }, [loading, session, router])

  if (loading && !session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-600">Cargando sesión…</p>
      </main>
    )
  }

  if (!session) {
    return null
  }

  const userName = profile?.full_name ?? '(sin nombre)'
  const companyName = profile?.company_name ?? '(sin empresa asociada)'

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow border border-slate-200 p-6 space-y-6">
        {/* Header con usuario + "botón" de logout (link) */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Usuario</p>
            <p className="text-sm font-semibold text-slate-900">
              {userName}
            </p>
          </div>
          <Link
            href="/logout"
            className="text-xs text-red-600 hover:text-red-700"
          >
            Cerrar sesión
          </Link>
        </header>

        {/* Bloque de empresa */}
        <section className="space-y-1">
          <p className="text-xs text-slate-500">Empresa</p>
          <p className="text-base font-semibold text-slate-900">
            {companyName}
          </p>
        </section>

        {/* Acciones */}
        <section className="pt-2 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-500">Acciones</p>

          <div className="flex flex-col gap-2">
            <Link
              href="/admin/users/new"
              className="inline-flex items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100"
            >
              + Crear nuevo usuario
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
