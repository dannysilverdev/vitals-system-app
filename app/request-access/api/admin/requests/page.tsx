'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('access_requests').select('*').eq('status', 'pending').order('created_at', { ascending: true });
      setRequests(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function approve(reqRow: any) {
    const pwd = prompt('Escribe una contraseña temporal para el usuario (se la pasarás al usuario):', Math.random().toString(36).slice(-8));
    if (!pwd) return;

    // Llamada a la API server que usa SERVICE_ROLE
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET ?? ''
      },
      body: JSON.stringify({
        email: reqRow.email,
        password: pwd,
        full_name: reqRow.full_name,
        company_id: null, // si quieres enlazar company, resuelve antes
        request_id: reqRow.id
      })
    });

    const j = await res.json();
    if (res.ok) {
      // actualizar request localmente
      await supabase.from('access_requests').update({ status: 'processed' }).eq('id', reqRow.id);
      setRequests(prev => prev.filter(r => r.id !== reqRow.id));
      alert('Usuario creado. Envía la contraseña temporal al usuario.');
    } else {
      alert('Error: ' + (j.error ?? 'unknown'));
      console.error(j);
    }
  }

  if (loading) return <div>Cargando...</div>;
  if (requests.length === 0) return <div>No hay solicitudes pendientes.</div>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Solicitudes pendientes</h1>
      <ul>
        {requests.map(r => (
          <li key={r.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <div><strong>{r.full_name}</strong> — {r.email}</div>
            <div>{r.company_name}</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => approve(r)}>Aprobar y crear usuario</button>
              <button style={{ marginLeft: 8 }} onClick={async ()=> {
                await supabase.from('access_requests').update({ status: 'rejected' }).eq('id', r.id);
                setRequests(prev => prev.filter(x => x.id !== r.id));
              }}>Rechazar</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
