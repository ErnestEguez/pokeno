'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeEventType, RealtimeEvent } from '@/types/game'

type EventHandlers = Partial<Record<RealtimeEventType, (payload: RealtimeEvent['payload']) => void>>

export function useRealtime(roomId: string, handlers: EventHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!roomId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('broadcast', { event: '*' }, ({ event, payload }) => {
        const handler = handlersRef.current[event as RealtimeEventType]
        if (handler) handler(payload as RealtimeEvent['payload'])
      })
      .subscribe((status) => {
        // Reconexión automática si se pierde la conexión
        if (status === 'CHANNEL_ERROR') {
          channel.subscribe()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])
}
