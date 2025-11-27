// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las env vars'
  )
}

// ¡OJO! Este cliente solo debe usarse en código de servidor (API routes, server actions)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
