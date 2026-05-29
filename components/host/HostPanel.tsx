'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  roomStatus: string
  onNextCard: () => Promise<boolean>
  onPause: () => Promise<boolean>
  onResume: () => Promise<boolean>
  isLoading: boolean
}

const SPEED_OPTIONS = [
  { label: 'Manual', value: 0 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
]

export function HostPanel({ roomStatus, onNextCard, onPause, onResume, isLoading }: Props) {
  const [autoSpeed, setAutoSpeed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (autoSpeed > 0 && roomStatus === 'playing') {
      intervalRef.current = setInterval(() => onNextCard(), autoSpeed)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoSpeed, roomStatus, onNextCard])

  const isPlaying = roomStatus === 'playing'
  const isPaused  = roomStatus === 'paused'

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-3 z-40">
      <div className="max-w-2xl mx-auto flex flex-wrap items-center gap-3">
        {/* Siguiente carta */}
        <button
          onClick={() => onNextCard()}
          disabled={isLoading || !isPlaying || autoSpeed > 0}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Siguiente carta
        </button>

        {/* Pausa / Reanudar */}
        {isPlaying && (
          <button onClick={onPause} disabled={isLoading}
            className="border border-yellow-500 text-yellow-600 px-4 py-2.5 rounded-xl hover:bg-yellow-50 disabled:opacity-50 transition">
            Pausar
          </button>
        )}
        {isPaused && (
          <button onClick={onResume} disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition">
            Reanudar
          </button>
        )}

        {/* Selector de velocidad automática */}
        <div className="flex items-center gap-1 ml-auto bg-gray-100 rounded-xl p-1">
          {SPEED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setAutoSpeed(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                autoSpeed === opt.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
