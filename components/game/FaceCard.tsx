'use client'

// Arte de naipe tradicional para J, Q, K — estilo Bicycle clásico
// Diseño dual (arriba/abajo espejado como el naipe físico)

interface Props {
  rank: 'J' | 'Q' | 'K'
  suit: string
  isRed: boolean
  width?: number | string
  height?: number | string
  style?: React.CSSProperties
}

const GOLD = '#d4a010'
const RED_C = '#cc1100'
const BLUE = '#1144aa'
const SKIN = '#f5deb3'
const HAIR = '#4a2800'
const WHITE = '#ffffff'
const SILVER = '#b0b8c8'

// ── Cara en perfil ────────────────────────────────────────────────────────
function Face({ cx, cy, beard, queenHair }: {
  cx: number; cy: number; beard?: boolean; queenHair?: boolean
}) {
  return (
    <g>
      {queenHair ? (
        // Cabello largo de la reina
        <path d={`M${cx-14},${cy-8} Q${cx-18},${cy+10} ${cx-14},${cy+22} Q${cx},${cy+28} ${cx+14},${cy+22} Q${cx+18},${cy+10} ${cx+14},${cy-8} Q${cx},${cy-16} ${cx-14},${cy-8}`}
          fill={GOLD} />
      ) : (
        // Cabello de rey/jota
        <ellipse cx={cx} cy={cy - 10} rx={14} ry={8} fill={HAIR} />
      )}
      {/* Cara */}
      <ellipse cx={cx} cy={cy} rx={13} ry={15} fill={SKIN} stroke={HAIR} strokeWidth="0.5" />
      {/* Ojos */}
      <ellipse cx={cx - 4} cy={cy - 3} rx={2.5} ry={2} fill={WHITE} />
      <circle cx={cx - 4} cy={cy - 3} r={1.2} fill="#334" />
      <ellipse cx={cx + 4} cy={cy - 3} rx={2.5} ry={2} fill={WHITE} />
      <circle cx={cx + 4} cy={cy - 3} r={1.2} fill="#334" />
      {/* Cejas */}
      <path d={`M${cx-7},${cy-7} Q${cx-4},${cy-9} ${cx-1},${cy-7}`} stroke={HAIR} strokeWidth="1.2" fill="none" />
      <path d={`M${cx+1},${cy-7} Q${cx+4},${cy-9} ${cx+7},${cy-7}`} stroke={HAIR} strokeWidth="1.2" fill="none" />
      {/* Nariz */}
      <path d={`M${cx},${cy} Q${cx+3},${cy+4} ${cx},${cy+6}`} stroke="#c8a070" strokeWidth="1" fill="none" />
      {/* Boca */}
      <path d={`M${cx-5},${cy+9} Q${cx},${cy+12} ${cx+5},${cy+9}`} stroke="#aa6644" strokeWidth="1.2" fill="none" />
      {beard && (
        <>
          <path d={`M${cx-9},${cy+11} Q${cx-6},${cy+15} ${cx},${cy+16} Q${cx+6},${cy+15} ${cx+9},${cy+11}`}
            fill={HAIR} opacity="0.85" />
          <path d={`M${cx-8},${cy+9} Q${cx-4},${cy+8} ${cx},${cy+10} Q${cx+4},${cy+8} ${cx+8},${cy+9}`}
            stroke={HAIR} strokeWidth="1.5" fill="none" />
        </>
      )}
    </g>
  )
}

// ── Corona de Rey ──────────────────────────────────────────────────────────
function KingCrown({ cx, y }: { cx: number; y: number }) {
  return (
    <g>
      <polygon
        points={`${cx-22},${y+18} ${cx-22},${y} ${cx-12},${y+8} ${cx},${y-8} ${cx+12},${y+8} ${cx+22},${y} ${cx+22},${y+18}`}
        fill={GOLD} stroke="#a07810" strokeWidth="1.2" />
      <rect x={cx - 22} y={y + 15} width={44} height={10} rx="2" fill={GOLD} stroke="#a07810" strokeWidth="1" />
      {/* Gemas en la corona */}
      <circle cx={cx}      cy={y + 2} r={4} fill={RED_C} />
      <circle cx={cx - 12} cy={y + 12} r={3} fill="#3366ff"  />
      <circle cx={cx + 12} cy={y + 12} r={3} fill="#22aa44"  />
      <circle cx={cx - 20} cy={y + 18} r={2} fill={RED_C}   />
      <circle cx={cx + 20} cy={y + 18} r={2} fill={RED_C}   />
    </g>
  )
}

// ── Corona de Reina ────────────────────────────────────────────────────────
function QueenCrown({ cx, y }: { cx: number; y: number }) {
  return (
    <g>
      <polygon
        points={`${cx-18},${y+15} ${cx-18},${y+2} ${cx-8},${y+10} ${cx},${y-4} ${cx+8},${y+10} ${cx+18},${y+2} ${cx+18},${y+15}`}
        fill={GOLD} stroke="#a07810" strokeWidth="1" />
      <rect x={cx-18} y={y+12} width={36} height={8} rx="2" fill={GOLD} stroke="#a07810" strokeWidth="1" />
      <circle cx={cx} cy={y+3} r={3} fill={RED_C}   />
      <circle cx={cx-10} cy={y+10} r={2} fill="#3366ff" />
      <circle cx={cx+10} cy={y+10} r={2} fill="#22aa44" />
    </g>
  )
}

// ── Gorro del Jota ────────────────────────────────────────────────────────
function JackHat({ cx, y }: { cx: number; y: number }) {
  return (
    <g>
      {/* Cuerpo del gorro */}
      <path d={`M${cx-18},${y+22} Q${cx-16},${y} ${cx},${y-12} Q${cx+16},${y} ${cx+18},${y+22} Z`}
        fill={RED_C} stroke="#990000" strokeWidth="1" />
      {/* Ala */}
      <ellipse cx={cx} cy={y+22} rx={22} ry={5} fill={GOLD} stroke="#a07810" strokeWidth="1" />
      {/* Pluma */}
      <path d={`M${cx+14},${y+8} Q${cx+22},${y-5} ${cx+18},${y-20}`}
        stroke="#22aa44" strokeWidth="4" fill="none" />
      <path d={`M${cx+16},${y+4} Q${cx+24},${y-8} ${cx+20},${y-18}`}
        stroke="#66cc44" strokeWidth="2" fill="none" />
    </g>
  )
}

// ── Cuerpo decorativo (patrón geométrico tradicional) ─────────────────────
function TraditionalBody({ x, y, w, h, isRed, rank }: {
  x: number; y: number; w: number; h: number; isRed: boolean; rank: string
}) {
  const mx = x + w / 2
  const c1 = isRed ? RED_C : BLUE
  const c2 = GOLD
  return (
    <g>
      {/* Fondo dorado */}
      <rect x={x} y={y} width={w} height={h} fill={GOLD} />

      {/* Patrón de rombos tipo chevron */}
      {[0, 1, 2, 3].map(i => (
        <polygon key={i}
          points={`${mx},${y + i * (h / 4)} ${x + 4},${y + i * (h / 4) + h / 8} ${mx},${y + (i + 1) * (h / 4)} ${x + w - 4},${y + i * (h / 4) + h / 8}`}
          fill={i % 2 === 0 ? c1 : c2}
          opacity="0.7"
        />
      ))}

      {/* Ornamento circular central */}
      <circle cx={mx} cy={y + h * 0.45} r={h * 0.18} fill={BLUE} opacity="0.8" />
      <circle cx={mx} cy={y + h * 0.45} r={h * 0.11} fill={GOLD} />
      <circle cx={mx} cy={y + h * 0.45} r={h * 0.06} fill={c1} />

      {/* Franja horizontal decorativa */}
      <rect x={x + 6} y={y + h * 0.28} width={w - 12} height={h * 0.06} rx="2"
        fill={WHITE} opacity="0.6" />
      <rect x={x + 6} y={y + h * 0.60} width={w - 12} height={h * 0.06} rx="2"
        fill={WHITE} opacity="0.6" />

      {/* Rombos laterales */}
      {[0.2, 0.5, 0.8].map(t => (
        <polygon key={t}
          points={`${x + 10},${y + h * t} ${x + 3},${y + h * (t + 0.07)} ${x + 10},${y + h * (t + 0.14)} ${x + 17},${y + h * (t + 0.07)}`}
          fill={t === 0.5 ? c1 : c2} stroke="#a07810" strokeWidth="0.5"
        />
      ))}
      {[0.2, 0.5, 0.8].map(t => (
        <polygon key={t}
          points={`${x + w - 10},${y + h * t} ${x + w - 3},${y + h * (t + 0.07)} ${x + w - 10},${y + h * (t + 0.14)} ${x + w - 17},${y + h * (t + 0.07)}`}
          fill={t === 0.5 ? c1 : c2} stroke="#a07810" strokeWidth="0.5"
        />
      ))}
    </g>
  )
}

// ── MEDIA CARTA (top-half, se espeja para la parte inferior) ───────────────
function HalfCard({ rank, suit, isRed }: { rank: 'J' | 'Q' | 'K'; suit: string; isRed: boolean }) {
  const suitColor = isRed ? RED_C : '#111111'

  return (
    <g>
      {/* Cuerpo decorativo */}
      <TraditionalBody x={8} y={32} w={84} h={72} isRed={isRed} rank={rank} />

      {/* Cabeza con corona/gorro */}
      {rank === 'K' && <KingCrown cx={50} y={4} />}
      {rank === 'Q' && <QueenCrown cx={50} y={6} />}
      {rank === 'J' && <JackHat cx={50} y={4} />}

      {/* Cara */}
      <Face
        cx={50}
        cy={rank === 'J' ? 30 : 28}
        beard={rank === 'K'}
        queenHair={rank === 'Q'}
      />

      {/* Objeto en mano izquierda */}
      {rank === 'K' && (
        // Espada
        <g>
          <line x1="78" y1="30" x2="78" y2="104" stroke={SILVER} strokeWidth="3" />
          <rect x="70" y="64" width="16" height="5" rx="1" fill="#888" />
          <polygon points="78,20 73,34 83,34" fill={SILVER} stroke="#999" strokeWidth="1" />
          <rect x="75" y="90" width="6" height="16" rx="1" fill={GOLD} />
        </g>
      )}
      {rank === 'Q' && (
        // Cetro con flor
        <g>
          <line x1="78" y1="44" x2="78" y2="104" stroke={GOLD} strokeWidth="2.5" />
          <circle cx="78" cy="37" r="9" fill={RED_C} stroke="#990000" strokeWidth="1" />
          <circle cx="78" cy="37" r="5" fill={GOLD} />
          <circle cx="78" cy="37" r="2.5" fill={WHITE} />
          {[0, 60, 120, 180, 240, 300].map((a, i) => (
            <ellipse key={i}
              cx={78 + 9 * Math.cos(a * Math.PI / 180)}
              cy={37 + 9 * Math.sin(a * Math.PI / 180)}
              rx="3" ry="4"
              fill={RED_C} opacity="0.7"
              transform={`rotate(${a},${78 + 9 * Math.cos(a * Math.PI / 180)},${37 + 9 * Math.sin(a * Math.PI / 180)})`}
            />
          ))}
        </g>
      )}
      {rank === 'J' && (
        // Lanza diagonal
        <g>
          <line x1="75" y1="26" x2="60" y2="104" stroke="#aaa" strokeWidth="2.5" />
          <polygon points="76,18 70,30 82,28" fill={SILVER} stroke="#999" strokeWidth="1" />
          <rect x="56" y="72" width="22" height="4" rx="1" fill={GOLD} />
        </g>
      )}

      {/* Escudo / orbe (mano derecha) */}
      {rank === 'K' && (
        <g>
          <ellipse cx="24" cy="78" rx="12" ry="16" fill={BLUE} stroke="#0033aa" strokeWidth="1.5" />
          <ellipse cx="24" cy="78" rx="8" ry="11" fill={GOLD} opacity="0.9" />
          <text x="24" y="82" textAnchor="middle" fontSize="10" fill={isRed ? RED_C : '#111'} fontFamily="serif">{suit}</text>
        </g>
      )}
      {rank === 'Q' && (
        // Espejo / abanico
        <g>
          <ellipse cx="24" cy="76" rx="11" ry="13" fill={GOLD} stroke="#a07810" strokeWidth="1.5" />
          {[0, 40, 80, 120, 160].map((a, i) => (
            <line key={i} x1="24" y1="76"
              x2={24 + 11 * Math.cos((a - 90) * Math.PI / 180)}
              y2={76 + 13 * Math.sin((a - 90) * Math.PI / 180)}
              stroke="#a07810" strokeWidth="1" />
          ))}
          <circle cx="24" cy="76" r="4" fill={RED_C} />
        </g>
      )}
      {rank === 'J' && (
        // Escudo pequeño
        <g>
          <path d="M15,64 Q15,50 22,46 Q29,50 29,64 Q29,72 22,76 Q15,72 15,64 Z"
            fill={BLUE} stroke="#0033aa" strokeWidth="1.5" />
          <text x="22" y="65" textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="serif">{suit}</text>
        </g>
      )}

      {/* Símbolo del palo en la esquina inferior izquierda de la media carta */}
      <text x="12" y="100" fontSize="13" fill={suitColor} fontFamily="serif" fontWeight="bold">{suit}</text>
    </g>
  )
}

// ── Componente exportado ────────────────────────────────────────────────────
export function FaceCard({ rank, suit, isRed, width = '100%', height = '100%', style }: Props) {
  return (
    <svg
      viewBox="0 0 100 210"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', ...(style ?? {}) }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Marco interior decorativo */}
      <rect x="3" y="3" width="94" height="204" rx="8" fill="none" stroke="#d1d5db" strokeWidth="0.8" />

      {/* Media carta superior */}
      <HalfCard rank={rank} suit={suit} isRed={isRed} />

      {/* Línea divisoria */}
      <line x1="5" y1="105" x2="95" y2="105" stroke="#bbb" strokeWidth="1" />

      {/* Media carta inferior (rotada 180°) */}
      <g transform="translate(100,210) rotate(180)">
        <HalfCard rank={rank} suit={suit} isRed={isRed} />
      </g>
    </svg>
  )
}
