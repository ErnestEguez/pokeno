import { BoardLabelsEditor } from '@/components/admin/BoardLabelsEditor'

export default function BoardLabelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Etiquetas de tableros</h1>
        <p className="text-sm text-gray-500 mt-1">
          Asigna los nombres de juego a cada columna (arriba) y fila (derecha) de cada tablero.
          El jugador verá estas etiquetas durante la partida para saber qué cantar al ganar.
        </p>
      </div>
      <BoardLabelsEditor />
    </div>
  )
}
