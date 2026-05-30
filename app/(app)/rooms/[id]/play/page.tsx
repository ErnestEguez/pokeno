'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { useBoard } from '@/hooks/useBoard'
import { useHostControl } from '@/hooks/useHostControl'
import { useCardAnnouncer } from '@/hooks/useCardAnnouncer'
import { PlayerBoard } from '@/components/game/PlayerBoard'
import { CalledCardDisplay } from '@/components/game/CalledCardDisplay'
import { CardHistory } from '@/components/game/CardHistory'
import { PatternIndicator } from '@/components/game/PatternIndicator'
import { ClaimButton } from '@/components/game/ClaimButton'
import { ClaimResultBanner } from '@/components/game/ClaimResultBanner'
import { TakeHostButton } from '@/components/host/TakeHostButton'
import { createClient } from '@/lib/supabase/client'
import type { RoomSlotRow, BoardTemplateRow } from '@/types/database'
import type { BoardGrid } from '@/types/game'

type SlotWithTemplate = RoomSlotRow & {
  board_template: BoardTemplateRow & { card_grid: BoardGrid }
}

export default function PlayPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [userId, setUserId]     = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  const { room, slots, calledCards, hostId, claimInProgress, claimResult, dismissClaim, isLoading, refetch } = useRoom(id)

  // Polling de respaldo cada 4 s
  useEffect(() => {
    const t = setInterval(() => refetch(), 4000)
    return () => clearInterval(t)
  }, [refetch])

  const { isHost, loading: hostLoading, nextCard, pause, resume, takeHost } = useHostControl({
    roomId: id, userId, hostId,
  })

  const { enabled: audioOn, toggle: toggleAudio, announce } = useCardAnnouncer()

  const latestCard = calledCards.length > 0
    ? calledCards[calledCards.length - 1].card_code
    : null

  // Anunciar carta cuando cambia
  useEffect(() => { announce(latestCard) }, [latestCard, announce])

  // Slot del jugador actual (por email guardado en slot_label)
  const mySlot = userEmail
    ? (slots as SlotWithTemplate[]).find(s => s.slot_label === userEmail)
    : undefined

  const myGrid      = mySlot?.board_template?.card_grid ?? null
  const mySlotId    = mySlot?.id ?? ''
  const myBoardNum  = mySlot?.board_template?.board_number ?? null

  const { markedCodes, markCell } = useBoard(mySlotId, id, myGrid)

  const [columnLabels, setColumnLabels] = useState<string[]>([])
  const [rowLabels, setRowLabels]       = useState<string[]>([])

  useEffect(() => {
    if (!myBoardNum) return
    fetch(`/api/board-labels?board_number=${myBoardNum}`)
      .then(r => r.json())
      .then((data: { tipo: string; posicion: number; texto: string }[]) => {
        const cols = Array(5).fill('')
        const rows = Array(5).fill('')
        for (const item of data) {
          if (item.tipo === 'columna') cols[item.posicion - 1] = item.texto
          if (item.tipo === 'fila')    rows[item.posicion - 1] = item.texto
        }
        setColumnLabels(cols)
        setRowLabels(rows)
      })
      .catch(() => {})
  }, [myBoardNum])

  // Redirigir al resultado solo si ya se jugó (al menos 1 carta cantada)
  // — evita falsa redirección con estado 'finished' del juego anterior
  useEffect(() => {
    if (room?.status === 'finished' && calledCards.length > 0) {
      router.push(`/rooms/${id}/result`)
    }
  }, [room?.status, calledCards.length, id, router])

  if (isLoading || !userId) {
    return <div className="text-center py-16 text-gray-400">Cargando partida...</div>
  }

  const patterns = room?.winning_patterns ?? []
  const roomStatus = room?.status ?? 'playing'

  return (
    <div className="h-full">
      {/* Cabecera compacta */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <span className="font-bold text-gray-800">{room?.name}</span>
          <span className="ml-2 text-xs text-gray-400">
            {isHost ? '👑 Anfitrión' : userEmail}
          </span>
          {room?.invite_code && (
            <span className="ml-2 text-xs text-gray-400">
              Código:{' '}
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded select-all">
                {room.invite_code}
              </span>
            </span>
          )}
        </div>
        <PatternIndicator patterns={patterns} />
      </div>

      {/* Layout de dos columnas: izquierda = carta + controls, derecha = tablero */}
      <div className="flex gap-4 items-start">

        {/* ── COLUMNA IZQUIERDA ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 flex-shrink-0" style={{ width: 170 }}>

          {/* Carta cantada */}
          <div>
            <p className="text-xs text-gray-500 mb-1 text-center">Carta cantada</p>
            <CalledCardDisplay card={latestCard} />
            <p className="text-center text-xs text-gray-400 mt-1">
              {calledCards.length} / 52
            </p>
          </div>

          {/* Controles del host */}
          {isHost && (
            <div className="space-y-2">
              <button
                onClick={() => nextCard()}
                disabled={hostLoading || roomStatus !== 'playing' || claimInProgress}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {claimInProgress ? '⏳ Verificando...' : '► Siguiente carta'}
              </button>

              {roomStatus === 'playing' && (
                <button onClick={() => pause()} disabled={hostLoading}
                  className="w-full border border-yellow-500 text-yellow-700 py-2 rounded-xl text-sm hover:bg-yellow-50 disabled:opacity-50">
                  ⏸ Pausar
                </button>
              )}
              {roomStatus === 'paused' && (
                <button onClick={() => resume()} disabled={hostLoading}
                  className="w-full bg-green-600 text-white py-2 rounded-xl text-sm hover:bg-green-700 disabled:opacity-50">
                  ▶ Reanudar
                </button>
              )}

              {/* Velocidad automática */}
              <AutoSpeedSelector onNextCard={nextCard} roomStatus={roomStatus} claimInProgress={claimInProgress} />
            </div>
          )}

          {/* Botón de audio (disponible para todos) */}
          <button
            onClick={toggleAudio}
            className={`w-full py-2 rounded-xl text-sm font-medium border transition ${
              audioOn
                ? 'bg-purple-600 text-white border-purple-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {audioOn ? '🔊 Voz: ON' : '🔇 Voz: OFF'}
          </button>

          {/* Historial */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Historial</p>
            <div className="max-h-48 overflow-y-auto">
              <CardHistory cards={calledCards} />
            </div>
          </div>

          {/* Tomar host si pausado */}
          {!isHost && roomStatus === 'paused' && hostId && (
            <TakeHostButton currentHostId={hostId} onTakeHost={takeHost} />
          )}
        </div>

        {/* ── COLUMNA DERECHA: tablero ───────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {myGrid ? (
            <>
              <p className="text-xs text-gray-500 mb-2">
                Tu tablero — clic en cada carta cantada que tengas
                <span className="text-gray-400 ml-1">({markedCodes.size} marcadas)</span>
              </p>
              <PlayerBoard
                grid={myGrid}
                markedCodes={markedCodes}
                onCellClick={markCell}
                columnLabels={columnLabels}
                rowLabels={rowLabels}
              />
              <div className="mt-3">
                <ClaimButton roomId={id} slotId={mySlotId} availablePatterns={patterns} />
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">
              {isHost
                ? 'Eres el anfitrión — usa los controles de la izquierda para sacar cartas'
                : 'No tienes un tablero en esta sala'}
            </div>
          )}
        </div>
      </div>

      {/* Banner de resultado de reclamo — visible para todos los jugadores */}
      {claimResult && (
        <ClaimResultBanner
          result={claimResult}
          isHost={isHost}
          onContinue={dismissClaim}
        />
      )}
    </div>
  )
}

// ── Selector de velocidad automática ────────────────────────────────────────
function AutoSpeedSelector({ onNextCard, roomStatus, claimInProgress }: {
  onNextCard: () => Promise<boolean>
  roomStatus: string
  claimInProgress: boolean
}) {
  const [speed, setSpeed] = useState(0)

  useEffect(() => {
    if (speed === 0 || roomStatus !== 'playing' || claimInProgress) return
    const t = setInterval(() => { onNextCard() }, speed)
    return () => clearInterval(t)
  }, [speed, roomStatus, claimInProgress]) // onNextCard excluido intencionalmente para evitar reset del intervalo

  const opts = [{ label: 'Manual', v: 0 }, { label: '3s', v: 3000 }, { label: '5s', v: 5000 }, { label: '10s', v: 10000 }]

  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200">
      {opts.map(o => (
        <button
          key={o.v}
          onClick={() => setSpeed(o.v)}
          className={`flex-1 py-1.5 text-xs font-medium transition ${
            speed === o.v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
