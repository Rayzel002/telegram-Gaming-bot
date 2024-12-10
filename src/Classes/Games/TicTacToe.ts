import { Board } from '../Board.js'
import {
  ActionTypes,
  Game,
  GameAction,
  GameMode,
  GameStage,
  GameTypes,
} from '../Game.js'
import { Notifications } from '../Menus/NotificationMenu.js'
import { User } from '../User.js'

export enum TicTacToeGameMode {
  Solo = 'solo',
  Multiplayer = 'multiplayer',
}

export interface TicTacToeAction extends GameAction {
  type: ActionTypes.select
  row: number
  col: number
}

export class TicTacToe extends Game {
  gridDimensions: [number, number]
  creatorSymbol: string | null
  opponentSymbol: string | null
  constructor(
    creator: User,
    gameMode: 'solo' | 'multiplayer',
    gridDimensions: [number, number]
  ) {
    super(creator, gameMode as GameMode, GameTypes.TicTacToe, gridDimensions)
    this.gridDimensions = gridDimensions
    this.board = Board.createBoard(gridDimensions)
    this.creatorSymbol = null
    this.opponentSymbol = null
  }

  determineWinner(): User | null {
    if (!this.board) {
      throw new Error('Board is not initialized')
    }
    const grid = this.board.grid
    const numRows = grid.length
    const numCols = grid[0].length

    // Check rows
    for (let row = 0; row < numRows; row++) {
      if (
        grid[row][0] !== '' &&
        grid[row].every((cell) => cell === grid[row][0])
      ) {
        const winnerSymbol = grid[row][0]
        return this.getUserBySymbol(winnerSymbol)
      }
    }

    // Check columns
    for (let col = 0; col < numCols; col++) {
      let colValues = []
      for (let row = 0; row < numRows; row++) {
        colValues.push(grid[row][col])
      }
      if (
        colValues[0] !== '' &&
        colValues.every((cell) => cell === colValues[0])
      ) {
        const winnerSymbol = colValues[0]
        return this.getUserBySymbol(winnerSymbol)
      }
    }

    // Check diagonals
    // Top-left to bottom-right diagonal
    if (
      grid[0][0] !== '' &&
      grid.every((row, index) => row[index] === grid[0][0])
    ) {
      const winnerSymbol = grid[0][0]
      return this.getUserBySymbol(winnerSymbol)
    }

    // Top-right to bottom-left diagonal
    if (
      grid[0][numCols - 1] !== '' &&
      grid.every(
        (row, index) => row[numCols - 1 - index] === grid[0][numCols - 1]
      )
    ) {
      const winnerSymbol = grid[0][numCols - 1]
      return this.getUserBySymbol(winnerSymbol)
    }

    // No winner
    return null
  }

  // Check if the board is full (draw)
  isDraw(): boolean {
    if (!this.board) {
      throw new Error('Board is not initialized')
    }
    return this.board.grid.every((row) => row.every((cell) => cell !== ''))
  }

  handleMove(row: number, column: number, playerSymbole: string) {
    if (!this.board) {
      throw new Error(Notifications.boardIsNotInitialized)
    }
    if (this.board.grid[row][column] !== '') {
      throw new Error(Notifications.cellIsAlreadyOccupied)
    }

    this.board.handleUpdateCell(row, column, playerSymbole)
    const winner = this.determineWinner()
    if (winner) {
      this.endGame()
      return winner
    }

    if (this.isDraw()) {
      this.endGame()
      return 'draw'
    }

    // Toggle turn
    this.gameStage =
      this.gameStage === GameStage.CreatorTurn
        ? GameStage.OpponentTurn
        : GameStage.CreatorTurn
  }

  handleAction(user: User, action: TicTacToeAction) {
    if (this.isUserTurn(user)) {
      try {
        const result = this.handleMove(
          action.row,
          action.col,
          this.getPlayerSymbol(user)
        )
        if (result instanceof User) {
          this.endGame()
          return result
        }
        if (result === 'draw') {
          this.endGame()
          return 'draw'
        }
        this.creator.sendGameMenu()
        this.opponent?.sendGameMenu()
      } catch (error: any) {
        console.error(error)
        const errorMessage = error.message
        user.sendNotificationMessage(errorMessage)
      }
    } else {
      throw new Error(`It's not ${user.username}'s turn.`)
    }
    return null
  }

  getPlayerSymbol(user: User): string {
    if (user === this.creator) {
      return this.creatorSymbol!
    } else if (user === this.opponent) {
      return this.opponentSymbol!
    }
    throw new Error('User is not part of the game.')
  }

  getUserBySymbol(symbol: string): User | null {
    if (symbol === this.creatorSymbol) {
      return this.creator
    } else if (symbol === this.opponentSymbol) {
      return this.opponent!
    }
    return null
  }
}
