'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { RoomRow, RoomSlotRow, SubscriptionRow } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function ResultPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [room, setRoom] = useState<RoomRow | null>(null)
  const [slots, setSlots] = useState<RoomSlotRow[]>([])
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingRound, setStartingRound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))

    Promise.all([
      fetch(`/api/rooms/${id}`).then(r => r.ok ? r.json() : null),
      fetch('/api/me/subscription').then(r => r.ok ? r.json() : null),
    ]).then(([roomData, subData]) => {
      if (roomData) { setRoom(roomData); setSlots(roomData.slots ?? []) }
      if (subData) setSubscription(subData)
      setLoading(false)
    })
  }, [id])

  const isHost = userId && room?.host_id === userId
  const hasGamesLeft = subscription
    ? subscription.games_used < subscription.games_total
    : false

  async function handleNewRound() {
    setStartingRound(true)
    setError(null)
    const res = await fetch(`/api/rooms/${id}/new-round`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Error al iniciar nueva ronda')
      setStartingRound(false)
      return
    }
    // Volver al lobby de la misma sala
    router.push(`/rooms/${id}/lobby`)
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Cargando resultado...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-6">
        <div className="text-6xl">🏆</div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">¡Ronda terminada!</h1>
          <p className="text-gray-500 mt-1">{room?.name}</p>
          {room?.invite_code && (
            <p className="text-sm text-gray-400 mt-1">
              Código:{' '}
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded select-all">
                {room.invite_code}
              </span>
            </p>
          )}
        </div>

        {/* Jugadores de esta ronda */}
        {slots.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">Jugaron esta ronda</p>
            <ul className="space-y-1">
              {slots.map(slot => (
                <li key={slot.id} className="text-sm text-gray-600 flex items-center gap-2">
                  <span>🎴</span> {slot.slot_label ?? 'Sin nombre'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Saldo restante */}
        {subscription && (
          <p className="text-sm text-gray-500">
            Partidas disponibles:{' '}
            <span className={`font-bold ${hasGamesLeft ? 'text-green-600' : 'text-red-500'}`}>
              {subscription.games_total - subscription.games_used}
            </span>
          </p>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {/* Nueva ronda en la misma sala (solo el host) */}
          {isHost && hasGamesLeft && (
            <button
              onClick={handleNewRound}
              disabled={startingRound}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {startingRound ? 'Preparando...' : '🔄 Nueva ronda (misma sala)'}
            </button>
          )}

          {/* Jugadores: volver al lobby de la MISMA sala para elegir tablero */}
          {!isHost && (
            <Link
              href={`/rooms/${id}/lobby`}
              className="w-full block bg-blue-600 text-white py-3 rounded-xl font-bold text-center hover:bg-blue-700 transition"
            >
              🎴 Entrar al lobby de la sala
            </Link>
          )}

          {/* Nueva sala */}
          {isHost && hasGamesLeft && (
            <Link
              href="/lobby"
              className="w-full block border-2 border-blue-600 text-blue-600 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition text-center text-sm"
            >
              + Nueva sala diferente
            </Link>
          )}

          <Link
            href="/lobby"
            className="w-full block border border-gray-300 text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition text-center text-sm"
          >
            Salir al lobby principal
          </Link>
        </div>
      </div>
    </div>
  )
}
