export class Board {
  private gridDimensions: number[] // Dimensions of the grid, e.g., [3, 3]
  grid: string[][] // The grid itself

  constructor(gridDimensions: number[]) {
    this.gridDimensions = gridDimensions
    this.grid = Board.createEmptyGrid(gridDimensions) // Initialize grid
  }

  // Static factory method to create a board based on grid dimensions
  static createBoard(gridDimensions: number[]): Board {
    return new Board(gridDimensions)
  }

  // Update the grid for a specific cell
  public handleUpdateCell(row: number, column: number, value: string): void {
    if (this.grid[row][column] === '') {
      this.grid[row][column] = value
    } else {
      throw new Error(`Cell at (${row}, ${column}) is already occupied.`)
    }
  }

  // Reset the board to its initial empty state
  public reset(): void {
    this.grid = Board.createEmptyGrid(this.gridDimensions)
  }

  // Private: Helper function to create an empty grid based on the dimensions
  private static createEmptyGrid(dimensions: number[]): string[][] {
    return Array.from({ length: dimensions[0] }, () =>
      Array.from({ length: dimensions[1] }, () => '')
    )
  }
}
