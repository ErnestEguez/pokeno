import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { broadcastRoomEvent } from '@/lib/roomHelpers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Verificar que el usuario no es admin (admin nunca juega)
  const { data: userData } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single()
  if (userData?.is_admin) {
    return NextResponse.json({ error: 'El administrador no puede ser anfitrión' }, { status: 403 })
  }

  // Leer sala actual
  const { data: room } = await admin
    .from('rooms')
    .select('id, host_id, status')
    .eq('id', id)
    .single()

  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })

  // Permitir tomar host si:
  // 1. host_id es null (sin anfitrión asignado), o
  // 2. La sala está pausada (tomar el rol de alguien que no responde)
  const canTake = room.host_id === null || room.status === 'paused' || room.status === 'lobby'
  if (!canTake) {
    return NextResponse.json(
      { error: 'No puedes tomar el rol de anfitrión ahora', code: 'CANNOT_TAKE_HOST' },
      { status: 409 }
    )
  }

  // UPDATE atómico
  let updateQuery = admin.from('rooms').update({ host_id: user.id }).eq('id', id)
  if (room.host_id !== null) {
    // Si hay un host actual, solo actualizar si sigue siendo el mismo (para evitar condición de carrera)
    updateQuery = updateQuery.eq('host_id', room.host_id)
  }

  const { data: updated, error: updateError } = await updateQuery.select('id')

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  if (!updated || updated.length === 0) {
    return NextResponse.json(
      { error: 'El rol de anfitrión ya fue tomado por otro jugador', code: 'HOST_TAKEN' },
      { status: 409 }
    )
  }

  await admin.from('host_log').insert({
    room_id: id,
    user_id: user.id,
    action: room.host_id
      ? `tomó el rol de anfitrión (anterior: ${room.host_id})`
      : 'se declaró anfitrión',
  })

  await broadcastRoomEvent(id, { type: 'host_changed', payload: { new_host_id: user.id } })

  return NextResponse.json({ ok: true, new_host_id: user.id })
}
