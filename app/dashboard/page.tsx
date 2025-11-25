// app/dashboard/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardPage() {
  const router = useRouter();
  const { session, profile, companyName, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.push('/login');
  }, [loading, session, router]);

  if (loading) return <div>Cargando...</div>;
  if (!session) return null; // redirige por efecto

  return (
    <main style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Hola, {profile?.full_name ?? 'Usuario'}</h2>
          <div style={{ color: '#666' }}>{companyName ?? 'Sin compañía asignada'}</div>
        </div>
        <div>
          <button onClick={() => router.push('/')}>Inicio</button>
          <button onClick={signOut} style={{ marginLeft: 8 }}>Cerrar sesión</button>
        </div>
      </header>
      {/* resto del dashboard */}
    </main>
  );
}
