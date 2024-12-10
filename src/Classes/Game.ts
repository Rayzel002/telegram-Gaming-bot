import { UUID, randomUUID } from 'crypto'
import { Board } from './Board.js'
import { User } from './User.js'

export enum GameTypes {
  TicTacToe = 'tic_tac_toe',
}

export interface GameAction {
  type: ActionTypes
}

export enum ActionTypes {
  select = 'select',
}

export enum GameMode {
  Solo = 'solo',
  Multiplayer = 'multiplayer',
  TimeAttack = 'timeAttack',
}

export enum GameStage {
  Start,
  CreatorTurn,
  OpponentTurn,
  Final,
  GameOver,
}

export abstract class Game {
  gameId: UUID // Unique identifier for the game
  creator: User // Creator of the game
  opponent?: User // Opponent in the game
  gameStartTime?: Date // The start time of the game
  gameStage: GameStage // Current stage of the game
  stageStartTime: Date // When the current stage started
  stageLimit: number | null // Time limit for the stage (optional)
  gameMode: GameMode // Game mode
  gameType: GameTypes // Game type
  board: Board // Game board instance

  // static waitingGames: Record<UUID, Game>
  // static runningGames: Record<UUID, Game>
  static waitingGames: [UUID, Game][] = []
  static runningGames: [UUID, Game][] = []
  constructor(
    creator: User,
    gameMode: GameMode,
    gameType: GameTypes,
    boardDimensions: [number, number]
  ) {
    this.gameId = randomUUID()
    this.creator = creator
    this.gameStage = GameStage.Start
    this.stageStartTime = new Date()
    this.stageLimit = null
    this.gameMode = gameMode
    this.gameType = gameType
    this.board = Board.createBoard(boardDimensions)
  }

  // Add a game to the waiting list
  static addWaitingGame(game: Game) {
    if (!game.gameId) {
      console.log('gameId: ', game.gameId)
      console.error('Game ID is not defined.')
      return
    }
    // Game.waitingGames[game.gameId] = game
    Game.waitingGames.push([game.gameId, game])
  }

  static findGameById(gameId: UUID, games: [UUID, Game][]) {
    return games.filter(([id, _]) => id !== gameId)
  }

  // Start the game
  startGame() {
    this.gameStage = GameStage.CreatorTurn
    this.stageStartTime = new Date()

    Game.removeGameFromWaitingList(this.gameId)
    Game.addGameToRunningList(this)
  }

  // Update the game stage
  updateGameStage(stage: GameStage) {
    const validTransition =
      (stage === GameStage.CreatorTurn && this.gameStage === GameStage.Start) ||
      (stage === GameStage.OpponentTurn &&
        this.gameStage === GameStage.CreatorTurn) ||
      (stage === GameStage.Final && this.gameStage !== GameStage.GameOver)

    if (!validTransition) {
      throw new Error(`Invalid stage transition: ${this.gameStage} → ${stage}`)
    }

    this.gameStage = stage
    this.stageStartTime = new Date()
  }

  // End the game
  endGame() {
    this.gameStage = GameStage.GameOver
    Game.removeGameFromWaitingList(this.gameId)
  }

  setOpponent(user: User) {
    if (!this.opponent) {
      this.opponent = user
    } else {
      console.error('Opponent is already set.')
    }
  }

  isGameOver(): boolean {
    return this.gameStage === GameStage.GameOver
  }

  abstract determineWinner(): User | null

  abstract handleAction(user: User, action: any): User | 'draw' | null

  isUserTurn(user: User): boolean {
    if (this.isGameOver()) {
      throw new Error('The game is over; no actions are allowed.')
    }

    if (user === this.getCurrentPlayer()) {
      return true
    }

    return false
  }

  getCurrentPlayer(): User | null {
    if (this.gameStage === GameStage.GameOver) {
      return null
    }
    if (this.gameStage === GameStage.Final) {
      return this.creator
    }
    if (this.gameStage === GameStage.CreatorTurn) {
      return this.creator
    }
    if (this.gameStage === GameStage.OpponentTurn) {
      return this.opponent || null
    }
    return null
  }

  getOtherPlayer(user: User): User {
    if (!this.opponent) {
      throw new Error('No opponent is set for this game.')
    }
    return this.creator === user ? this.opponent : this.creator
  }

  nextTurn() {
    if (this.isGameOver()) {
      throw new Error('Cannot proceed to the next turn; the game is over.')
    }

    this.gameStage =
      this.gameStage === GameStage.CreatorTurn
        ? GameStage.OpponentTurn
        : GameStage.CreatorTurn

    this.stageStartTime = new Date()

    const winner = this.determineWinner()
    if (winner) {
      this.endGame()
    }
  }

  static removeGameFromWaitingList(gameId: UUID) {
    Game.waitingGames = Game.waitingGames.filter((g) => g[0] !== gameId)
  }

  static removeGameFromRunningList(gameId: UUID) {
    Game.runningGames = Game.runningGames.filter((g) => g[0] !== gameId)
  }

  static addGameToWaitingList(game: Game) {
    Game.waitingGames.push([game.gameId, game])
  }

  static addGameToRunningList(game: Game) {
    Game.runningGames.push([game.gameId, game])
  }
}
