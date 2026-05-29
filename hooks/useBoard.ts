'use client'

import { useState, useCallback } from 'react'
import type { BoardGrid } from '@/types/game'
import { createClient } from '@/lib/supabase/client'

export function useBoard(slotId: string, roomId: string, boardGrid: BoardGrid | null) {
  const [markedCodes, setMarkedCodes] = useState<Set<string>>(new Set())

  // Toggle: marca si no está marcada, desmarca si ya lo está
  const markCell = useCallback(async (code: string) => {
    if (!slotId) return

    const alreadyMarked = markedCodes.has(code)
    const supabase = createClient()

    if (alreadyMarked) {
      // Desmarcar: eliminar de DB y del estado local
      setMarkedCodes(prev => {
        const next = new Set(prev)
        next.delete(code)
        return next
      })
      await supabase
        .from('marked_cells')
        .delete()
        .eq('slot_id', slotId)
        .eq('card_code', code)
    } else {
      // Marcar: insertar en DB y en estado local
      setMarkedCodes(prev => new Set([...prev, code]))
      await supabase
        .from('marked_cells')
        .upsert({ slot_id: slotId, card_code: code, is_marked: true })
    }
  }, [slotId, markedCodes])

  const isMarked = useCallback((code: string) => markedCodes.has(code), [markedCodes])

  return { markedCodes, isMarked, markCell }
}
