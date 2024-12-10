import { UUID } from 'crypto'
import { GameMenu } from '../Menus/GameMenu.js'
import { Game, GameAction, GameTypes } from './../Game.js'
import { TicTacToe, TicTacToeGameMode } from './../Games/TicTacToe.js'
import { User } from './../User.js'
import { Notifications } from '../Menus/NotificationMenu.js'

export class GameManager {
  private timers: Map<UUID, NodeJS.Timeout> = new Map()

  // Singleton pattern for centralized management (optional)
  private static instance: GameManager

  private constructor() {}

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager()
    }
    return GameManager.instance
  }

  // Handle user action (e.g., a move in the game)
  public handleUserAction(gameId: UUID, user: User, action: GameAction) {
    const game = Game.runningGames.find((g) => g[0] === gameId)?.[1]
    if (!game) {
      console.error(`Game with ID ${gameId} not found.`)
      return
    }

    if (game.isUserTurn(user)) {
      const result = game.handleAction(user, action)

      if (result instanceof User) {
        const winner = result
        const loser = game.getOtherPlayer(winner)
        this.endGame(
          gameId,
          `${winner.username} wins! ${loser?.username} loses.`
        )

        this.updateUserState(winner, game, false)
        this.updateUserState(loser, game, false)
        winner.sendNotificationMessage(Notifications.youWon)
        loser?.sendNotificationMessage(Notifications.youLost)
      } else if (result === 'draw') {
        this.endGame(gameId, 'Draw!')

        this.updateUserState(game.creator, game, false)
        this.updateUserState(game.opponent!, game, false)

        game.creator.sendNotificationMessage(Notifications.itsADraw)
        game.opponent?.sendNotificationMessage(Notifications.itsADraw)
      } else {
        this.manageTurnTimer(game)
      }
    } else {
      user.sendNotificationMessage(Notifications.itsNotYourTurn)
    }
    console.log('board: ', game.board.grid)
  }

  // Manage turn timer
  private manageTurnTimer(game: Game) {
    const timerId = this.timers.get(game.gameId)
    if (timerId) {
      clearTimeout(timerId) // Clear existing timer
    }

    const turnLimit = game.stageLimit || 30 // Default 30 seconds per turn
    const timeout = setTimeout(() => {
      this.handleTurnTimeout(game)
    }, turnLimit * 1000)

    this.timers.set(game.gameId, timeout)
  }

  // Handle turn timeout
  private handleTurnTimeout(game: Game) {
    // Logic for handling turn timeout (e.g., forfeiting turn)
    const user = game.getCurrentPlayer()
    if (!user) {
      throw new Error('User is not found')
    }
    const otherPlayer = game.getOtherPlayer(user)

    console.log(`User ${user.username}'s turn timed out.`)

    user.sendGameMenu()
    otherPlayer.sendGameMenu()
    game.nextTurn()

    this.manageTurnTimer(game)
  }

  // End a game
  public endGame(gameId: UUID, resultMessage?: string) {
    const game = Game.runningGames.find((g) => g[0] === gameId)?.[1]

    if (game) {
      Game.runningGames.filter((g) => g[0] === gameId)

      // Clear timer if exists
      const timerId = this.timers.get(gameId)
      if (timerId) {
        clearTimeout(timerId)
        this.timers.delete(gameId)
      }
      game.creator.toggleMenu(false)
      game.opponent?.toggleMenu(false)
      console.log(`Game ${gameId} ended. ${resultMessage || ''}`)
    }
  }

  // List active games (optional, for debugging or UI)
  public listActiveGames() {
    return Array.from(Game.runningGames[1])
  }

  private getGameById(gameId: UUID): Game | null {
    const gameEntry = Game.runningGames.find((game) => game[0] === gameId)
    return gameEntry ? gameEntry[1] : null
  }

  public getGameByUser(User: User): Game | null {
    const gameId = User.currentGame?.gameId
    return this.getGameById(gameId!)
  }

  // Get a waiting game of a specific type
  // public getWaitingGameOfType(gameType: GameTypes): Game | null {
  //   console.log('Searching for game of type: ', gameType, 'have been started!')
  //   const waitingGames = Game.waitingGames
  //   for (const gameId in waitingGames) {
  //     const game = waitingGames[gameId as UUID]
  //     console.log('Searching...')
  //     if (game.gameType === gameType) {
  //       console.log('Game found!')
  //       return game
  //     }
  //   }

  //   return null
  // }

  public getWaitingGameOfType(gameType: GameTypes): Game | null {
    if (Game.waitingGames.length === 0) {
      return null
    }
    const reversedWaitingGames = Game.waitingGames.reverse()
    const game = reversedWaitingGames.filter(
      (g) => g[1].gameType === gameType
    )[0][1]
    if (game) {
      console.log('Game found!')
      return game
    }
    console.log('Game not found!')
    return null
  }

  // Join an existing game
  private joinGame(game: Game, user: User) {
    game.setOpponent(user)
    const creator = game.creator
    const opponent = game.opponent!

    // Update user state
    this.updateUserState(creator, game, true)
    this.updateUserState(opponent, game, true)

    game.startGame()
  }

  // Update user state
  private updateUserState(user: User, game: Game, isEnteringGame: boolean) {
    if (isEnteringGame) {
      user.isInRunningGame = true
      user.currentGame = game
      user.currentGameId = game.gameId
    } else {
      user.isInRunningGame = false
      user.currentGame = null
      user.currentGameId = null
    }
  }

  // Create a TicTacToe game
  public createTicTacToeGame(creator: User, gameMode: TicTacToeGameMode) {
    const game = new TicTacToe(creator, gameMode, [3, 3])
    Game.addWaitingGame(game)
    console.log('waitingGames: ', Game.waitingGames)
    creator.sendNotificationMessage(Notifications.gameHasBeenCreated)
  }

  // Join a TicTacToe game
  public joinTicTacToeGame(game: TicTacToe, user: User) {
    this.joinGame(game, user)
    console.log('Joined game...')

    // Set player symbols
    game.creatorSymbol = 'X'
    game.opponentSymbol = 'O'

    const creator = game.creator
    const opponent = game.opponent!

    creator.sendNotificationMessage(Notifications.gameStarted)
    opponent!.sendNotificationMessage(Notifications.gameStarted)

    this.assignGameMenuToUser(creator, game)
    this.assignGameMenuToUser(opponent, game)

    creator.sendGameMenu()
    opponent.sendGameMenu()
  }

  private assignGameMenuToUser(user: User, game: Game) {
    user.gameMenu = new GameMenu(user.userId, user.ctx, game.board.grid)
  }
}
