'use client'

import { useState } from 'react'
import { ClaimVerificationModal } from './ClaimVerificationModal'

interface Props {
  roomId: string
  slotId: string
  availablePatterns: string[]
}

export function ClaimButton({ roomId, slotId, availablePatterns }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-yellow-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg hover:bg-yellow-600 active:scale-95 transition-all"
      >
        ¡POKENO!
      </button>

      {showModal && (
        <ClaimVerificationModal
          roomId={roomId}
          slotId={slotId}
          availablePatterns={availablePatterns}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
