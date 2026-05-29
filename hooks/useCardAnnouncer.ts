'use client'

import { useState, useCallback, useRef } from 'react'

const RANK_ES: Record<string, string> = {
  A: 'As', '2': 'Dos', '3': 'Tres', '4': 'Cuatro', '5': 'Cinco',
  '6': 'Seis', '7': 'Siete', '8': 'Ocho', '9': 'Nueve', '10': 'Diez',
  J: 'Jota', Q: 'Reina', K: 'Rey',
}
const SUIT_ES: Record<string, string> = {
  '♠': 'de Picas', '♥': 'de Corazones', '♦': 'de Diamantes', '♣': 'de Tréboles',
}

export function useCardAnnouncer() {
  const [enabled, setEnabled] = useState(false)
  const lastAnnounced = useRef<string | null>(null)

  const announce = useCallback((code: string | null) => {
    if (!enabled || !code || code === lastAnnounced.current) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    lastAnnounced.current = code
    const suit = code.slice(-1)
    const rank = code.slice(0, -1)
    const text = `${RANK_ES[rank] ?? rank} ${SUIT_ES[suit] ?? suit}`

    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    u.rate = 0.9
    u.pitch = 1.1
    window.speechSynthesis.speak(u)
  }, [enabled])

  const toggle = useCallback(() => setEnabled(v => !v), [])

  return { enabled, toggle, announce }
}
