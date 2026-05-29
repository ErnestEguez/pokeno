'use client'

import { useEffect, useRef, useState } from 'react'
import { PlayingCard } from './PlayingCard'

interface Props {
  card: string | null
}

export function CalledCardDisplay({ card }: Props) {
  const [displayed, setDisplayed] = useState(card)
  const [animate, setAnimate] = useState(false)
  const prev = useRef(card)

  useEffect(() => {
    if (card !== prev.current) {
      setAnimate(true)
      setDisplayed(card)
      prev.current = card
      const t = setTimeout(() => setAnimate(false), 400)
      return () => clearTimeout(t)
    }
  }, [card])

  if (!displayed) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50"
        style={{ width: 120, height: 168 }}
      >
        <p className="text-xs text-gray-400 text-center px-2">Esperando<br />primera carta</p>
      </div>
    )
  }

  return (
    <div
      className={`transition-all duration-300 ${animate ? 'scale-110 drop-shadow-2xl' : 'scale-100'}`}
    >
      <PlayingCard code={displayed} size="large" />
    </div>
  )
}
