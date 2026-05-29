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
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }) }

  const { slot_id, pattern } = body
  if (!slot_id || !pattern) {
    return NextResponse.json({ error: 'slot_id y pattern son requeridos' }, { status: 400 })
  }

  const { data: room } = await admin
    .from('rooms')
    .select('id, status, winning_patterns, completed_patterns')
    .eq('id', id)
    .single()

  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  if (room.status !== 'playing') {
    return NextResponse.json({ error: 'La partida no está en curso' }, { status: 409 })
  }

  const winningPatterns = (room.winning_patterns ?? []) as string[]
  const completedPatterns = (room.completed_patterns ?? []) as string[]

  // Verificar que el patrón es uno de los seleccionados para esta ronda
  if (!winningPatterns.includes(pattern)) {
    return NextResponse.json(
      { error: 'Este patrón no está activo para esta ronda', code: 'INVALID_PATTERN' },
      { status: 400 }
    )
  }

  // Verificar que el patrón aún no fue ganado en esta ronda
  if (completedPatterns.includes(pattern)) {
    return NextResponse.json(
      { error: 'Este patrón ya fue ganado en esta ronda', code: 'PATTERN_ALREADY_WON' },
      { status: 409 }
    )
  }

  // Obtener grid del tablero del slot
  const { data: slot } = await admin
    .from('room_slots')
    .select('id, board_template:board_templates(card_grid)')
    .eq('id', slot_id)
    .eq('room_id', id)
    .single()

  if (!slot) return NextResponse.json({ error: 'Slot no encontrado' }, { status: 404 })

  // Obtener celdas marcadas del slot (guardadas en DB)
  const { data: markedCells } = await admin
    .from('marked_cells')
    .select('card_code')
    .eq('slot_id', slot_id)
    .eq('is_marked', true)

  const markedCodes = new Set((markedCells ?? []).map(c => c.card_code))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grid = ((slot as any).board_template?.card_grid) as BoardGrid | undefined
  if (!grid) return NextResponse.json({ error: 'Grid no disponible' }, { status: 500 })

  const valid = checkPattern(grid, markedCodes, pattern as WinningPattern)

  if (!valid) {
    await broadcastRoomEvent(id, {
      type: 'claim_result',
      payload: { valid: false, slot_id, pattern },
    })
    return NextResponse.json({ valid: false, pattern, slot_id })
  }

  // ── Patrón válido ─────────────────────────────────────────────────────────
  // Obtener el nombre del ganador
  const { data: slotData } = await admin
    .from('room_slots')
    .select('slot_label')
    .eq('id', slot_id)
    .single()

  const winnerLabel = slotData?.slot_label ?? 'Jugador'
  const newCompleted = [...completedPatterns, pattern]

  // ¿Ya se ganaron TODOS los patrones seleccionados?
  const allPatternsWon = winningPatterns.every(p => newCompleted.includes(p))

  if (allPatternsWon) {
    // Terminar la ronda completa
    await admin.from('rooms').update({
      status: 'finished',
      ended_at: new Date().toISOString(),
      completed_patterns: newCompleted,
    }).eq('id', id)
  } else {
    // Solo marcar este patrón como ganado, la ronda CONTINÚA
    await admin.from('rooms').update({
      completed_patterns: newCompleted,
    }).eq('id', id)
  }

  await broadcastRoomEvent(id, {
    type: 'claim_result',
    payload: {
      valid: true,
      slot_id,
      pattern,
      winner_label: winnerLabel,
      winner_id: user.id,
      game_over: allPatternsWon,
      completed_patterns: newCompleted,
      remaining_patterns: winningPatterns.filter(p => !newCompleted.includes(p)),
    },
  })

  return NextResponse.json({
    valid: true,
    pattern,
    slot_id,
    game_over: allPatternsWon,
    completed_patterns: newCompleted,
    remaining_patterns: winningPatterns.filter(p => !newCompleted.includes(p)),
  })
}
