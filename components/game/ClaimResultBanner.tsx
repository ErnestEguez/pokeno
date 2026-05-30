'use client'

import { PATTERN_LABELS } from '@/types/game'
import type { ClaimResultPayload, WinningPattern } from '@/types/game'

interface Props {
  result: ClaimResultPayload
  isHost: boolean
  onContinue: () => void
}

export function ClaimResultBanner({ result, isHost, onContinue }: Props) {
  const patternLabel = PATTERN_LABELS[result.pattern as WinningPattern] ?? result.pattern
  const remaining = result.remaining_patterns ?? []

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
        <div className="text-6xl">{result.game_over ? '🏆' : '🎉'}</div>

        <div>
          <h2 className="text-2xl font-black text-gray-800">
            ¡{result.winner_label ?? 'Alguien'} ganó!
          </h2>
          <p className="text-gray-500 mt-1">
            Patrón: <span className="font-semibold text-gray-700">{patternLabel}</span>
          </p>
        </div>

        {result.game_over ? (
          <p className="text-green-700 font-bold text-lg">¡Ronda terminada!</p>
        ) : (
          remaining.length > 0 && (
            <p className="text-sm text-gray-500">
              Faltan:{' '}
              {remaining
                .map(p => PATTERN_LABELS[p as WinningPattern] ?? p)
                .join(', ')}
            </p>
          )
        )}

        {result.game_over ? (
          <button
            onClick={onContinue}
            className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        ) : isHost ? (
          <button
            onClick={onContinue}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-black text-lg hover:bg-green-700 transition"
          >
            ▶ Continuar cantada
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Esperando al anfitrión para continuar...</p>
            <button
              onClick={onContinue}
              className="w-full border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
