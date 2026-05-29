'use client'

import { useState } from 'react'
import { UsageStatsCard } from '@/components/admin/UsageStatsCard'
import { AdminRoomModal } from '@/components/admin/AdminRoomModal'
import { AdminRoomsList } from '@/components/admin/AdminRoomsList'

// Dashboard del admin: stats + gestión de salas
export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [stats] = useState({ active_users: 0, active_rooms: 0, rooms_this_month: 0 })

  function handleRoomCreated() {
    setShowModal(false)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Panel de administración</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          + Nueva sala
        </button>
      </div>

      <UsageStatsCard stats={stats} />

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Mis salas</h2>
        <AdminRoomsList key={refreshKey} />
      </section>

      {showModal && (
        <AdminRoomModal onClose={(room) => {
          if (room) handleRoomCreated()
          else setShowModal(false)
        }} />
      )}
    </div>
  )
}
