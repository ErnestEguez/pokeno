'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  onClose: () => void
}

export function JoinRoomModal({ onClose }: Props) {
  const router = useRouter()
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inviteCode.length !== 8) {
      setError('El código tiene 8 caracteres')
      return
    }
    setError(null)
    setLoading(true)
    try {
      // Primero buscamos la sala por código (necesitaríamos un endpoint de búsqueda,
      // pero como simplificación usamos el lobby desde donde el usuario puede pegar la URL completa.
      // Aquí esperamos que el inviteCode sea de la forma "roomId:code" o que el servidor lo resuelva.
      // Por ahora aceptamos el invite_code y redirigimos al endpoint de búsqueda.
      const res = await fetch('/api/rooms/find-by-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Sala no encontrada')
        return
      }
      router.push(`/rooms/${data.room_id}/lobby`)
      onClose()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Unirse con código</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de sala (8 caracteres)
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toLowerCase())}
                maxLength={8}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="abc12345"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? 'Buscando...' : 'Unirse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
