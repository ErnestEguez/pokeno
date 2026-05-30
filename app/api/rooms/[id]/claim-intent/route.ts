import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { broadcastRoomEvent } from '@/lib/roomHelpers'

// Pausa la cantada inmediatamente al abrir el modal de reclamo
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  await broadcastRoomEvent(id, { type: 'claim_submitted', payload: {} })
  return NextResponse.json({ ok: true })
}
