'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  roomId: string
}

export function RestartButton({ roomId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRestart() {
    if (!confirm('¿Reiniciar la partida? Se borrarán las cartas cantadas y las marcas del tablero.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}/restart`, { method: 'POST' })
      if (res.ok) {
        router.push(`/rooms/${roomId}/lobby`)
      } else {
        const data = await res.json()
        alert(data.error ?? 'Error al reiniciar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRestart}
      disabled={loading}
      className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
    >
      {loading ? '...' : 'Reiniciar'}
    </button>
  )
}
