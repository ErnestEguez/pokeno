'use client'

import { useState } from 'react'

interface Props {
  currentHostId: string
  onTakeHost: (previousHostId: string) => Promise<boolean>
}

export function TakeHostButton({ currentHostId, onTakeHost }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleTake() {
    setLoading(true)
    await onTakeHost(currentHostId)
    setLoading(false)
  }

  return (
    <button
      onClick={handleTake}
      disabled={loading}
      className="w-full border-2 border-orange-500 text-orange-600 font-semibold py-2 rounded-xl hover:bg-orange-50 disabled:opacity-50 transition"
    >
      {loading ? 'Tomando control...' : 'Tomar rol de anfitrión'}
    </button>
  )
}
