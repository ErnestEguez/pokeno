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
  const [claimSucceeded, setClaimSucceeded] = useState(false)

  function handleOpen() {
    setClaimSucceeded(false)
    // Pausa la cantada inmediatamente al tocar el botón
    fetch(`/api/rooms/${roomId}/claim-intent`, { method: 'POST' }).catch(() => {})
    setShowModal(true)
  }

  function handleClose() {
    // Si no hubo reclamo exitoso, reanudar la cantada
    if (!claimSucceeded) {
      fetch(`/api/rooms/${roomId}/claim-cancel`, { method: 'POST' }).catch(() => {})
    }
    setClaimSucceeded(false)
    setShowModal(false)
  }

  function handleClaimSuccess() {
    // Reclamo válido — el banner lo muestra a todos; el host reanuda con "Continuar"
    setClaimSucceeded(true)
    setShowModal(false)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full bg-orange-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all"
      >
        ¡POKENO!
      </button>

      {showModal && (
        <ClaimVerificationModal
          roomId={roomId}
          slotId={slotId}
          availablePatterns={availablePatterns}
          onClose={handleClose}
          onClaimSuccess={handleClaimSuccess}
        />
      )}
    </>
  )
}
