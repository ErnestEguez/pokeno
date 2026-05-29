interface Stats {
  active_users: number
  active_rooms: number
  rooms_this_month: number
}

interface Props {
  stats: Stats
}

export function UsageStatsCard({ stats }: Props) {
  const cards = [
    { label: 'Usuarios activos', value: stats.active_users, color: 'text-blue-600' },
    { label: 'Salas en juego', value: stats.active_rooms, color: 'text-green-600' },
    { label: 'Partidas este mes', value: stats.rooms_this_month, color: 'text-purple-600' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-4xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
