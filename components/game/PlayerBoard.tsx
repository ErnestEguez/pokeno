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
  const hasColLabels = columnLabels?.some(l => l)
  const hasRowLabels = rowLabels?.some(l => l)

  return (
    <div className="w-full max-w-sm mx-auto">

      {/* Etiquetas de columnas — mismo grid de 5 cols que las cartas */}
      {hasColLabels && (
        <div className="grid grid-cols-5 gap-1.5 mb-1">
          {(columnLabels ?? []).map((label, i) => (
            <div
              key={i}
              className="text-center text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded px-0.5 py-1 leading-tight"
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Grid de cartas — igual que antes, sin tocar el tamaño */}
      {/* Las etiquetas de fila se posicionan absolutamente a la derecha */}
      <div className="relative">
        <div className="grid grid-cols-5 gap-1.5">
          {grid.flat().map((card, i) => (
            <BoardCell
              key={`${card}-${i}`}
              card={card}
              isMarked={markedCodes.has(card)}
              onClick={() => onCellClick(card)}
            />
          ))}
        </div>

        {hasRowLabels && (
          <div
            className="absolute top-0 left-full ml-1.5 flex flex-col gap-1.5"
            style={{ width: '5rem', height: '100%' }}
          >
            {(rowLabels ?? []).map((label, i) => (
              <div key={i} className="flex-1 flex items-center">
                {label ? (
                  <span className="w-full text-center text-xs font-bold text-green-800 bg-green-50 border border-green-200 rounded px-1 py-0.5 leading-tight block">
                    {label}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
