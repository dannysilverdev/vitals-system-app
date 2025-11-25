'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RequestAccessPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'sending'|'done'|'error'>('idle');

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');

    const { error } = await supabase
      .from('access_requests')
      .insert([{ email, full_name: fullName, company_name: companyName, message }]);

    if (error) {
      console.error(error);
      setStatus('error');
      return;
    }

    setStatus('done');
  }

  return (
    <main style={{ maxWidth: 640, margin: '2rem auto', padding: 20 }}>
      <h1>Solicitar acceso</h1>
      {status === 'done' ? (
        <div>Gracias — hemos recibido tu solicitud. Te contactaremos pronto.</div>
      ) : (
        <form onSubmit={submitRequest} style={{ display: 'grid', gap: 8 }}>
          <input required placeholder="Nombre completo" value={fullName} onChange={e=>setFullName(e.target.value)} />
          <input required type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Empresa (opcional)" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
          <textarea placeholder="Mensaje (opcional)" value={message} onChange={e=>setMessage(e.target.value)} />
          <button disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Enviando...' : 'Enviar solicitud'}</button>
          {status === 'error' && <div style={{ color: 'red' }}>Ocurrió un error. Intenta de nuevo.</div>}
        </form>
      )}
    </main>
  );
}
