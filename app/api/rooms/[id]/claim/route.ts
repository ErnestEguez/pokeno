import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { broadcastRoomEvent } from '@/lib/roomHelpers'
import { checkPattern } from '@/lib/patternChecker'
import type { BoardGrid, WinningPattern } from '@/types/game'

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

  let body: { slot_id?: string; pattern?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const { slot_id, pattern } = body
  if (!slot_id || !pattern) {
    return NextResponse.json({ error: 'slot_id y pattern son requeridos' }, { status: 400 })
  }

  // Verificar que la sala está jugando
  const { data: room, error: roomError } = await admin
    .from('rooms')
    .select('id, status, winning_patterns')
    .eq('id', id)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  }

  if (room.status !== 'playing') {
    return NextResponse.json({ error: 'La partida no está en curso' }, { status: 409 })
  }

  // Verificar que el patrón es uno de los ganadores seleccionados
  const winningPatterns = room.winning_patterns as string[]
  if (!winningPatterns.includes(pattern)) {
    return NextResponse.json(
      { error: 'El patrón no está activo para esta partida', code: 'INVALID_PATTERN' },
      { status: 400 }
    )
  }

  // Obtener el grid del tablero del slot
  const { data: slot, error: slotError } = await admin
    .from('room_slots')
    .select('id, board_template:board_templates(card_grid)')
    .eq('id', slot_id)
    .eq('room_id', id)
    .single()

  if (slotError || !slot) {
    return NextResponse.json({ error: 'Slot no encontrado' }, { status: 404 })
  }

  // Obtener celdas marcadas del slot
  const { data: markedCells } = await admin
    .from('marked_cells')
    .select('card_code')
    .eq('slot_id', slot_id)
    .eq('is_marked', true)

  const markedCodes = new Set((markedCells ?? []).map(c => c.card_code))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const boardTemplate = (slot as any).board_template
  const grid = boardTemplate?.card_grid as BoardGrid | undefined

  if (!grid) {
    return NextResponse.json({ error: 'Grid del tablero no disponible' }, { status: 500 })
  }

  const valid = checkPattern(grid, markedCodes, pattern as WinningPattern)

  if (valid) {
    await admin
      .from('rooms')
      .update({ status: 'finished', ended_at: new Date().toISOString() })
      .eq('id', id)

    await broadcastRoomEvent(id, {
      type: 'claim_result',
      payload: { valid: true, slot_id, pattern, winner: user.id },
    })
  } else {
    await broadcastRoomEvent(id, {
      type: 'claim_result',
      payload: { valid: false, slot_id, pattern },
    })
  }

  return NextResponse.json({ valid, pattern, slot_id })
}
