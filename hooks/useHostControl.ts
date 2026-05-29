'use client'

import { useState, useCallback } from 'react'

interface UseHostControlProps {
  roomId: string
  userId: string | null
  hostId: string | null
}

export function useHostControl({ roomId, userId, hostId }: UseHostControlProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isHost = Boolean(userId && userId === hostId)

  async function apiCall(path: string, method: string, body?: object): Promise<boolean> {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}/${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error desconocido')
        return false
      }
      return true
    } catch {
      setError('Error de conexión')
      return false
    } finally {
      setLoading(false)
    }
  }

  const startGame   = useCallback(() => apiCall('start', 'POST'), [roomId])
  const nextCard    = useCallback(() => apiCall('next-card', 'POST'), [roomId])
  const pause       = useCallback(() => apiCall('pause', 'PATCH'), [roomId])
  const resume      = useCallback(() => apiCall('resume', 'PATCH'), [roomId])

  const transferHost = useCallback(
    (newHostId: string) => apiCall('host', 'PATCH', { new_host_id: newHostId }),
    [roomId]
  )

  const takeHost = useCallback(
    (previousHostId: string) => apiCall('take-host', 'POST', { previous_host_id: previousHostId }),
    [roomId]
  )

  return { isHost, loading, error, startGame, nextCard, pause, resume, transferHost, takeHost }
}
