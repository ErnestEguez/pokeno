import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { shuffleDeck, STANDARD_DECK } from '@/lib/deckUtils'
import { broadcastRoomEvent } from '@/lib/roomHelpers'

// El host inicia una nueva ronda en la misma sala:
// - Baraja el mazo de nuevo
// - Borra las cartas cantadas y las marcas
// - Resetea el estado a 'lobby' para que los jugadores puedan cambiar tableros
// - Consume 1 crédito de la suscripción del dueño
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

  // Verificar que es el host
  const { data: room } = await admin
    .from('rooms')
    .select('id, host_id, owner_id, status')
    .eq('id', id)
    .single()

  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  if (room.host_id !== user.id) {
    return NextResponse.json({ error: 'Solo el host puede iniciar una nueva ronda' }, { status: 403 })
  }
  if (room.status !== 'finished' && room.status !== 'playing' && room.status !== 'paused') {
    return NextResponse.json({ error: 'La sala debe haber terminado una ronda primero' }, { status: 409 })
  }

  // Verificar saldo del owner
  const { data: sub } = await admin
    .from('subscriptions')
    .select('games_total, games_used')
    .eq('user_id', room.owner_id)
    .single()

  if (!sub || sub.games_used >= sub.games_total) {
    return NextResponse.json(
      { error: 'Sin partidas disponibles para una nueva ronda', code: 'NO_GAMES_LEFT' },
      { status: 403 }
    )
  }

  // 1. Baraja nuevo mazo
  const shuffled = shuffleDeck(STANDARD_DECK).map(c => c.code)

  // 2. Borrar cartas cantadas
  await admin.from('called_cards').delete().eq('room_id', id)

  // 3. Borrar marcas y slots de la ronda anterior
  // (ON DELETE CASCADE en marked_cells → slot borra sus marcas automáticamente)
  await admin.from('room_slots').delete().eq('room_id', id)

  // 4. Resetear el mazo
  await admin
    .from('room_decks')
    .update({ shuffled_deck: shuffled, current_index: 0, deck_status: 'ready', updated_at: new Date().toISOString() })
    .eq('room_id', id)

  // 5. Volver a lobby y resetear patrones completados
  await admin
    .from('rooms')
    .update({ status: 'lobby', ended_at: null, completed_patterns: [] })
    .eq('id', id)

  // 6. Consumir 1 crédito
  await admin
    .from('subscriptions')
    .update({ games_used: sub.games_used + 1, updated_at: new Date().toISOString() })
    .eq('user_id', room.owner_id)

  return NextResponse.json({ ok: true, message: 'Nueva ronda lista' })
}
