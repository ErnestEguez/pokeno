// Tests del verificador de patrones — runner: node --experimental-test-runner
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { checkPattern } from './patternChecker'
import type { BoardGrid } from '../types/game'

// Tablero de prueba fijo (5x5)
const GRID: BoardGrid = [
  ['A♠', '2♥', '3♦', '4♣', '5♠'],
  ['6♥', '7♦', '8♣', '9♠', '10♥'],
  ['J♦', 'Q♣', 'K♠', 'A♥', '2♦'],
  ['3♣', '4♠', '5♥', '6♦', '7♣'],
  ['8♠', '9♥', '10♦', 'J♣', 'Q♠'],
]

function marked(...codes: string[]): Set<string> {
  return new Set(codes)
}

// ────────────────────────────────────────────────────────────
describe('straight', () => {
  test('A-2-3-4-5 marcados → true', () => {
    assert.equal(checkPattern(GRID, marked('A♠','2♥','3♦','4♣','5♠'), 'straight'), true)
  })
  test('6-7-8-9-10 marcados → true', () => {
    assert.equal(checkPattern(GRID, marked('6♥','7♦','8♣','9♠','10♥'), 'straight'), true)
  })
  test('solo 4 en secuencia → false', () => {
    assert.equal(checkPattern(GRID, marked('A♠','2♥','3♦','4♣'), 'straight'), false)
  })
  test('valores no consecutivos → false', () => {
    assert.equal(checkPattern(GRID, marked('A♠','3♦','5♠','7♦','9♠'), 'straight'), false)
  })
})

// ────────────────────────────────────────────────────────────
describe('royal', () => {
  // El grid tiene A♠, J♦, Q♣, K♠; falta 10♠ para royal de picas completa
  // Construimos un grid secundario que sí tenga royal completa
  const GRID_ROYAL: BoardGrid = [
    ['A♠', '10♠', 'J♠', 'Q♠', 'K♠'],
    ['2♥', '3♦', '4♣', '5♠', '6♥'],
    ['7♦', '8♣', '9♠', '10♥', 'J♦'],
    ['Q♣', 'K♥', 'A♦', '2♣', '3♠'],
    ['4♥', '5♦', '6♣', '7♠', '8♥'],
  ]
  test('A♠,10♠,J♠,Q♠,K♠ marcados → true', () => {
    assert.equal(
      checkPattern(GRID_ROYAL, marked('A♠','10♠','J♠','Q♠','K♠'), 'royal'),
      true
    )
  })
  test('royal incompleta (falta Q) → false', () => {
    assert.equal(
      checkPattern(GRID_ROYAL, marked('A♠','10♠','J♠','K♠'), 'royal'),
      false
    )
  })
  test('royal con palos mixtos → false', () => {
    assert.equal(
      checkPattern(GRID_ROYAL, marked('A♠','10♠','J♠','Q♣','K♠'), 'royal'),
      false
    )
  })
})

// ────────────────────────────────────────────────────────────
describe('flush_row', () => {
  const GRID_FLUSH: BoardGrid = [
    ['A♠', '2♠', '3♠', '4♠', '5♠'],  // fila 0: todo picas
    ['6♥', '7♦', '8♣', '9♠', '10♥'],
    ['J♦', 'Q♣', 'K♠', 'A♥', '2♦'],
    ['3♣', '4♠', '5♥', '6♦', '7♣'],
    ['8♠', '9♥', '10♦', 'J♣', 'Q♠'],
  ]
  test('fila 0 toda de picas y marcada → true', () => {
    assert.equal(
      checkPattern(GRID_FLUSH, marked('A♠','2♠','3♠','4♠','5♠'), 'flush_row'),
      true
    )
  })
  test('fila marcada pero palos mixtos → false', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','2♥','3♦','4♣','5♠'), 'flush_row'),
      false
    )
  })
  test('fila de mismo palo pero incompleta → false', () => {
    assert.equal(
      checkPattern(GRID_FLUSH, marked('A♠','2♠','3♠','4♠'), 'flush_row'),
      false
    )
  })
})

// ────────────────────────────────────────────────────────────
describe('four_of_a_kind', () => {
  const GRID_4K: BoardGrid = [
    ['A♠', 'A♥', 'A♦', 'A♣', '5♠'],
    ['6♥', '7♦', '8♣', '9♠', '10♥'],
    ['J♦', 'Q♣', 'K♠', '2♥', '2♦'],
    ['3♣', '4♠', '5♥', '6♦', '7♣'],
    ['8♠', '9♥', '10♦', 'J♣', 'Q♠'],
  ]
  test('4 Ases marcados → true', () => {
    assert.equal(
      checkPattern(GRID_4K, marked('A♠','A♥','A♦','A♣'), 'four_of_a_kind'),
      true
    )
  })
  test('solo 3 Ases → false', () => {
    assert.equal(
      checkPattern(GRID_4K, marked('A♠','A♥','A♦'), 'four_of_a_kind'),
      false
    )
  })
  test('sin pares → false', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','2♥','3♦','4♣'), 'four_of_a_kind'),
      false
    )
  })
})

// ────────────────────────────────────────────────────────────
describe('full_house', () => {
  const GRID_FH: BoardGrid = [
    ['A♠', 'A♥', 'A♦', 'K♣', 'K♠'],
    ['6♥', '7♦', '8♣', '9♠', '10♥'],
    ['J♦', 'Q♣', 'K♥', '2♥', '2♦'],
    ['3♣', '4♠', '5♥', '6♦', '7♣'],
    ['8♠', '9♥', '10♦', 'J♣', 'Q♠'],
  ]
  test('trío de Ases + par de Reyes → true', () => {
    assert.equal(
      checkPattern(GRID_FH, marked('A♠','A♥','A♦','K♣','K♠'), 'full_house'),
      true
    )
  })
  test('solo trío, sin par → false', () => {
    assert.equal(
      checkPattern(GRID_FH, marked('A♠','A♥','A♦'), 'full_house'),
      false
    )
  })
  test('dos pares pero sin trío → false', () => {
    assert.equal(
      checkPattern(GRID_FH, marked('A♠','A♥','K♣','K♠'), 'full_house'),
      false
    )
  })
})

// ────────────────────────────────────────────────────────────
describe('three_of_a_kind', () => {
  const GRID_3K: BoardGrid = [
    ['A♠', 'A♥', 'A♦', '4♣', '5♠'],
    ['6♥', '7♦', '8♣', '9♠', '10♥'],
    ['J♦', 'Q♣', 'K♠', 'A♣', '2♦'],
    ['3♣', '4♠', '5♥', '6♦', '7♣'],
    ['8♠', '9♥', '10♦', 'J♣', 'Q♠'],
  ]
  test('exactamente 3 Ases marcados → true', () => {
    assert.equal(
      checkPattern(GRID_3K, marked('A♠','A♥','A♦'), 'three_of_a_kind'),
      true
    )
  })
  test('4 Ases marcados → false (es four_of_a_kind, no three)', () => {
    assert.equal(
      checkPattern(GRID_3K, marked('A♠','A♥','A♦','A♣'), 'three_of_a_kind'),
      false
    )
  })
  test('solo 2 del mismo valor → false', () => {
    assert.equal(
      checkPattern(GRID_3K, marked('A♠','A♥'), 'three_of_a_kind'),
      false
    )
  })
})

// ────────────────────────────────────────────────────────────
describe('two_pair', () => {
  const GRID_2P: BoardGrid = [
    ['A♠', 'A♥', '3♦', 'K♣', 'K♠'],
    ['6♥', '7♦', '8♣', '9♠', '10♥'],
    ['J♦', 'Q♣', 'K♥', '2♥', '2♦'],
    ['3♣', '4♠', '5♥', '6♦', '7♣'],
    ['8♠', '9♥', '10♦', 'J♣', 'Q♠'],
  ]
  test('par de Ases + par de Reyes → true', () => {
    assert.equal(
      checkPattern(GRID_2P, marked('A♠','A♥','K♣','K♠'), 'two_pair'),
      true
    )
  })
  test('un solo par → false', () => {
    assert.equal(
      checkPattern(GRID_2P, marked('A♠','A♥','3♦'), 'two_pair'),
      false
    )
  })
  test('sin pares → false', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','2♥','3♦'), 'two_pair'),
      false
    )
  })
})

// ────────────────────────────────────────────────────────────
describe('one_pair', () => {
  const GRID_1P: BoardGrid = [
    ['A♠', 'A♥', '3♦', '4♣', '5♠'],
    ['6♥', '7♦', '8♣', '9♠', '10♥'],
    ['J♦', 'Q♣', 'K♠', '2♥', '2♦'],
    ['3♣', '4♠', '5♥', '6♦', '7♣'],
    ['8♠', '9♥', '10♦', 'J♣', 'Q♠'],
  ]
  test('par de Ases marcado → true', () => {
    assert.equal(
      checkPattern(GRID_1P, marked('A♠','A♥'), 'one_pair'),
      true
    )
  })
  test('par de 2s marcado → true', () => {
    assert.equal(
      checkPattern(GRID_1P, marked('2♥','2♦'), 'one_pair'),
      true
    )
  })
  test('todas cartas distintas → false', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','6♥','J♦','3♣','8♠'), 'one_pair'),
      false
    )
  })
})

// ────────────────────────────────────────────────────────────
describe('center', () => {
  test('celda central [2][2] marcada → true', () => {
    // GRID[2][2] = 'K♠'
    assert.equal(checkPattern(GRID, marked('K♠'), 'center'), true)
  })
  test('otras celdas marcadas pero no el centro → false', () => {
    assert.equal(checkPattern(GRID, marked('A♠','2♥','3♦'), 'center'), false)
  })
  test('ninguna celda marcada → false', () => {
    assert.equal(checkPattern(GRID, marked(), 'center'), false)
  })
})

// ────────────────────────────────────────────────────────────
describe('corners', () => {
  // GRID esquinas: [0][0]=A♠, [0][4]=5♠, [4][0]=8♠, [4][4]=Q♠
  test('las 4 esquinas marcadas → true', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','5♠','8♠','Q♠'), 'corners'),
      true
    )
  })
  test('solo 3 esquinas → false', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','5♠','8♠'), 'corners'),
      false
    )
  })
  test('ninguna esquina → false', () => {
    assert.equal(checkPattern(GRID, marked('K♠'), 'corners'), false)
  })
})

// ────────────────────────────────────────────────────────────
describe('five_in_line', () => {
  test('fila 0 completa → true', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','2♥','3♦','4♣','5♠'), 'five_in_line'),
      true
    )
  })
  test('columna 0 completa → true', () => {
    // col 0: A♠, 6♥, J♦, 3♣, 8♠
    assert.equal(
      checkPattern(GRID, marked('A♠','6♥','J♦','3♣','8♠'), 'five_in_line'),
      true
    )
  })
  test('4 en línea pero no 5 → false', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','2♥','3♦','4♣'), 'five_in_line'),
      false
    )
  })
  test('5 cartas dispersas → false', () => {
    assert.equal(
      checkPattern(GRID, marked('A♠','7♦','K♠','4♠','10♦'), 'five_in_line'),
      false
    )
  })
})

// ────────────────────────────────────────────────────────────
describe('blackout', () => {
  const allCodes = GRID.flat()

  test('las 25 celdas marcadas → true', () => {
    assert.equal(
      checkPattern(GRID, new Set(allCodes), 'blackout'),
      true
    )
  })
  test('24 celdas (falta 1) → false', () => {
    const almost = new Set(allCodes)
    almost.delete('K♠')
    assert.equal(checkPattern(GRID, almost, 'blackout'), false)
  })
  test('tablero vacío → false', () => {
    assert.equal(checkPattern(GRID, marked(), 'blackout'), false)
  })
})
