import Link from 'next/link'
import type { RoomRow } from '@/types/database'
import { RestartButton } from './RestartButton'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  lobby:    { label: 'Lobby',    color: 'bg-yellow-100 text-yellow-700' },
  playing:  { label: 'Jugando',  color: 'bg-green-100 text-green-700'  },
  paused:   { label: 'Pausada',  color: 'bg-blue-100 text-blue-700'    },
  finished: { label: 'Terminada',color: 'bg-gray-100 text-gray-500'    },
}

interface Props {
  room: RoomRow
}

export function RoomCard({ room }: Props) {
  const { label, color } = STATUS_LABELS[room.status] ?? STATUS_LABELS.lobby
  const target = room.status === 'lobby' ? `/rooms/${room.id}/lobby` : `/rooms/${room.id}/play`

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-semibold text-gray-800 truncate">{room.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Código:{' '}
          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded select-all">
            {room.invite_code}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {room.status !== 'lobby' && <RestartButton roomId={room.id} />}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{label}</span>
        <Link
          href={target}
          className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
        >
          Entrar
        </Link>
      </div>
    </div>
  )
}
