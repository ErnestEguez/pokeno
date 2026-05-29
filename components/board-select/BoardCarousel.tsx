'use client'

import { useRef, useState, useEffect } from 'react'
import { BoardThumbnail } from './BoardThumbnail'
import { useRealtime } from '@/hooks/useRealtime'
import type { BoardTemplateRow } from '@/types/database'

const MAX_PER_BOARD = 2 // debe coincidir con el API

interface Props {
  roomId: string
  templates: BoardTemplateRow[]
  takenBoardIds: string[]  // array con repeticiones: ['id1','id1','id2'] = id1 tiene 2 jugadores
  onSelect: (templateId: string) => void
}

export function BoardCarousel({ roomId, templates, takenBoardIds, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, scrollLeft: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [localTakenIds, setLocalTakenIds] = useState<string[]>(takenBoardIds)

  useEffect(() => { setLocalTakenIds(takenBoardIds) }, [takenBoardIds])

  useRealtime(roomId, {
    slot_taken: (payload) => {
      const { board_template_id } = payload as { board_template_id: string }
      if (board_template_id) {
        setLocalTakenIds(prev => [...prev, board_template_id])
      }
    },
  })

  // Cuántos jugadores tienen cada tablero
  function countForBoard(templateId: string): number {
    return localTakenIds.filter(id => id === templateId).length
  }

  function isFull(templateId: string): boolean {
    return countForBoard(templateId) >= MAX_PER_BOARD
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return
    setIsDragging(true)
    dragStart.current = { x: e.pageX, scrollLeft: scrollRef.current.scrollLeft }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - (e.pageX - dragStart.current.x)
  }

  function onMouseUp() { setIsDragging(false) }

  function handleSelect(templateId: string) {
    if (isFull(templateId)) return
    setSelectedId(templateId)
    onSelect(templateId)
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto pb-3 cursor-grab active:cursor-grabbing select-none"
      style={{ scrollbarWidth: 'thin' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {templates.map(template => (
        <BoardThumbnail
          key={template.id}
          template={template}
          isTaken={isFull(template.id)}
          playersOnBoard={countForBoard(template.id)}
          isSelected={selectedId === template.id}
          onClick={() => handleSelect(template.id)}
        />
      ))}
    </div>
  )
}
