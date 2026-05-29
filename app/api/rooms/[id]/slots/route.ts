import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { broadcastRoomEvent } from '@/lib/roomHelpers'

// Máximo de jugadores que pueden compartir el mismo tablero
const MAX_PER_BOARD = 2

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('room_slots')
    .select('*, board_template:board_templates(*)')
    .eq('room_id', id)
    .order('position', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, status, max_boards')
    .eq('id', id)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  }

  // Se puede elegir tablero en lobby O mientras la partida está en curso (unirse tarde)
  if (room.status === 'finished' || room.status === 'paused') {
    return NextResponse.json({ error: 'No se puede elegir tablero en este momento' }, { status: 409 })
  }

  let body: { board_template_id?: string; slot_label?: string }
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 }) }

  const { board_template_id, slot_label } = body
  if (!board_template_id) {
    return NextResponse.json({ error: 'board_template_id requerido' }, { status: 400 })
  }

  // Contar total de slots en la sala (para límite global y posición)
  const { count: totalSlots } = await supabase
    .from('room_slots')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', id)

  // Verificar límite máximo de jugadores
  if ((totalSlots ?? 0) >= room.max_boards) {
    return NextResponse.json(
      { error: `La sala está llena (máximo ${room.max_boards} jugadores)`, code: 'ROOM_FULL' },
      { status: 409 }
    )
  }

  // Verificar que este tablero no supera el máximo de jugadores por tablero
  const { count: boardCount } = await supabase
    .from('room_slots')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', id)
    .eq('board_template_id', board_template_id)

  if ((boardCount ?? 0) >= MAX_PER_BOARD) {
    return NextResponse.json(
      { error: 'Este tablero ya está completo (máximo 2 jugadores por tablero)', code: 'SLOT_TAKEN' },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('room_slots')
    .insert({
      room_id: id,
      board_template_id,
      slot_label: slot_label ?? user.email ?? 'Jugador',
      position: (totalSlots ?? 0) + 1,
    })
    .select('*, board_template:board_templates(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await broadcastRoomEvent(id, {
    type: 'slot_taken',
    payload: { board_template_id, slot_id: data.id },
  })

  return NextResponse.json(data, { status: 201 })
}
