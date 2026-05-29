'use client'

import { useState, useEffect } from 'react'
import type { RoomRow } from '@/types/database'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  lobby:    { label: 'Esperando',  color: 'bg-yellow-100 text-yellow-700' },
  playing:  { label: 'En juego',   color: 'bg-green-100 text-green-700'  },
  paused:   { label: 'Pausada',    color: 'bg-blue-100 text-blue-700'    },
  finished: { label: 'Terminada',  color: 'bg-gray-100 text-gray-500'    },
}

export function AdminRoomsList() {
  const [rooms, setRooms] = useState<RoomRow[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function loadRooms() {
    const res = await fetch('/api/rooms')
    if (res.ok) setRooms(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadRooms() }, [])

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function handleDelete(room: RoomRow) {
    const confirmed = confirm(
      `¿Eliminar la sala "${room.name}"?\n\nSe eliminarán también todos los tableros, cartas cantadas y marcas de esa sala. Esta acción no se puede deshacer.`
    )
    if (!confirmed) return

    setDeleting(room.id)
    try {
      const res = await fetch(`/api/rooms/${room.id}`, { method: 'DELETE' })
      if (res.ok) {
        setRooms(prev => prev.filter(r => r.id !== room.id))
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Error al eliminar la sala')
      }
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <p className="text-gray-400 text-sm">Cargando salas...</p>
  if (rooms.length === 0) return <p className="text-gray-400 text-sm">No has creado salas aún.</p>

  return (
    <div className="space-y-2">
      {rooms.map(room => {
        const st = STATUS_LABEL[room.status] ?? STATUS_LABEL.lobby
        const isDeleting = deleting === room.id
        return (
          <div key={room.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{room.name}</p>
              <p className="text-xs text-gray-400">
                {new Date(room.created_at).toLocaleDateString('es', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </p>
            </div>

            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${st.color}`}>
              {st.label}
            </span>

            {/* Código — clic para copiar */}
            <button
              onClick={() => copyCode(room.invite_code)}
              className="flex-shrink-0 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition text-sm"
              title="Clic para copiar código"
            >
              {copied === room.invite_code ? '✓ Copiado' : room.invite_code}
            </button>

            {/* Botón eliminar */}
            <button
              onClick={() => handleDelete(room)}
              disabled={isDeleting}
              className="flex-shrink-0 text-red-500 hover:bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 text-sm disabled:opacity-40 transition"
              title="Eliminar sala y todos sus datos"
            >
              {isDeleting ? '...' : '🗑'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
