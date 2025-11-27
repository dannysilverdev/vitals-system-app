// src/app/api/admin/create-user/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  const { email, password, fullName, companyName } = await req.json()

  // 1) Crear usuario en auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message || 'No se pudo crear el usuario' },
      { status: 400 }
    )
  }

  const userId = data.user.id

  // 2) Crear profile asociado
  const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
    user_id: userId,
    full_name: fullName,
    company_name: companyName,
  })

  if (profileErr) {
    return NextResponse.json(
      { error: profileErr.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
