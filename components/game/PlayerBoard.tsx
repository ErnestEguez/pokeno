import { BoardCell } from './BoardCell'
import type { BoardGrid } from '@/types/game'

interface Props {
  grid: BoardGrid
  markedCodes: Set<string>
  onCellClick: (code: string) => void
  columnLabels?: string[]
  rowLabels?: string[]
}

export function PlayerBoard({ grid, markedCodes, onCellClick, columnLabels, rowLabels }: Props) {
  const hasColLabels = columnLabels && columnLabels.some(l => l)
  const hasRowLabels = rowLabels && rowLabels.some(l => l)

  return (
    <div className="w-full max-w-sm mx-auto">

      {/* Etiquetas de columnas (arriba) */}
      {hasColLabels && (
        <div className="flex mb-1" style={{ paddingRight: hasRowLabels ? '6rem' : 0 }}>
          {columnLabels!.map((label, i) => (
            <div
              key={i}
              className="flex-1 text-center text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded px-0.5 py-1 leading-tight mx-0.5"
              style={{ minWidth: 0 }}
            >
              {label || ''}
            </div>
          ))}
        </div>
      )}

      {/* Filas del tablero con etiqueta de fila a la derecha */}
      {grid.map((row, r) => (
        <div key={r} className="flex items-stretch mb-1.5">
          {/* 5 cartas de la fila */}
          {row.map((card, c) => (
            <div key={`${card}-${c}`} className="flex-1 mx-0.5">
              <BoardCell
                card={card}
                isMarked={markedCodes.has(card)}
                onClick={() => onCellClick(card)}
              />
            </div>
          ))}

          {/* Etiqueta de fila */}
          {hasRowLabels && (
            <div className="ml-1.5 flex items-center justify-center w-24 shrink-0">
              {rowLabels![r] ? (
                <span className="text-xs font-bold text-green-800 bg-green-50 border border-green-200 rounded px-1.5 py-1 text-center leading-tight w-full block">
                  {rowLabels![r]}
                </span>
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
