'use client'

import { useState } from 'react'
import { ALL_PATTERNS, PATTERN_LABELS } from '@/types/game'
import type { WinningPattern } from '@/types/game'

interface Props {
  roomId: string
  currentPatterns: string[]
  onSaved: (patterns: string[]) => void
}

export function PatternSelector({ roomId, currentPatterns, onSaved }: Props) {
  const [selected, setSelected] = useState<string[]>(currentPatterns)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function toggle(p: string) {
    setSelected(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
    setSaved(false)
  }

  async function handleSave() {
    if (selected.length === 0) { setError('Elige al menos un juego'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winning_patterns: selected }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al guardar'); return }
      onSaved(selected)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">¿Qué jugamos esta ronda?</h3>
        <span className="text-xs text-gray-400">{selected.length} seleccionados</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ALL_PATTERNS.map(p => {
          const isOn = selected.includes(p)
          return (
            <button
              key={p}
              onClick={() => toggle(p)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-left text-sm transition
                ${isOn
                  ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}
              `}
            >
              <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                isOn ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {isOn && <span className="text-white text-xs font-bold">✓</span>}
              </span>
              {PATTERN_LABELS[p as WinningPattern]}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || selected.length === 0}
        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
          saved
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
        }`}
      >
        {saved ? '✓ Reglas guardadas' : saving ? 'Guardando...' : 'Confirmar juegos'}
      </button>
    </div>
  )
}
