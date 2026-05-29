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

  let body: { games_total?: number; max_boards_per_game?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error: dbError } = await admin
    .from('subscriptions')
    .update({
      ...(typeof body.games_total === 'number' && { games_total: body.games_total }),
      ...(typeof body.max_boards_per_game === 'number' && { max_boards_per_game: body.max_boards_per_game }),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', id)
    .select()
    .single()

  if (dbError || !data) {
    return NextResponse.json({ error: dbError?.message ?? 'Suscripción no encontrada' }, { status: 404 })
  }

  return NextResponse.json(data)
}
