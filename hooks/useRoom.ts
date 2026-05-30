'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from './useRealtime'
import type { RoomRow, RoomSlotRow, CalledCardRow, RoomDeckRow } from '@/types/database'

interface RoomState {
  room: RoomRow | null
  slots: RoomSlotRow[]
  calledCards: CalledCardRow[]
  deckStatus: string | null
  hostId: string | null
  claimInProgress: boolean
  isLoading: boolean
  error: string | null
}

export function useRoom(roomId: string) {
  const [state, setState] = useState<RoomState>({
    room: null,
    slots: [],
    calledCards: [],
    deckStatus: null,
    hostId: null,
    claimInProgress: false,
    isLoading: true,
    error: null,
  })


  const fetchState = useCallback(async () => {
    if (!roomId) return
    try {
      const res = await fetch(`/api/rooms/${roomId}/state`)
      if (!res.ok) throw new Error('Error al cargar la sala')
      const data = await res.json()
      setState(prev => ({
        room: data.room,
        slots: data.slots,
        calledCards: data.called_cards,
        deckStatus: (data.deck as RoomDeckRow | null)?.deck_status ?? null,
        hostId: data.room?.host_id ?? null,
        claimInProgress: prev.claimInProgress,
        isLoading: false,
        error: null,
      }))
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: (err as Error).message }))
    }
  }, [roomId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  useRealtime(roomId, {
    game_started: () => {
      setState(prev => ({
        ...prev,
        room: prev.room ? { ...prev.room, status: 'playing' } : null,
        deckStatus: 'running',
      }))
    },
    card_called: (payload) => {
      const card = payload as { card: string; call_order: number }
      setState(prev => ({
        ...prev,
        calledCards: [
          ...prev.calledCards,
          { id: crypto.randomUUID(), room_id: roomId, card_code: card.card, call_order: card.call_order, called_at: new Date().toISOString() },
        ],
      }))
    },
    game_paused: () => {
      setState(prev => ({
        ...prev,
        room: prev.room ? { ...prev.room, status: 'paused' } : null,
        deckStatus: 'paused',
      }))
    },
    game_resumed: () => {
      setState(prev => ({
        ...prev,
        room: prev.room ? { ...prev.room, status: 'playing' } : null,
        deckStatus: 'running',
      }))
    },
    game_ended: () => {
      setState(prev => ({
        ...prev,
        room: prev.room ? { ...prev.room, status: 'finished' } : null,
        deckStatus: 'done',
      }))
    },
    host_changed: (payload) => {
      const { new_host_id } = payload as { new_host_id: string }
      setState(prev => ({
        ...prev,
        hostId: new_host_id,
        room: prev.room ? { ...prev.room, host_id: new_host_id } : null,
      }))
    },
    claim_submitted: () => {
      setState(prev => ({ ...prev, claimInProgress: true }))
    },
    claim_result: () => {
      setState(prev => ({ ...prev, claimInProgress: false }))
    },
    slot_taken: () => {
      fetchState()
    },
  })

  return { ...state, refetch: fetchState }
}
