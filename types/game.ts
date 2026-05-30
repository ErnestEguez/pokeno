// Tipos del dominio del juego Pokeno

// ────────────────────────────────────────────────────────────
// Carta individual
// ────────────────────────────────────────────────────────────
export type Suit = '♠' | '♥' | '♦' | '♣'
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
export type CardColor = 'red' | 'black'

export interface Card {
  suit: Suit
  value: CardValue
  code: string // ej: "A♠", "10♥"
  color: CardColor
}

// ────────────────────────────────────────────────────────────
// Tablero 5×5
// ────────────────────────────────────────────────────────────
export type BoardRow = [string, string, string, string, string]
export type BoardGrid = [BoardRow, BoardRow, BoardRow, BoardRow, BoardRow]

export interface CellPosition {
  row: number
  col: number
}

// ────────────────────────────────────────────────────────────
// Patrones ganadores (12 patrones del juego)
// ────────────────────────────────────────────────────────────
export type WinningPattern =
  | 'straight'        // 5 cartas en secuencia de valor
  | 'royal'           // A, 10, J, Q, K del mismo palo
  | 'flush_row'       // fila completa del mismo palo
  | 'four_of_a_kind'  // 4 cartas del mismo valor
  | 'full_house'      // trío + par
  | 'three_of_a_kind' // 3 cartas del mismo valor
  | 'two_pair'        // dos pares de valores distintos
  | 'one_pair'        // al menos un par
  | 'center'          // celda central [2][2]
  | 'corners'         // las 4 esquinas
  | 'five_in_line'    // 5 en línea (horizontal o vertical)
  | 'blackout'        // las 25 celdas

export const ALL_PATTERNS: WinningPattern[] = [
  'straight',
  'royal',
  'flush_row',
  'four_of_a_kind',
  'full_house',
  'three_of_a_kind',
  'two_pair',
  'one_pair',
  'center',
  'corners',
  'five_in_line',
  'blackout',
]

export const PATTERN_LABELS: Record<WinningPattern, string> = {
  straight:        'Escalera',
  royal:           'Escalera Real',
  flush_row:       'Fila del mismo palo',
  four_of_a_kind:  'Póker (4 iguales)',
  full_house:      'Full House',
  three_of_a_kind: 'Trío',
  two_pair:        'Doble par',
  one_pair:        'Par',
  center:          'Centro',
  corners:         'Cuatro esquinas',
  five_in_line:    'Cinco en línea',
  blackout:        'Blackout (tablero lleno)',
}

// ────────────────────────────────────────────────────────────
// Estados del juego
// ────────────────────────────────────────────────────────────
export type RoomStatus  = 'lobby' | 'playing' | 'paused' | 'finished'
export type DeckStatus  = 'ready' | 'running' | 'paused' | 'done'
export type SlotStatus  = 'available' | 'taken'

// ────────────────────────────────────────────────────────────
// Eventos de tiempo real (broadcast Supabase)
// ────────────────────────────────────────────────────────────
export type RealtimeEventType =
  | 'game_started'
  | 'card_called'
  | 'game_paused'
  | 'game_resumed'
  | 'game_ended'
  | 'host_changed'
  | 'slot_taken'
  | 'claim_submitted'
  | 'claim_result'

export interface RealtimeEvent {
  type: RealtimeEventType
  payload?: Record<string, unknown>
}
