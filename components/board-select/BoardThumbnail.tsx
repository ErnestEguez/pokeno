import { PlayingCard } from '@/components/game/PlayingCard'
import type { BoardTemplateRow } from '@/types/database'

interface Props {
  template: BoardTemplateRow
  isTaken: boolean      // true cuando llegó al límite de jugadores por tablero
  playersOnBoard: number // cuántos jugadores ya eligieron este tablero
  isSelected: boolean
  onClick: () => void
}

export function BoardThumbnail({ template, isTaken, playersOnBoard, isSelected, onClick }: Props) {
  const grid = template.card_grid as string[][]

  return (
    <button
      onClick={onClick}
      disabled={isTaken}
      className={`
        relative flex-shrink-0 w-52 rounded-2xl border-2 p-3 text-left transition-all
        ${isTaken
          ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
          : isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-300'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer'
        }
      `}
    >
      {playersOnBoard > 0 && (
        <span className={`absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full z-10 font-semibold ${
          isTaken ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'
        }`}>
          {isTaken ? 'Lleno' : `${playersOnBoard} jugador${playersOnBoard > 1 ? 'es' : ''}`}
        </span>
      )}

      <p className="text-sm font-bold text-gray-700 mb-2">{template.display_name}</p>

      {/* Grid 5×5 de mini-naipes */}
      <div className="grid grid-cols-5 gap-0.5">
        {grid.flat().map((card, i) => (
          <PlayingCard key={i} code={card} size="tiny" />
        ))}
      </div>
    </button>
  )
}
