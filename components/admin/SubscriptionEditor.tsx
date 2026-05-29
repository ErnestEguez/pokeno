'use client'

import { useState } from 'react'

interface Props {
  userId: string
  gamesTotal: number
  maxBoards: number
}

export function SubscriptionEditor({ userId, gamesTotal, maxBoards }: Props) {
  const [games, setGames] = useState(gamesTotal)
  const [boards, setBoards] = useState(maxBoards)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games_total: games, max_boards_per_game: boards }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="number"
        min={0}
        value={games}
        onChange={e => setGames(parseInt(e.target.value, 10) || 0)}
        className="w-20 border border-gray-200 rounded px-2 py-1 text-sm text-center"
        title="Total de partidas"
      />
      <span className="text-xs text-gray-400">partidas</span>
      <input
        type="number"
        min={1}
        max={12}
        value={boards}
        onChange={e => setBoards(parseInt(e.target.value, 10) || 1)}
        className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center"
        title="Tableros máximos"
      />
      <span className="text-xs text-gray-400">tableros</span>
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saved ? '✓' : saving ? '...' : 'Guardar'}
      </button>
    </div>
  )
}
