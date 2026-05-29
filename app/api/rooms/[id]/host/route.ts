import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { broadcastRoomEvent, validateHost } from '@/lib/roomHelpers'

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

  const { room, error: hostError } = await validateHost(id, user.id)
  if (hostError || !room) {
    return NextResponse.json({ error: hostError ?? 'Error de validación' }, { status: 403 })
  }

  let body: { new_host_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const { new_host_id } = body
  if (!new_host_id) {
    return NextResponse.json({ error: 'new_host_id requerido' }, { status: 400 })
  }

  await admin.from('rooms').update({ host_id: new_host_id }).eq('id', id)

  await admin.from('host_log').insert({
    room_id: id,
    user_id: user.id,
    action: `cedió el rol de host a ${new_host_id}`,
  })

  await broadcastRoomEvent(id, { type: 'host_changed', payload: { new_host_id } })

  return NextResponse.json({ ok: true, new_host_id })
}
