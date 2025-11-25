'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type RequestRow = {
  id: string;
  email: string;
  full_name?: string | null;
  company_name?: string | null;
  message?: string | null;
  status?: string;
  created_at?: string;
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // Carga inicial
  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRequests(data ?? []);
    } catch (err: any) {
      console.error('Error loading requests', err);
      setError(err.message ?? 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }

  // Aprobar: llama al endpoint server que usa SERVICE_ROLE (x-admin-secret)
  async function approve(reqRow: RequestRow) {
    const password = prompt(
      `Escribe una contraseña temporal para ${reqRow.email} (la podés pedir al usuario):`,
      Math.random().toString(36).slice(-8)
    );
    if (!password) return;

    setActionLoadingId(reqRow.id);
    setError(null);
    setLastResponse(null);

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Para pruebas locales: NEXT_PUBLIC_ADMIN_SECRET (no usar en prod)
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET ?? ''
        },
        body: JSON.stringify({
          email: reqRow.email,
          password,
          full_name: reqRow.full_name ?? '',
          company_id: null, // si quieres enlazar company, resuelve antes y pasa el id aquí
          request_id: reqRow.id
        })
      });

      const json = await res.json();
      setLastResponse({ status: res.status, body: json });

      if (!res.ok) {
        const msg = json?.error ?? `Error HTTP ${res.status}`;
        setError(String(msg));
        console.error('create-user error', json);
      } else {
        // Actualiza UI: elimina o marca processed localmente
        // El endpoint ya marca access_requests processed si le pasaste request_id,
        // pero actualizamos la UI localmente para reflejar el cambio inmediatamente:
        setRequests((prev) => prev.filter((r) => r.id !== reqRow.id));
        alert(`Usuario creado correctamente (userId: ${json.userId ?? 'unknown'})\nContraseña temporal: ${password}`);
      }
    } catch (err: any) {
      console.error('approve error', err);
      setError(err.message ?? 'Error inesperado');
    } finally {
      setActionLoadingId(null);
    }
  }

  // Rechazar solicitud (marca status = 'rejected')
  async function rejectRequest(reqRow: RequestRow) {
    if (!confirm(`¿Rechazar la solicitud de ${reqRow.email}?`)) return;
    setActionLoadingId(reqRow.id);
    setError(null);
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({ status: 'rejected' })
        .eq('id', reqRow.id);
      if (error) throw error;
      setRequests((prev) => prev.filter((r) => r.id !== reqRow.id));
    } catch (err: any) {
      console.error('reject error', err);
      setError(err.message ?? 'Error al rechazar la solicitud');
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Solicitudes de acceso</h1>
        <div>
          <button onClick={loadRequests} disabled={loading} style={{ marginRight: 8 }}>
            {loading ? 'Recargando...' : 'Recargar'}
          </button>
        </div>
      </header>

      {error && (
        <div style={{ marginTop: 12, color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 24 }}>Cargando solicitudes...</div>
      ) : requests.length === 0 ? (
        <div style={{ marginTop: 24 }}>No hay solicitudes pendientes.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
          {requests.map((r) => (
            <li
              key={r.id}
              style={{
                padding: 12,
                border: '1px solid #e6e6e6',
                borderRadius: 8,
                marginBottom: 12,
                background: '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.full_name ?? '—'}</div>
                  <div style={{ color: '#555' }}>{r.email}</div>
                  {r.company_name && <div style={{ color: '#666', marginTop: 6 }}>{r.company_name}</div>}
                  {r.message && <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{r.message}</div>}
                  <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <div>
                    <button
                      onClick={() => approve(r)}
                      disabled={!!actionLoadingId}
                      style={{ padding: '8px 12px', marginRight: 8 }}
                    >
                      {actionLoadingId === r.id ? 'Procesando...' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => rejectRequest(r)}
                      disabled={!!actionLoadingId}
                      style={{ padding: '8px 12px', background: '#fff', border: '1px solid #ddd' }}
                    >
                      Rechazar
                    </button>
                  </div>

                  <div style={{ fontSize: 12, color: '#999' }}>id: {r.id}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {lastResponse && (
        <section style={{ marginTop: 18, padding: 12, border: '1px dashed #ccc', borderRadius: 6 }}>
          <h4>Última respuesta del endpoint</h4>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 8 }}>
            {JSON.stringify(lastResponse, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
