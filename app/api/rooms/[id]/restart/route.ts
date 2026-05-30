import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { shuffleDeck, STANDARD_DECK } from '@/lib/deckUtils'
import { validateHost } from '@/lib/roomHelpers'

// Reinicia la partida en curso: limpia cartas cantadas y marcas,
// baraja de nuevo y vuelve al lobby. No consume créditos ni borra slots.
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

  if (room.status === 'lobby') {
    return NextResponse.json({ error: 'La sala ya está en lobby' }, { status: 409 })
  }

  // 1. Obtener slots para borrar sus marcas
  const { data: slots } = await admin
    .from('room_slots')
    .select('id')
    .eq('room_id', id)
  const slotIds = (slots ?? []).map((s: { id: string }) => s.id)

  // 2. Borrar celdas marcadas de todos los slots
  if (slotIds.length > 0) {
    await admin.from('marked_cells').delete().in('slot_id', slotIds)
  }

  // 3. Borrar cartas cantadas
  await admin.from('called_cards').delete().eq('room_id', id)

  // 4. Nuevo mazo barajado y resetear deck
  const shuffled = shuffleDeck(STANDARD_DECK).map(c => c.code)
  await admin
    .from('room_decks')
    .update({ shuffled_deck: shuffled, current_index: 0, deck_status: 'ready', updated_at: new Date().toISOString() })
    .eq('room_id', id)

  // 5. Volver a lobby y limpiar estado de la ronda
  await admin
    .from('rooms')
    .update({ status: 'lobby', ended_at: null, completed_patterns: [] })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
