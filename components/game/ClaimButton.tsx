'use client'

import { useState } from 'react'
import { ClaimVerificationModal } from './ClaimVerificationModal'

interface Props {
  roomId: string
  slotId: string
  availablePatterns: string[]
  markedCodes: Set<string>
}

export function ClaimButton({ roomId, slotId, availablePatterns, markedCodes }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [claimSucceeded, setClaimSucceeded] = useState(false)
  // Rastrear si ESTE cliente fue quien pausó la sala
  const [pausedByClaim, setPausedByClaim] = useState(false)

  function handleOpen() {
    setClaimSucceeded(false)
    setPausedByClaim(false)
    // Pausar la sala en DB — la cantada se detiene en el próximo poll (~1s)
    fetch(`/api/rooms/${roomId}/claim-intent`, { method: 'POST' })
      .then(r => r.json())
      .then(data => setPausedByClaim(data.paused === true))
      .catch(() => {})
    setShowModal(true)
  }

  function handleClose() {
    // Solo reanudar si fuimos nosotros quienes pausamos (no era una pausa manual previa)
    if (!claimSucceeded && pausedByClaim) {
      fetch(`/api/rooms/${roomId}/claim-cancel`, { method: 'POST' }).catch(() => {})
    }
    setPausedByClaim(false)
    setClaimSucceeded(false)
    setShowModal(false)
  }

  function handleClaimSuccess() {
    // Reclamo válido — el host reanuda manualmente con "Continuar cantada" o "Reanudar"
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
          markedCodes={markedCodes}
          onClose={handleClose}
          onClaimSuccess={handleClaimSuccess}
        />
      )}
    </>
  )
}
