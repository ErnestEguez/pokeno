import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  let body: { invite_code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const { invite_code } = body
  if (!invite_code) {
    return NextResponse.json({ error: 'Código de invitación requerido' }, { status: 400 })
  }

  const { data: room, error } = await supabase
    .from('rooms')
    .select('id, invite_code, status')
    .eq('id', id)
    .single()

  if (error || !room) {
    return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  }

  if (room.invite_code !== invite_code) {
    return NextResponse.json({ error: 'Código de invitación incorrecto' }, { status: 403 })
  }

  if (room.status === 'finished') {
    return NextResponse.json({ error: 'La partida ya terminó' }, { status: 409 })
  }

  return NextResponse.json({ room_id: room.id })
}
