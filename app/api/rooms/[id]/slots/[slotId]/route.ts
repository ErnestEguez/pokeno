import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  const { id, slotId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: { slot_label?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const { slot_label } = body
  if (!slot_label?.trim()) {
    return NextResponse.json({ error: 'slot_label requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('room_slots')
    .update({ slot_label: slot_label.trim() })
    .eq('id', slotId)
    .eq('room_id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Slot no encontrado' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  const { id, slotId } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Solo se puede eliminar si la sala está en lobby
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('status')
    .eq('id', id)
    .single()

  if (roomError || !room) {
    return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  }

  if (room.status !== 'lobby') {
    return NextResponse.json({ error: 'Solo se puede eliminar slots en el lobby' }, { status: 409 })
  }

  const { error } = await supabase
    .from('room_slots')
    .delete()
    .eq('id', slotId)
    .eq('room_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
