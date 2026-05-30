'use client'

import { PATTERN_LABELS } from '@/types/game'
import type { WinningPattern } from '@/types/game'
import type { RoomWin } from '@/hooks/useRoom'

interface Props {
  winners: RoomWin[]
}

export function WinnersList({ winners }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        🏆 Ganadores
      </p>

      {winners.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Sin ganadores aún</p>
      ) : (
        <div className="space-y-1.5">
          {winners.map((w) => (
            <div
              key={w.id}
              className="bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-2"
            >
              <p className="text-xs font-bold text-gray-800 truncate">
                {w.winner_label}
              </p>
              <p className="text-xs text-yellow-700 truncate">
                {PATTERN_LABELS[w.pattern as WinningPattern] ?? w.pattern}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
