import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminApi } from '@/lib/adminGuard'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await requireAdminApi()
  if (error) return error

  let body: { is_enabled?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  if (typeof body.is_enabled !== 'boolean') {
    return NextResponse.json({ error: 'is_enabled (boolean) es requerido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error: dbError } = await admin
    .from('users')
    .update({ is_enabled: body.is_enabled })
    .eq('id', id)
    .select('id, is_enabled')
    .single()

  if (dbError || !data) {
    return NextResponse.json({ error: dbError?.message ?? 'Usuario no encontrado' }, { status: 404 })
  }

  return NextResponse.json(data)
}
