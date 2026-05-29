import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Retorna el usuario si es admin; si no, retorna una Response de error lista para devolver
export async function requireAdminApi(): Promise<
  { user: { id: string }; error: null } |
  { user: null; error: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    return { user: null, error: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
  }

  return { user, error: null }
}
