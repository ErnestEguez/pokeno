import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
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

  // Snapshot completo para reconexión.
  // Los slots usan admin para que RLS en board_templates no bloquee board_number.
  const [roomResult, deckResult, slotsResult, calledResult] = await Promise.all([
    supabase.from('rooms').select('*').eq('id', id).single(),
    admin.from('room_decks').select('*').eq('room_id', id).single(),
    admin.from('room_slots').select(`
      *,
      board_template:board_templates(*),
      marked_cells(*)
    `).eq('room_id', id).order('position'),
    admin
      .from('called_cards')
      .select('*')
      .eq('room_id', id)
      .order('call_order', { ascending: true }),
  ])

  if (roomResult.error || !roomResult.data) {
    return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    room: roomResult.data,
    deck: deckResult.data,
    slots: slotsResult.data ?? [],
    called_cards: calledResult.data ?? [],
  })
}
