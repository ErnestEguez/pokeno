import type { RoomRow } from '@/types/database'

interface Props {
  rooms: RoomRow[]
}

export function ActiveRoomsPanel({ rooms }: Props) {
  if (rooms.length === 0) {
    return <p className="text-gray-400 text-sm">No hay salas activas en este momento.</p>
  }

  return (
    <ul className="space-y-2">
      {rooms.map(room => (
        <li key={room.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-2">
          <span className="font-medium text-gray-700">{room.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            room.status === 'playing' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {room.status === 'playing' ? 'Jugando' : 'Pausada'}
          </span>
        </li>
      ))}
    </ul>
  )
}
