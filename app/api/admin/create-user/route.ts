// app/api/admin/create-user/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_SECRET = process.env.ADMIN_SECRET!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Supabase env missing');
}

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { email, password, full_name, company_id, request_id } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 });
  }

  try {
    // 1) Crear usuario en auth
    const { data: userData, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createErr) {
      console.error('createUser error', createErr);
      return NextResponse.json({ error: createErr.message ?? 'create user failed' }, { status: 500 });
    }

    const userId = (userData.user as any).id;

    // 2) Crear profile ligado y marcar aprobado
    const { error: profileErr } = await adminClient
      .from('profiles')
      .insert([{ id: userId, full_name, company_id: company_id ?? null, approved: true }]);

    if (profileErr) {
      console.error('profile insert error', profileErr);
      // opcional: eliminar user si falla la inserción del profile
      return NextResponse.json({ error: profileErr.message ?? 'profile insert failed' }, { status: 500 });
    }

    // 3) Marcar request como processed (si viene request_id)
    if (request_id) {
      await adminClient.from('access_requests').update({ status: 'processed' }).eq('id', request_id);
    }

    return NextResponse.json({ ok: true, userId }, { status: 201 });
  } catch (err) {
    console.error('unexpected create-user error', err);
    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}
