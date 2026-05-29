'use client'

import { FaceCard } from './FaceCard'

const RED = '#cc0000'
const BLACK = '#111111'
const RED_SUITS = new Set(['♥', '♦'])
const FACE_RANKS = new Set(['J', 'Q', 'K'])

type Pip = { top: number; left: number; flip: boolean }

const PIPS: Record<string, Pip[]> = {
  A:  [{ top: 50, left: 50, flip: false }],
  '2':  [{ top: 22, left: 50, flip: false }, { top: 78, left: 50, flip: true }],
  '3':  [{ top: 20, left: 50, flip: false }, { top: 50, left: 50, flip: false }, { top: 80, left: 50, flip: true }],
  '4':  [{ top: 22, left: 30, flip: false }, { top: 22, left: 70, flip: false }, { top: 78, left: 30, flip: true }, { top: 78, left: 70, flip: true }],
  '5':  [{ top: 22, left: 30, flip: false }, { top: 22, left: 70, flip: false }, { top: 50, left: 50, flip: false }, { top: 78, left: 30, flip: true }, { top: 78, left: 70, flip: true }],
  '6':  [{ top: 20, left: 30, flip: false }, { top: 20, left: 70, flip: false }, { top: 50, left: 30, flip: false }, { top: 50, left: 70, flip: false }, { top: 80, left: 30, flip: true }, { top: 80, left: 70, flip: true }],
  '7':  [{ top: 18, left: 30, flip: false }, { top: 18, left: 70, flip: false }, { top: 36, left: 50, flip: false }, { top: 52, left: 30, flip: false }, { top: 52, left: 70, flip: false }, { top: 80, left: 30, flip: true }, { top: 80, left: 70, flip: true }],
  '8':  [{ top: 18, left: 30, flip: false }, { top: 18, left: 70, flip: false }, { top: 36, left: 50, flip: false }, { top: 52, left: 30, flip: false }, { top: 52, left: 70, flip: false }, { top: 64, left: 50, flip: true }, { top: 82, left: 30, flip: true }, { top: 82, left: 70, flip: true }],
  '9':  [{ top: 18, left: 30, flip: false }, { top: 18, left: 70, flip: false }, { top: 36, left: 30, flip: false }, { top: 36, left: 70, flip: false }, { top: 50, left: 50, flip: false }, { top: 64, left: 30, flip: true }, { top: 64, left: 70, flip: true }, { top: 82, left: 30, flip: true }, { top: 82, left: 70, flip: true }],
  '10': [{ top: 16, left: 30, flip: false }, { top: 16, left: 70, flip: false }, { top: 31, left: 50, flip: false }, { top: 44, left: 30, flip: false }, { top: 44, left: 70, flip: false }, { top: 56, left: 30, flip: true }, { top: 56, left: 70, flip: true }, { top: 69, left: 50, flip: true }, { top: 84, left: 30, flip: true }, { top: 84, left: 70, flip: true }],
}

function Corner({ rank, suit, isRed, flip, sz }: {
  rank: string; suit: string; isRed: boolean; flip: boolean; sz: number
}) {
  const color = isRed ? RED : BLACK
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, transform: flip ? 'rotate(180deg)' : 'none' }}>
      <span style={{ fontSize: sz * 1.1, fontWeight: 900, color, fontFamily: 'sans-serif' }}>{rank}</span>
      <span style={{ fontSize: sz, color, fontFamily: 'sans-serif' }}>{suit}</span>
    </div>
  )
}

interface Props {
  code:      string
  size?:     'tiny' | 'small' | 'large'
  isMarked?: boolean
  onClick?:  () => void
  disabled?: boolean
}

export function PlayingCard({ code, size = 'small', isMarked = false, onClick, disabled }: Props) {
  const suit   = code.slice(-1)
  const rank   = code.slice(0, -1)
  const isRed  = RED_SUITS.has(suit)
  const color  = isRed ? RED : BLACK
  const pips   = PIPS[rank]
  const isFace = FACE_RANKS.has(rank)

  // ── TINY ──────────────────────────────────────────────────────────────────
  if (size === 'tiny') {
    return (
      <div style={{
        width: 28, height: 38,
        background: isMarked ? '#d1fae5' : 'white',
        border: `1.5px solid ${isMarked ? '#10b981' : '#d1d5db'}`,
        borderRadius: 4,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '2px 1px', position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <Corner rank={rank} suit={suit} isRed={isRed} flip={false} sz={7} />
        <Corner rank={rank} suit={suit} isRed={isRed} flip={true}  sz={7} />
        {isMarked && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16, color: '#047857', fontWeight: 900 }}>✓</span>
          </div>
        )}
      </div>
    )
  }

  // ── SMALL (tablero 5×5) ───────────────────────────────────────────────────
  if (size === 'small') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ all: 'unset', display: 'block', width: '100%', cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <div style={{
          position: 'relative', width: '100%', paddingBottom: '140%',
          background: isMarked ? '#ecfdf5' : 'white',
          border: `2px solid ${isMarked ? '#10b981' : '#9ca3af'}`,
          borderRadius: 8,
          boxShadow: isMarked ? 'inset 0 2px 4px rgba(16,185,129,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '4%' }}>
            <div style={{ flexShrink: 0 }}>
              <Corner rank={rank} suit={suit} isRed={isRed} flip={false} sz={11} />
            </div>

            <div style={{ flex: 1, position: 'relative', margin: '2% 0', overflow: 'hidden' }}>
              {isFace ? (
                <FaceCard rank={rank as 'J'|'Q'|'K'} suit={suit} isRed={isRed} width="100%" height="100%" />
              ) : pips ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {pips.map((p, i) => (
                    <span key={i} style={{
                      position: 'absolute',
                      top: `${p.top}%`, left: `${p.left}%`,
                      transform: `translate(-50%,-50%)${p.flip ? ' rotate(180deg)' : ''}`,
                      fontSize: rank === 'A' ? '220%' : '120%',
                      color, lineHeight: 1, userSelect: 'none',
                    }}>{suit}</span>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
              <Corner rank={rank} suit={suit} isRed={isRed} flip={true} sz={11} />
            </div>
          </div>

          {isMarked && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(16,185,129,0.5)' }}>
                <span style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>✓</span>
              </div>
            </div>
          )}
        </div>
      </button>
    )
  }

  // ── LARGE (carta cantada) ──────────────────────────────────────────────────
  const W = 150, H = 210

  return (
    <div style={{
      width: W, height: H,
      background: 'white',
      border: `2px solid ${isRed ? '#fca5a5' : '#9ca3af'}`,
      borderRadius: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      position: 'relative', overflow: 'hidden', userSelect: 'none',
    }}>
      <div style={{ position: 'absolute', inset: 5, border: `1px solid ${isRed ? '#fecaca' : '#e5e7eb'}`, borderRadius: 10, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: 8, left: 10 }}>
        <Corner rank={rank} suit={suit} isRed={isRed} flip={false} sz={18} />
      </div>

      {/* Centro: figura o pips */}
      <div style={{ position: 'absolute', top: 52, left: 10, right: 10, bottom: 52, overflow: 'hidden' }}>
        {isFace ? (
          <FaceCard rank={rank as 'J'|'Q'|'K'} suit={suit} isRed={isRed} width="100%" height="100%" />
        ) : pips ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {pips.map((p, i) => (
              <span key={i} style={{
                position: 'absolute',
                top: `${p.top}%`, left: `${p.left}%`,
                transform: `translate(-50%,-50%)${p.flip ? ' rotate(180deg)' : ''}`,
                fontSize: rank === 'A' ? 64 : 26,
                color, lineHeight: 1,
              }}>{suit}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ position: 'absolute', bottom: 8, right: 10 }}>
        <Corner rank={rank} suit={suit} isRed={isRed} flip={true} sz={18} />
      </div>
    </div>
  )
}
