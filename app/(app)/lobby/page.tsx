'use client'

import { useState, useEffect } from 'react'
import { RoomCard } from '@/components/lobby/RoomCard'
import { JoinRoomModal } from '@/components/lobby/JoinRoomModal'
import type { RoomRow } from '@/types/database'

export default function LobbyPage() {
  const [rooms, setRooms] = useState<RoomRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showJoin, setShowJoin] = useState(false)

  async function loadRooms() {
    try {
      const res = await fetch('/api/rooms')
      if (res.ok) setRooms(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRooms() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis salas</h1>
        <button
          onClick={() => setShowJoin(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + Unirse con código
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Aún no tienes salas</p>
          <p className="text-sm">Pide el código de sala al administrador y úsalo para entrar</p>
          <button
            onClick={() => setShowJoin(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Ingresar código de sala
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map(room => <RoomCard key={room.id} room={room} />)}
        </div>
      )}

      {showJoin && (
        <JoinRoomModal onClose={() => { setShowJoin(false); loadRooms() }} />
      )}
    </div>
  )
}
