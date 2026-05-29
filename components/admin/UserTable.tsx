'use client'

import { useState, useEffect } from 'react'
import { EnableToggle } from './EnableToggle'
import { SubscriptionEditor } from './SubscriptionEditor'
import type { UserRow, SubscriptionRow } from '@/types/database'

type UserWithSub = UserRow & { subscriptions: SubscriptionRow | null }

export function UserTable() {
  const [users, setUsers] = useState<UserWithSub[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const PAGE_SIZE = 20

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/users?page=${page}&page_size=${PAGE_SIZE}`)
      .then(r => r.json())
      .then(data => {
        setUsers(data.data ?? [])
        setTotal(data.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page])

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando usuarios...</div>

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Partidas</th>
              <th className="text-left px-4 py-3">Tableros max</th>
              <th className="text-left px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="bg-white hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{user.display_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  {user.subscriptions ? (
                    <SubscriptionEditor
                      userId={user.id}
                      gamesTotal={user.subscriptions.games_total}
                      maxBoards={user.subscriptions.max_boards_per_game}
                    />
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {user.subscriptions?.max_boards_per_game ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <EnableToggle userId={user.id} isEnabled={user.is_enabled} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {total > PAGE_SIZE && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">Anterior</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page} / {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * PAGE_SIZE >= total}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">Siguiente</button>
        </div>
      )}
    </div>
  )
}
