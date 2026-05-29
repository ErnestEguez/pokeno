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

  useEffect(() => {
    fetch('/api/rooms')
      .then(r => r.ok ? r.json() : [])
      .then(setRooms)
      .finally(() => setLoading(false))
  }, [])

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  if (loading) return <p className="text-gray-400 text-sm">Cargando salas...</p>
  if (rooms.length === 0) return <p className="text-gray-400 text-sm">No has creado salas aún.</p>

  return (
    <div className="space-y-2">
      {rooms.map(room => {
        const st = STATUS_LABEL[room.status] ?? STATUS_LABEL.lobby
        return (
          <div key={room.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{room.name}</p>
              <p className="text-xs text-gray-400">Creada: {new Date(room.created_at).toLocaleDateString('es')}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
            <button
              onClick={() => copyCode(room.invite_code)}
              className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition text-sm"
              title="Clic para copiar"
            >
              {copied === room.invite_code ? '✓ Copiado' : room.invite_code}
            </button>
          </div>
        )
      })}
    </div>
  )
}
