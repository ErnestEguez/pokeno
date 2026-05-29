import type { BoardGrid, CellPosition } from '@/types/game'

export function getBoardPosition(grid: BoardGrid, cardCode: string): CellPosition | null {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === cardCode) return { row, col }
    }
  }
  return null
}

export function getMarkedPositions(grid: BoardGrid, markedCodes: Set<string>): CellPosition[] {
  const positions: CellPosition[] = []
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (markedCodes.has(grid[row][col])) {
        positions.push({ row, col })
      }
    }
  }
  return positions
}

export function isCellMarked(markedCodes: Set<string>, cardCode: string): boolean {
  return markedCodes.has(cardCode)
}
