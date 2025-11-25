'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  async function handleRedirect(target: string) {
    try {
      router.replace(target);
      // fallback por si router falla en este entorno
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== target) {
          window.location.href = target;
        }
      }, 150);
    } catch {
      if (typeof window !== 'undefined') window.location.href = target;
    }
  }

  async function login(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setLastResponse(null);

    try {
      console.log('Intentando login con', email);
      const res = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      console.log('supabase.login response', res);
      setLastResponse(res);

      // Manejo de errores de supabase v2
      if (res.error) {
        setErrorMsg(res.error.message ?? JSON.stringify(res.error));
        return;
      }

      const session = (res.data as any)?.session ?? null;
      if (!session) {
        setErrorMsg('No se obtuvo sesión. Revisa la consola para más info.');
        return;
      }

      // Intentar leer profile.approved — si tu RLS lo permite desde el cliente
      try {
        const userId = session.user?.id;
        if (userId) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('approved')
            .eq('id', userId)
            .single();

          if (profileError) {
            // Si hay error al leer profile, no bloqueamos: solo redirigimos al dashboard
            console.warn('No se pudo leer profile:', profileError);
            await handleRedirect('/dashboard');
            return;
          }

          const approved = (profileData as any)?.approved;
          if (approved === false) {
            await handleRedirect('/awaiting-approval');
            return;
          } else {
            await handleRedirect('/dashboard');
            return;
          }
        } else {
          // sin userId (improbable) → ir a dashboard
          await handleRedirect('/dashboard');
          return;
        }
      } catch (err) {
        console.error('Error verificando profile.approved:', err);
        // si falla la verificación, redirigimos igual al dashboard
        await handleRedirect('/dashboard');
        return;
      }
    } catch (err: any) {
      console.error('login exception', err);
      setErrorMsg(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '3rem auto', padding: 20 }}>
      <h2>Iniciar sesión</h2>

      <form onSubmit={login} style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          type="email"
          style={{ width: '100%', padding: 8 }}
          required
        />

        <input
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Contraseña"
          type="password"
          style={{ width: '100%', padding: 8 }}
          required
        />

        {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}

        <button type="submit" disabled={loading || !email || !pass} style={{ padding: 10, marginTop: 8 }}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>

      {lastResponse && (
        <section style={{ marginTop: 16, padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
          <strong>Última respuesta (debug):</strong>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 8 }}>{JSON.stringify(lastResponse, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
