'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function NewUserPage() {
  const router = useRouter()
  const { session } = useAuth() // opcional: podrías validar rol admin después

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email || !password || !fullName || !companyName) {
      setError('Completa todos los campos')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          companyName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear el usuario')
        setLoading(false)
        return
      }

      setSuccess('Usuario creado correctamente')
      setEmail('')
      setPassword('')
      setFullName('')
      setCompanyName('')
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError('Error inesperado')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow border border-slate-200 p-6 space-y-4">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900">
            Crear nuevo usuario
          </h1>
          <p className="text-xs text-slate-500">
            Este formulario crea el usuario en Supabase y su perfil.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-100 text-emerald-700 text-sm px-3 py-2 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-700">Correo</label>
            <input
              type="email"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Contraseña</label>
            <input
              type="password"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Nombre completo</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Empresa</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold py-2 rounded-lg disabled:bg-slate-400"
          >
            {loading ? 'Creando…' : 'Crear usuario'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-xs text-sky-600 hover:text-sky-700"
        >
          Volver al dashboard
        </button>
      </div>
    </main>
  )
}
