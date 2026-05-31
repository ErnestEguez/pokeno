'use client'

interface Props {
  loading: boolean
  onPlayAgain: () => void
  onClose: () => void
}

export function EndGameModal({ loading, onPlayAgain, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-black text-gray-800">¡Partida terminada!</h2>
        <p className="text-gray-600 font-medium">¿Desean jugar otra partida?</p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border-2 border-gray-300 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
          >
            No, cerrar
          </button>
          <button
            onClick={onPlayAgain}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? '...' : '¡Sí, otra!'}
          </button>
        </div>
      </div>
    </div>
  )
}
