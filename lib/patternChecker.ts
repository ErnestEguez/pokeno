import type { BoardGrid, WinningPattern } from '@/types/game'

// ────────────────────────────────────────────────────────────
// Utilidades internas
// ────────────────────────────────────────────────────────────
const VALUE_NUM: Record<string, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  J: 11, Q: 12, K: 13,
}

interface ParsedCard {
  value: string
  suit: string
  num: number
}

function parseCard(code: string): ParsedCard {
  const suit = code.slice(-1)
  const value = code.slice(0, -1)
  return { value, suit, num: VALUE_NUM[value] ?? 0 }
}

function getMarkedCards(grid: BoardGrid, markedCodes: Set<string>): ParsedCard[] {
  const cards: ParsedCard[] = []
  for (const row of grid) {
    for (const code of row) {
      if (markedCodes.has(code)) cards.push(parseCard(code))
    }
  }
  return cards
}

function valueCounts(cards: ParsedCard[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const c of cards) map.set(c.value, (map.get(c.value) ?? 0) + 1)
  return map
}

// ────────────────────────────────────────────────────────────
// Verificadores por patrón
// ────────────────────────────────────────────────────────────

function checkStraight(cards: ParsedCard[]): boolean {
  // Construye el set de valores numéricos; el As vale 1 y también 14
  const nums = new Set<number>()
  for (const c of cards) {
    nums.add(c.num)
    if (c.num === 1) nums.add(14)
  }
  const sorted = [...nums].sort((a, b) => a - b)

  for (let i = 0; i <= sorted.length - 5; i++) {
    let ok = true
    for (let j = 0; j < 4; j++) {
      if (sorted[i + j + 1] !== sorted[i + j] + 1) { ok = false; break }
    }
    if (ok) return true
  }
  return false
}

function checkRoyal(cards: ParsedCard[]): boolean {
  const ROYAL_VALUES = new Set(['A', '10', 'J', 'Q', 'K'])
  for (const suit of ['♠', '♥', '♦', '♣']) {
    const suitVals = new Set(cards.filter(c => c.suit === suit).map(c => c.value))
    if ([...ROYAL_VALUES].every(v => suitVals.has(v))) return true
  }
  return false
}

function checkFlushRow(grid: BoardGrid, markedCodes: Set<string>): boolean {
  for (const row of grid) {
    if (!row.every(code => markedCodes.has(code))) continue
    const suits = new Set(row.map(code => code.slice(-1)))
    if (suits.size === 1) return true
  }
  return false
}

function checkFourOfAKind(cards: ParsedCard[]): boolean {
  return [...valueCounts(cards).values()].some(n => n >= 4)
}

function checkFullHouse(cards: ParsedCard[]): boolean {
  const counts = valueCounts(cards)
  const entries = [...counts.entries()]
  const trioEntry = entries.find(([, n]) => n >= 3)
  if (!trioEntry) return false
  return entries.some(([val, n]) => val !== trioEntry[0] && n >= 2)
}

function checkThreeOfAKind(cards: ParsedCard[]): boolean {
  // Exactamente 3 cartas del mismo valor (no 4)
  return [...valueCounts(cards).values()].some(n => n === 3)
}

function checkTwoPair(cards: ParsedCard[]): boolean {
  const pairs = [...valueCounts(cards).values()].filter(n => n >= 2)
  return pairs.length >= 2
}

function checkOnePair(cards: ParsedCard[]): boolean {
  return [...valueCounts(cards).values()].some(n => n >= 2)
}

function checkCenter(grid: BoardGrid, markedCodes: Set<string>): boolean {
  return markedCodes.has(grid[2][2])
}

function checkCorners(grid: BoardGrid, markedCodes: Set<string>): boolean {
  return (
    markedCodes.has(grid[0][0]) &&
    markedCodes.has(grid[0][4]) &&
    markedCodes.has(grid[4][0]) &&
    markedCodes.has(grid[4][4])
  )
}

function checkFiveInLine(grid: BoardGrid, markedCodes: Set<string>): boolean {
  // Horizontales
  for (let r = 0; r < 5; r++) {
    if (grid[r].every(code => markedCodes.has(code))) return true
  }
  // Verticales
  for (let c = 0; c < 5; c++) {
    if (grid.every(row => markedCodes.has(row[c]))) return true
  }
  return false
}

function checkBlackout(grid: BoardGrid, markedCodes: Set<string>): boolean {
  return grid.every(row => row.every(code => markedCodes.has(code)))
}

// ────────────────────────────────────────────────────────────
// Exportación principal
// ────────────────────────────────────────────────────────────
export function checkPattern(
  grid: BoardGrid,
  markedCodes: Set<string>,
  pattern: WinningPattern
): boolean {
  const marked = getMarkedCards(grid, markedCodes)

  switch (pattern) {
    case 'straight':        return checkStraight(marked)
    case 'royal':           return checkRoyal(marked)
    case 'flush_row':       return checkFlushRow(grid, markedCodes)
    case 'four_of_a_kind':  return checkFourOfAKind(marked)
    case 'full_house':      return checkFullHouse(marked)
    case 'three_of_a_kind': return checkThreeOfAKind(marked)
    case 'two_pair':        return checkTwoPair(marked)
    case 'one_pair':        return checkOnePair(marked)
    case 'center':          return checkCenter(grid, markedCodes)
    case 'corners':         return checkCorners(grid, markedCodes)
    case 'five_in_line':    return checkFiveInLine(grid, markedCodes)
    case 'blackout':        return checkBlackout(grid, markedCodes)
  }
}
