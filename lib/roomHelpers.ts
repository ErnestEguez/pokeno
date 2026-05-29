import { createAdminClient } from '@/lib/supabase/admin'
import type { RealtimeEvent } from '@/types/game'

// Emite un evento broadcast al canal de la sala usando la REST API de Supabase Realtime
export async function broadcastRoomEvent(roomId: string, event: RealtimeEvent) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        messages: [{
          topic: `room:${roomId}`,
          event: 'broadcast',
          payload: { type: event.type, ...(event.payload ?? {}) },
        }],
      }),
    })
  } catch {
    // El broadcast es opcional; si falla, la UI se actualiza por polling/reconexión
  }
}

// Valida que el usuario sea el host actual de la sala
export async function validateHost(roomId: string, userId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('rooms')
    .select('id, host_id, status')
    .eq('id', roomId)
    .single()

  if (error || !data) return { room: null, error: 'Sala no encontrada' }
  if (data.host_id !== userId) return { room: null, error: 'Solo el host puede realizar esta acción' }
  return { room: data, error: null }
}
