import type { Card, Suit, CardValue, CardColor } from '@/types/game'

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const VALUES: CardValue[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

const SUIT_COLOR: Record<Suit, CardColor> = {
  '♠': 'black',
  '♣': 'black',
  '♥': 'red',
  '♦': 'red',
}

export const STANDARD_DECK: Card[] = SUITS.flatMap(suit =>
  VALUES.map(value => ({
    suit,
    value,
    code: `${value}${suit}`,
    color: SUIT_COLOR[suit],
  }))
)

// Fisher-Yates: retorna nuevo array sin mutar el original
export function shuffleDeck(deck: Card[]): Card[] {
  const result = [...deck]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getCardDisplay(code: string): { suit: Suit; value: CardValue; color: CardColor } {
  const suit = code.slice(-1) as Suit
  const value = code.slice(0, -1) as CardValue
  return { suit, value, color: SUIT_COLOR[suit] }
}
