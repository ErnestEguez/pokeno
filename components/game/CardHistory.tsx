import type { CalledCardRow } from '@/types/database'

interface Props {
  cards: CalledCardRow[]
}

const RED_SUITS = new Set(['♥', '♦'])

export function CardHistory({ cards }: Props) {
  const sorted = [...cards].sort((a, b) => b.call_order - a.call_order)

  return (
    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
      {sorted.map((c, idx) => {
        const suit = c.card_code.slice(-1)
        const rank = c.card_code.slice(0, -1)
        const isRed = RED_SUITS.has(suit)
        const isLatest = idx === 0
        return (
          <div
            key={c.id}
            className={`
              flex flex-col items-center justify-between rounded border leading-none
              ${isLatest
                ? 'bg-yellow-50 border-yellow-400 shadow-sm'
                : 'bg-white border-gray-200'
              }
            `}
            style={{ width: 28, height: 38, padding: '2px 3px' }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, color: isRed ? '#dc2626' : '#111827', lineHeight: 1 }}>
              {rank}
            </span>
            <span style={{ fontSize: 12, color: isRed ? '#dc2626' : '#111827', lineHeight: 1 }}>
              {suit}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: isRed ? '#dc2626' : '#111827', lineHeight: 1, transform: 'rotate(180deg)' }}>
              {rank}
            </span>
          </div>
        )
      })}
    </div>
  )
}
