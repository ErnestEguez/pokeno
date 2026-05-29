import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { broadcastRoomEvent, validateHost } from '@/lib/roomHelpers'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { room, error: hostError } = await validateHost(id, user.id)
  if (hostError || !room) {
    return NextResponse.json({ error: hostError ?? 'Error de validación' }, { status: 403 })
  }

  if (room.status !== 'paused') {
    return NextResponse.json({ error: 'La partida no está pausada' }, { status: 409 })
  }

  await admin.from('rooms').update({ status: 'playing' }).eq('id', id)
  await admin.from('room_decks').update({ deck_status: 'running' }).eq('room_id', id)
  await broadcastRoomEvent(id, { type: 'game_resumed' })

  return NextResponse.json({ ok: true })
}
