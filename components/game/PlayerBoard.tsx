import { BoardCell } from './BoardCell'
import type { BoardGrid } from '@/types/game'

interface Props {
  grid: BoardGrid
  markedCodes: Set<string>
  onCellClick: (code: string) => void
}

export function PlayerBoard({ grid, markedCodes, onCellClick }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1.5 w-full max-w-sm mx-auto">
      {grid.flat().map((card, i) => (
        <BoardCell
          key={`${card}-${i}`}
          card={card}
          isMarked={markedCodes.has(card)}
          onClick={() => onCellClick(card)}
        />
      ))}
    </div>
  )
}
