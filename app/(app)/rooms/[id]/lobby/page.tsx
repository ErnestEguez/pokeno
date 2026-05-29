'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BoardCarousel } from '@/components/board-select/BoardCarousel'
import { SlotList } from '@/components/board-select/SlotList'
import { PatternSelector } from '@/components/lobby/PatternSelector'
import { useRoom } from '@/hooks/useRoom'
import { createClient } from '@/lib/supabase/client'
import type { BoardTemplateRow, RoomSlotRow } from '@/types/database'

type SlotWithTemplate = RoomSlotRow & { board_template: BoardTemplateRow }

export default function RoomLobbyPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { room, slots, isLoading, hostId, refetch } = useRoom(id)
  const [templates, setTemplates] = useState<BoardTemplateRow[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [claimingHost, setClaimingHost] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [localPatterns, setLocalPatterns] = useState<string[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const patterns = room?.winning_patterns as string[] | undefined
    if (patterns && patterns.length > 0 && localPatterns.length === 0) {
      setLocalPatterns(patterns)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  useEffect(() => {
    fetch('/api/board-templates').then(r => r.ok ? r.json() : []).then(setTemplates)
  }, [])

  // Verificar si el jugador actual ya eligió tablero
  const userHasSlot = !!userEmail && (slots as SlotWithTemplate[]).some(
    s => s.slot_label === userEmail
  )

  // Redirigir a jugar SOLO si el juego está en curso Y el usuario ya tiene tablero
  useEffect(() => {
    if (room?.status === 'playing' && userHasSlot) {
      router.push(`/rooms/${id}/play`)
      return
    }
    const timer = setInterval(() => refetch(), 3000)
    return () => clearInterval(timer)
  }, [room?.status, userHasSlot, id, router, refetch])

  const takenBoardIds = (slots as SlotWithTemplate[]).map(s => s.board_template_id)
  const isHost = !!userId && userId === hostId
  const noHostAssigned = !hostId  // nadie ha tomado el rol de anfitrión aún
  const hasSlots = slots.length > 0
  const hasPatterns = localPatterns.length > 0

  async function handleSelectBoard(templateId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const res = await fetch(`/api/rooms/${id}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board_template_id: templateId, slot_label: user.email }),
    })
    if (!res.ok) {
      const data = await res.json()
      showToast(data.error ?? 'Error al tomar el tablero')
    } else {
      showToast('¡Tablero seleccionado!')
      refetch()
    }
  }

  async function handleClaimHost() {
    setClaimingHost(true)
    const res = await fetch(`/api/rooms/${id}/take-host`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previous_host_id: hostId ?? null }),
    })
    const data = await res.json()
    if (!res.ok) showToast(data.error ?? 'Error al tomar el rol')
    else { showToast('¡Ahora eres el anfitrión!'); refetch() }
    setClaimingHost(false)
  }

  async function handleStart() {
    if (!hasPatterns) { showToast('Primero elige qué juegos se van a jugar'); return }
    setStarting(true)
    const res = await fetch(`/api/rooms/${id}/start`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json()
      showToast(data.error ?? 'Error al iniciar')
      setStarting(false)
      return
    }
    router.push(`/rooms/${id}/play`)
  }

  if (isLoading) {
    return <div className="text-center py-16 text-gray-400">Cargando sala...</div>
  }

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{room?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Código:{' '}
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded select-all">
              {room?.invite_code}
            </span>
          </p>
        </div>

        {/* Solo el anfitrión puede iniciar */}
        {isHost && (
          <button
            onClick={handleStart}
            disabled={starting || !hasSlots || !hasPatterns}
            className="flex-shrink-0 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            title={!hasPatterns ? 'Elige los juegos primero' : !hasSlots ? 'Necesitas al menos un jugador' : ''}
          >
            {starting ? 'Iniciando...' : '▶ Iniciar partida'}
          </button>
        )}
      </div>

      {/* Banner de anfitrión */}
      {noHostAssigned ? (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-orange-800">Sin anfitrión asignado</p>
            <p className="text-sm text-orange-600">El anfitrión dirige el juego y canta las cartas. También puede jugar.</p>
          </div>
          <button
            onClick={handleClaimHost}
            disabled={claimingHost}
            className="flex-shrink-0 bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition text-sm"
          >
            {claimingHost ? '...' : '🎙 Seré el anfitrión'}
          </button>
        </div>
      ) : !isHost ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-green-700 font-medium text-sm">
            🎙 Anfitrión asignado — esperando que inicie la partida
          </span>
        </div>
      ) : null}

      {/* Selector de patrones (solo el anfitrión) */}
      {isHost && (
        <PatternSelector
          roomId={id}
          currentPatterns={localPatterns}
          onSaved={setLocalPatterns}
        />
      )}

      {/* Resumen de patrones para jugadores */}
      {!isHost && localPatterns.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Esta ronda se juega:</p>
          <div className="flex flex-wrap gap-1">
            {localPatterns.map(p => (
              <span key={p} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Banner de partida en curso para jugadores que aún no eligieron tablero */}
      {room?.status === 'playing' && !userHasSlot && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
          <p className="font-semibold text-yellow-800">⚡ La partida ya comenzó</p>
          <p className="text-sm text-yellow-700 mt-1">
            Elige rápido tu tablero para unirte al juego en curso.
          </p>
        </div>
      )}

      {/* Carrusel de tableros */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Elige tu tablero</h2>
        {templates.length > 0 ? (
          <BoardCarousel
            roomId={id}
            templates={templates}
            takenBoardIds={takenBoardIds}
            onSelect={handleSelectBoard}
          />
        ) : (
          <p className="text-gray-400 text-sm">Cargando tableros...</p>
        )}
      </section>

      {/* Lista de jugadores */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Jugadores ({slots.length})
        </h2>
        <SlotList slots={slots as SlotWithTemplate[]} />
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
