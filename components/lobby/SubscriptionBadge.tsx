interface Props {
  gamesTotal: number
  gamesUsed: number
}

export function SubscriptionBadge({ gamesTotal, gamesUsed }: Props) {
  const available = gamesTotal - gamesUsed
  const color = available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
      {available} partida{available !== 1 ? 's' : ''} disponible{available !== 1 ? 's' : ''}
    </span>
  )
}
