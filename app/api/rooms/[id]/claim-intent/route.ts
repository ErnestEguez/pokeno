import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { broadcastRoomEvent } from '@/lib/roomHelpers'

// Pausa la sala en DB cuando un jugador abre el modal de POKENO.
// Retorna { paused: true } si se pausó, { paused: false } si ya estaba pausada.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: room } = await admin
    .from('rooms')
    .select('status')
    .eq('id', id)
    .single()

  if (room?.status !== 'playing') {
    return NextResponse.json({ ok: true, paused: false })
  }

  await admin.from('rooms').update({ status: 'paused' }).eq('id', id)
  await admin.from('room_decks')
    .update({ deck_status: 'paused', updated_at: new Date().toISOString() })
    .eq('room_id', id)
  await broadcastRoomEvent(id, { type: 'game_paused' })

  return NextResponse.json({ ok: true, paused: true })
}
