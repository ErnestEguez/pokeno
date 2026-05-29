'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_PATTERNS, PATTERN_LABELS } from '@/types/game'

interface Props {
  onClose: () => void
}

export function CreateRoomModal({ onClose }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(['five_in_line'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function togglePattern(pattern: string) {
    setSelectedPatterns(prev =>
      prev.includes(pattern) ? prev.filter(p => p !== pattern) : [...prev, pattern]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedPatterns.length === 0) {
      setError('Selecciona al menos un patrón ganador')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, winning_patterns: selectedPatterns }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al crear la sala')
        return
      }
      router.push(`/rooms/${data.id}/lobby`)
      onClose()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva sala</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la sala</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pokeno familiar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patrones ganadores
                <span className="ml-1 text-xs text-red-500 font-normal">* elige al menos uno</span>
              </label>
              <div className="grid grid-cols-2 gap-2 border border-blue-200 rounded-xl p-3 bg-blue-50">
                {ALL_PATTERNS.map(pattern => (
                  <label key={pattern} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedPatterns.includes(pattern)}
                      onChange={() => togglePattern(pattern)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-blue-600">
                      {PATTERN_LABELS[pattern]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Creando...' : 'Crear sala'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
