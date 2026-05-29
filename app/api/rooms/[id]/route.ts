import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const { data: room, error } = await supabase
    .from('rooms')
    .select(`
      *,
      slots:room_slots(
        *,
        board_template:board_templates(*)
      ),
      called_cards(* )
    `)
    .eq('id', id)
    .single()

  if (error || !room) {
    return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  }

  return NextResponse.json(room)
}

// Solo el host puede actualizar los patrones mientras la sala está en lobby
export async function PATCH(
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

  // Verificar que es el host y la sala está en lobby
  const { data: room } = await admin.from('rooms').select('host_id, status').eq('id', id).single()
  if (!room) return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  if (room.host_id !== user.id) return NextResponse.json({ error: 'Solo el host puede cambiar las reglas' }, { status: 403 })
  if (room.status !== 'lobby') return NextResponse.json({ error: 'Solo se pueden cambiar las reglas en el lobby' }, { status: 409 })

  let body: { winning_patterns?: string[] }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 }) }

  if (!Array.isArray(body.winning_patterns) || body.winning_patterns.length === 0) {
    return NextResponse.json({ error: 'Debes seleccionar al menos un patrón' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('rooms')
    .update({ winning_patterns: body.winning_patterns })
    .eq('id', id)
    .select('winning_patterns')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Solo el admin puede eliminar salas (borra en cascada slots, cartas, marcas, etc.)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single()
  if (!userData?.is_admin) {
    return NextResponse.json({ error: 'Solo el administrador puede eliminar salas' }, { status: 403 })
  }

  const { error } = await admin.from('rooms').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
