import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { shuffleDeck, STANDARD_DECK } from '@/lib/deckUtils'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Salas donde el usuario es owner/host O tiene un slot (jugador que se unió)
  const [ownedResult, slottedResult] = await Promise.all([
    supabase
      .from('rooms')
      .select('*')
      .or(`owner_id.eq.${user.id},host_id.eq.${user.id}`)
      .order('created_at', { ascending: false }),

    supabase
      .from('room_slots')
      .select('room_id')
      .eq('slot_label', user.email ?? ''),
  ])

  const ownedIds = new Set((ownedResult.data ?? []).map(r => r.id))
  const slotRoomIds = (slottedResult.data ?? []).map(s => s.room_id).filter(id => !ownedIds.has(id))

  let slottedRooms: typeof ownedResult.data = []
  if (slotRoomIds.length > 0) {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .in('id', slotRoomIds)
      .order('created_at', { ascending: false })
    slottedRooms = data ?? []
  }

  const all = [...(ownedResult.data ?? []), ...slottedRooms]
  return NextResponse.json(all)
}

// Solo el administrador puede crear salas
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Verificar que es administrador
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    return NextResponse.json({ error: 'Solo el administrador puede crear salas' }, { status: 403 })
  }

  // Verificar saldo
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('games_total, games_used, is_active')
    .eq('user_id', user.id)
    .single()

  if (!subscription || !subscription.is_active || subscription.games_used >= subscription.games_total) {
    return NextResponse.json(
      { error: 'Sin partidas disponibles. Recarga tu saldo.', code: 'NO_GAMES_LEFT' },
      { status: 403 }
    )
  }

  let body: { name?: string; winning_patterns?: string[]; max_boards?: number }
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }) }

  const { name, winning_patterns = [], max_boards = 12 } = body
  if (!name?.trim()) {
    return NextResponse.json({ error: 'El nombre de la sala es requerido' }, { status: 400 })
  }

  // Crear sala — host_id = null hasta que un jugador se declare anfitrión
  const { data: room, error: roomError } = await admin
    .from('rooms')
    .insert({
      owner_id: user.id,
      host_id: null, // ningún anfitrión hasta que un jugador tome el rol
      name: name.trim(),
      winning_patterns,
      max_boards,
    })
    .select()
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: roomError?.message ?? 'Error al crear sala' }, { status: 500 })
  }

  // Crear mazo barajado
  const shuffled = shuffleDeck(STANDARD_DECK).map(c => c.code)
  const { error: deckError } = await admin
    .from('room_decks')
    .insert({ room_id: room.id, shuffled_deck: shuffled })

  if (deckError) {
    await admin.from('rooms').delete().eq('id', room.id)
    return NextResponse.json({ error: 'Error al preparar el mazo' }, { status: 500 })
  }

  // Consumir 1 crédito
  await admin
    .from('subscriptions')
    .update({ games_used: subscription.games_used + 1, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json(room, { status: 201 })
}
