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

  if (room.status !== 'playing') {
    return NextResponse.json({ error: 'La partida no está en curso' }, { status: 409 })
  }

  const { data: deck, error: deckError } = await admin
    .from('room_decks')
    .select('shuffled_deck, current_index')
    .eq('room_id', id)
    .single()

  if (deckError || !deck) {
    return NextResponse.json({ error: 'Mazo no encontrado' }, { status: 404 })
  }

  const shuffled = deck.shuffled_deck as string[]
  if (deck.current_index >= shuffled.length) {
    return NextResponse.json({ error: 'El mazo ya fue agotado' }, { status: 409 })
  }

  const card = shuffled[deck.current_index]
  const nextIndex = deck.current_index + 1

  // Insertar carta cantada
  await admin.from('called_cards').insert({
    room_id: id,
    card_code: card,
    call_order: deck.current_index + 1,
  })

  // Avanzar índice
  await admin
    .from('room_decks')
    .update({ current_index: nextIndex, updated_at: new Date().toISOString() })
    .eq('room_id', id)

  // Broadcast carta cantada
  await broadcastRoomEvent(id, { type: 'card_called', payload: { card, call_order: nextIndex } })

  // Si se agotaron las cartas, terminar la partida
  if (nextIndex >= shuffled.length) {
    await admin.from('rooms').update({ status: 'finished', ended_at: new Date().toISOString() }).eq('id', id)
    await admin.from('room_decks').update({ deck_status: 'done' }).eq('room_id', id)
    await broadcastRoomEvent(id, { type: 'game_ended' })
  }

  return NextResponse.json({ card, call_order: nextIndex, deck_exhausted: nextIndex >= shuffled.length })
}
