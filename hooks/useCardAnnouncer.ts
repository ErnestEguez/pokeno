'use client'

import { useState, useCallback, useRef } from 'react'
import { PATTERN_LABELS } from '@/types/game'
import type { WinningPattern } from '@/types/game'

const RANK_ES: Record<string, string> = {
  A: 'As', '2': 'Dos', '3': 'Tres', '4': 'Cuatro', '5': 'Cinco',
  '6': 'Seis', '7': 'Siete', '8': 'Ocho', '9': 'Nueve', '10': 'Diez',
  J: 'Jota', Q: 'Reina', K: 'Rey',
}
const SUIT_ES: Record<string, string> = {
  '♠': 'de Picas', '♥': 'de Corazones', '♦': 'de Diamantes', '♣': 'de Tréboles',
}

function speak(text: string, rate = 0.9, pitch = 1.1) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-ES'
  u.rate = rate
  u.pitch = pitch
  window.speechSynthesis.speak(u)
}

export function useCardAnnouncer() {
  const [enabled, setEnabled] = useState(false)
  const lastAnnounced = useRef<string | null>(null)

  const announce = useCallback((code: string | null) => {
    if (!enabled || !code || code === lastAnnounced.current) return
    lastAnnounced.current = code
    const suit = code.slice(-1)
    const rank = code.slice(0, -1)
    speak(`${RANK_ES[rank] ?? rank} ${SUIT_ES[suit] ?? suit}`)
  }, [enabled])

  // Siempre anuncia al ganador, sin importar si el audio está activado
  const announceWinner = useCallback((winnerLabel: string, pattern: string) => {
    const patternName = PATTERN_LABELS[pattern as WinningPattern] ?? pattern
    // Tomar solo el primer nombre/apellido del email si es un email
    const name = winnerLabel.includes('@')
      ? winnerLabel.split('@')[0]
      : winnerLabel
    speak(`${name} ganó ${patternName}`, 0.85, 1.2)
  }, [])

  const toggle = useCallback(() => setEnabled(v => !v), [])

  return { enabled, toggle, announce, announceWinner }
}
