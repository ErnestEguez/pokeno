'use client'

import { useState } from 'react'
import { PATTERN_LABELS, ALL_PATTERNS } from '@/types/game'
import type { WinningPattern } from '@/types/game'

interface Props {
  roomId: string
  slotId: string
  availablePatterns: string[]
  onClose: () => void
}

export function ClaimVerificationModal({ roomId, slotId, availablePatterns, onClose }: Props) {
  const [selectedPattern, setSelectedPattern] = useState<string>(availablePatterns[0] ?? '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)

  async function handleClaim() {
    if (!selectedPattern) return
    setLoading(true)
    try {
      const res = await fetch(`/api/rooms/${roomId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slotId, pattern: selectedPattern }),
      })
      const data = await res.json()
      if (data.valid) {
        const remaining = (data.remaining_patterns ?? []) as string[]
        const msg = remaining.length > 0
          ? `¡${PATTERN_LABELS[selectedPattern as WinningPattern]} ganado! Continúan: ${remaining.map((p: string) => PATTERN_LABELS[p as WinningPattern] ?? p).join(', ')}`
          : `¡Pokeno! Ganaste ${PATTERN_LABELS[selectedPattern as WinningPattern]}. ¡Ronda terminada!`
        setResult({ valid: true, message: msg })
      } else {
        setResult({ valid: false, message: 'El patrón no está completo aún. ¡Sigue marcando!' })
      }
    } catch {
      setResult({ valid: false, message: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 space-y-4">
          {!result ? (
            <>
              <h2 className="text-xl font-bold text-center">¿Pokeno?</h2>
              <p className="text-sm text-gray-600 text-center">Selecciona el patrón que completaste</p>

              <div className="space-y-2">
                {availablePatterns.map(p => (
                  <label key={p} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="pattern"
                      value={p}
                      checked={selectedPattern === p}
                      onChange={() => setSelectedPattern(p)}
                    />
                    <span className="text-sm font-medium">{PATTERN_LABELS[p as WinningPattern] ?? p}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button
                  onClick={handleClaim}
                  disabled={loading || !selectedPattern}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50"
                >
                  {loading ? 'Verificando...' : '¡Confirmar Pokeno!'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className={`text-5xl ${result.valid ? '🎉' : '😢'}`}>
                {result.valid ? '🎉' : '😢'}
              </div>
              <p className={`text-lg font-semibold ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
