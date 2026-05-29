'use client'

import { useState } from 'react'

interface Props {
  onClose: (newRoom?: { name: string; invite_code: string }) => void
}

export function AdminRoomModal({ onClose }: Props) {
  const [name, setName] = useState('')
  const [maxBoards, setMaxBoards] = useState(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ name: string; invite_code: string } | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, max_boards: maxBoards, winning_patterns: [] }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al crear sala'); return }
      setCreated({ name: data.name, invite_code: data.invite_code })
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          {!created ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva sala</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la sala</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pokeno familiar — tarde del sábado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de tableros (jugadores)
                  </label>
                  <input
                    type="number" min={1} max={24} value={maxBoards}
                    onChange={e => setMaxBoards(parseInt(e.target.value, 10))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Máximo recomendado: 24 (hasta 2 jugadores por tablero)</p>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => onClose()}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Creando...' : 'Crear sala'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            // Sala creada → mostrar código para enviar a jugadores
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h2 className="text-xl font-bold text-gray-800">Sala creada</h2>
              <p className="text-gray-600 font-medium">{created.name}</p>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5">
                <p className="text-sm text-blue-700 font-medium mb-2">Código para jugadores:</p>
                <p className="text-4xl font-black font-mono text-blue-800 tracking-widest select-all">
                  {created.invite_code}
                </p>
                <p className="text-xs text-blue-500 mt-2">Haz clic para seleccionar y copiar</p>
              </div>

              <p className="text-sm text-gray-500">
                Comparte este código con los jugadores para que puedan entrar a la sala.
              </p>

              <button
                onClick={() => onClose(created)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
              >
                Listo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
