import type { RoomSlotRow, BoardTemplateRow } from '@/types/database'

type SlotWithTemplate = RoomSlotRow & { board_template: BoardTemplateRow }

interface Props {
  slots: SlotWithTemplate[]
}

export function SlotList({ slots }: Props) {
  if (slots.length === 0) {
    return <p className="text-gray-400 text-sm">Ningún jugador ha elegido tablero aún.</p>
  }

  return (
    <ul className="space-y-1">
      {slots.map(slot => (
        <li key={slot.id} className="flex items-center gap-3 text-sm py-1 border-b border-gray-100">
          <span className="text-gray-500 font-mono text-xs w-6">{slot.position}</span>
          <span className="font-medium text-gray-700">{slot.slot_label ?? 'Sin nombre'}</span>
          <span className="text-gray-400 ml-auto">{slot.board_template?.display_name}</span>
        </li>
      ))}
    </ul>
  )
}
