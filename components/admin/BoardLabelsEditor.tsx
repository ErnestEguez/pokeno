'use client'

import { useState, useEffect, useCallback } from 'react'
import type { BoardLabelRow } from '@/types/database'

const TOTAL_BOARDS = 12
const POSITIONS = [1, 2, 3, 4, 5] as const

type LabelMap = {
  columna: Record<number, { id?: string; texto: string }>
  fila: Record<number, { id?: string; texto: string }>
}

function emptyMap(): LabelMap {
  const col: LabelMap['columna'] = {}
  const row: LabelMap['fila'] = {}
  for (const p of POSITIONS) {
    col[p] = { texto: '' }
    row[p] = { texto: '' }
  }
  return { columna: col, fila: row }
}

export function BoardLabelsEditor() {
  const [boardNumber, setBoardNumber] = useState(1)
  const [labels, setLabels] = useState<LabelMap>(emptyMap())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const loadLabels = useCallback(async (num: number) => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/board-labels?board_number=${num}`)
      const data: BoardLabelRow[] = await res.json()
      const map = emptyMap()
      for (const row of data) {
        map[row.tipo][row.posicion] = { id: row.id, texto: row.texto }
      }
      setLabels(map)
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar etiquetas' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLabels(boardNumber) }, [boardNumber, loadLabels])

  function handleChange(tipo: 'columna' | 'fila', posicion: number, texto: string) {
    setLabels(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], [posicion]: { ...prev[tipo][posicion], texto } },
    }))
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const entries: { tipo: 'columna' | 'fila'; posicion: number; texto: string }[] = []
      for (const p of POSITIONS) {
        entries.push({ tipo: 'columna', posicion: p, texto: labels.columna[p].texto })
        entries.push({ tipo: 'fila', posicion: p, texto: labels.fila[p].texto })
      }

      const results = await Promise.all(
        entries.map(e =>
          fetch('/api/admin/board-labels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board_number: boardNumber, ...e }),
          })
        )
      )

      const hasError = results.some(r => !r.ok)
      if (hasError) {
        setMessage({ type: 'error', text: 'Algunas etiquetas no se guardaron correctamente' })
      } else {
        setMessage({ type: 'ok', text: 'Etiquetas guardadas correctamente' })
        await loadLabels(boardNumber)
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(tipo: 'columna' | 'fila', posicion: number) {
    const entry = labels[tipo][posicion]
    if (!entry.id) {
      handleChange(tipo, posicion, '')
      return
    }
    try {
      await fetch(`/api/admin/board-labels/${entry.id}`, { method: 'DELETE' })
      handleChange(tipo, posicion, '')
      setLabels(prev => ({
        ...prev,
        [tipo]: { ...prev[tipo], [posicion]: { texto: '' } },
      }))
    } catch {
      setMessage({ type: 'error', text: 'Error al eliminar etiqueta' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de tablero */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Tablero:</label>
        <select
          value={boardNumber}
          onChange={e => setBoardNumber(parseInt(e.target.value, 10))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
        >
          {Array.from({ length: TOTAL_BOARDS }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>Tablero {n}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando etiquetas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Columnas */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-1">Etiquetas de columnas</h3>
            <p className="text-xs text-gray-400 mb-4">Aparecen en la parte superior del tablero (izq → der)</p>
            <div className="space-y-3">
              {POSITIONS.map(p => (
                <div key={p} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-gray-500 shrink-0">Col {p}</span>
                  <input
                    type="text"
                    value={labels.columna[p].texto}
                    onChange={e => handleChange('columna', p, e.target.value)}
                    placeholder={`Ej. ESCALERA REAL`}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {labels.columna[p].texto && (
                    <button
                      onClick={() => handleDelete('columna', p)}
                      className="text-gray-300 hover:text-red-400 text-xs transition"
                      title="Borrar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Filas */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-1">Etiquetas de filas</h3>
            <p className="text-xs text-gray-400 mb-4">Aparecen a la derecha del tablero (arriba → abajo)</p>
            <div className="space-y-3">
              {POSITIONS.map(p => (
                <div key={p} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-gray-500 shrink-0">Fila {p}</span>
                  <input
                    type="text"
                    value={labels.fila[p].texto}
                    onChange={e => handleChange('fila', p, e.target.value)}
                    placeholder={`Ej. POKER`}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {labels.fila[p].texto && (
                    <button
                      onClick={() => handleDelete('fila', p)}
                      className="text-gray-300 hover:text-red-400 text-xs transition"
                      title="Borrar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vista previa del layout */}
      {!loading && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-600 mb-3 text-sm">Vista previa — Tablero {boardNumber}</h3>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <td className="w-20" />
                  {POSITIONS.map(p => (
                    <td key={p} className="text-center px-2 py-1 font-semibold text-blue-600 border border-gray-200 bg-blue-50 w-28">
                      {labels.columna[p].texto || <span className="text-gray-300">Col {p}</span>}
                    </td>
                  ))}
                  <td className="w-4" />
                </tr>
              </thead>
              <tbody>
                {POSITIONS.map(p => (
                  <tr key={p}>
                    <td />
                    {POSITIONS.map(c => (
                      <td key={c} className="border border-gray-200 bg-white w-28 h-10 text-center text-gray-300">
                        carta
                      </td>
                    ))}
                    <td className="pl-2 font-semibold text-green-700 whitespace-nowrap">
                      {labels.fila[p].texto || <span className="text-gray-300">Fila {p}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mensaje de resultado */}
      {message && (
        <div className={`text-sm px-4 py-3 rounded-lg ${
          message.type === 'ok'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar etiquetas'}
        </button>
      </div>
    </div>
  )
}
