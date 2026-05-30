import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { broadcastRoomEvent, validateHost } from '@/lib/roomHelpers'

export async function POST(
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

  if (room.status !== 'lobby') {
    return NextResponse.json({ error: 'La sala no está en lobby' }, { status: 409 })
  }

  // Resetear estado de ronda anterior al iniciar
  await admin
    .from('rooms')
    .update({ status: 'playing', completed_patterns: [], ended_at: null })
    .eq('id', id)

  await admin
    .from('room_decks')
    .update({ deck_status: 'running', updated_at: new Date().toISOString() })
    .eq('room_id', id)

  await broadcastRoomEvent(id, { type: 'game_started' })

  return NextResponse.json({ ok: true })
}
