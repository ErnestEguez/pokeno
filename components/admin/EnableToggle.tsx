'use client'

import { useState } from 'react'

interface Props {
  userId: string
  isEnabled: boolean
  onToggle?: (newValue: boolean) => void
}

export function EnableToggle({ userId, isEnabled, onToggle }: Props) {
  const [value, setValue] = useState(isEnabled)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    const confirmed = confirm(
      `¿${value ? 'Deshabilitar' : 'Habilitar'} este usuario?`
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/enable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !value }),
      })
      if (res.ok) {
        setValue(!value)
        onToggle?.(!value)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        value ? 'bg-green-500' : 'bg-gray-300'
      } disabled:opacity-50`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
        value ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}
