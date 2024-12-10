import { UUID } from 'crypto'
import { Context } from 'telegraf'

import { Language, LanguagesList } from './Language.js'
import { Game } from './Game.js'
import { GameManager } from './Managers/GameManager.js'
import { NavigationMenu, NavigationMenuPages } from './Menus/NavigationMenu.js'
import { GameMenu } from './Menus/GameMenu.js'
import { NotificationMenu, Notifications } from './Menus/NotificationMenu.js'

export class User {
  userId: number
  username: string

  isInWaitingGame: boolean
  isInRunningGame: boolean
  currentGame: Game | null
  currentGameId: UUID | null
  gamesHistory: Game[]

  achievements: string[]
  totalGamesPlayed: number
  totalPlayTime: number
  language: Language
  lastInteraction: Date

  ctx: Context

  navigationMenu: NavigationMenu
  gameMenu: GameMenu | null
  NotificationMenus: NotificationMenu[]

  score: number
  highScore: number
  multiplayerScore: number
  multiplayerHighScore: number

  public static users: Record<number, User> = {}

  constructor(userId: number, username: string, ctx: Context) {
    this.userId = userId
    this.username = username.trim()
    this.isInWaitingGame = false
    this.isInRunningGame = false
    this.currentGame = null
    this.currentGameId = null
    this.gamesHistory = []
    this.achievements = []
    this.totalGamesPlayed = 0
    this.totalPlayTime = 0
    this.language = new Language(LanguagesList.English)
    this.lastInteraction = new Date()

    this.ctx = ctx

    this.navigationMenu = new NavigationMenu(userId, ctx)
    this.gameMenu = null
    this.NotificationMenus = []

    this.score = 0
    this.highScore = 0
    this.multiplayerScore = 0
    this.multiplayerHighScore = 0
  }

  // User Management Methods
  static getUserById(userId: number): User | undefined {
    return this.users[userId]
  }

  static findUser(userId: number): User {
    const user = this.getUserById(userId)
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`)
    }
    return user
  }

  static isUser(userID: number): boolean {
    return !!this.users[userID]
  }

  static registerUser(
    ctx: Context | null,
    userId: number,
    username: string
  ): User {
    if (!ctx) {
      throw new Error('Context is required for user registration.')
    }

    if (this.isUser(userId)) {
      throw new Error(`User with ID ${userId} already exists.`)
    }

    if (!this.isValidName(username)) {
      throw new Error(`Invalid username: ${username}`)
    }

    const user = new User(userId, username, ctx)
    this.users[userId] = user
    console.log(`Registered new user: ${userId} (${username})`)
    return user
  }

  static deleteUser(userID: number): void {
    const user = this.findUser(userID)

    if (!user) {
      console.error(`User with ID ${userID} not found.`)
      return
    }

    delete this.users[userID]
    console.log(`User with ID ${userID} has been deleted.`)
  }

  static isValidName(name: string): boolean {
    return /^[a-zA-Z0-9\s]+$/.test(name.trim())
  }

  static updateUser(userId: number, updates: Partial<Omit<User, 'userId'>>) {
    const user = this.findUser(userId)
    if (updates.username && !this.isValidName(updates.username)) {
      throw new Error(`Invalid username: ${updates.username}`)
    }
    Object.assign(user, updates)
  }

  // Menu Management Methods
  async activateNavigationMenu(page: NavigationMenuPages): Promise<void> {
    if (this.gameMenu) {
      await this.gameMenu.destroyMenuIfExists()
      this.gameMenu = null
    }
    await this.navigationMenu.sendMenu(page)
  }

  private async activateGameMenu(gameMenu: GameMenu): Promise<void> {
    if (this.navigationMenu) {
      await this.navigationMenu.destroyMenuIfExists()
    }
    this.gameMenu = gameMenu
    await this.gameMenu.sendGameMenu(this.currentGame!)
    console.log('Game menu activated.')
  }

  async toggleMenu(isGameMenu: boolean, gameMenu?: GameMenu): Promise<void> {
    if (isGameMenu && gameMenu) {
      await this.activateGameMenu(gameMenu)
    } else {
      await this.activateNavigationMenu(NavigationMenuPages.Main)
    }
  }

  // Notification Management Methods
  async sendNotificationMessage(notification: Notifications): Promise<void> {
    const notificationMenu = new NotificationMenu(this.userId, this.ctx)
    this.NotificationMenus.push(notificationMenu)
    notificationMenu.sendNotification(notification)
  }

  async destroyNotificationMessage(notificationId: number): Promise<void> {
    if (this.NotificationMenus.length > 0) {
      const menu = this.NotificationMenus.find(
        (menu) => menu.menuId == notificationId
      )
      if (menu) {
        menu.destroyMenuIfExists()
        this.NotificationMenus = this.NotificationMenus.filter(
          (menu) => menu.menuId != notificationId
        )
      }
    }
  }

  // Game Management Methods
  // async startGame(game: Game): Promise<void> {
  //   const gameManager = GameManager.getInstance()
  //   this.isInRunningGame = true
  //   this.currentGame = game
  //   this.currentGameId = game.gameId
  //   game.creator = this

  //   gameManager.startGame(game)
  //   await gameManager.sendGameBoard(game, this)
  // }

  async sendGameMenu(): Promise<void> {
    const game = this.currentGame
    const gameMenu = this.gameMenu
    if (!game || !gameMenu) {
      console.error('Game or game menu is not initialized')
      return
    }
    this.toggleMenu(true, gameMenu)
  }
  // await this.gameMenu.sendGameMenu(this.currentGame)

  endGame(): void {
    this.currentGame = null
    this.currentGameId = null
    this.isInRunningGame = false
  }

  handleTurn(game: Game, action: any): void {
    const gameManager = GameManager.getInstance()
    gameManager.handleUserAction(game.gameId, this, action)
  }

  updateCtx(ctx: Context): void {
    this.ctx = ctx
  }

  // Language and Utility Methods
  changeLanguage(newLanguage: LanguagesList): void {
    this.language.setCurrent(newLanguage)
    this.activateNavigationMenu(NavigationMenuPages.Main)
  }

  sendMessage(message: string): void {
    this.ctx.reply(message)
  }

  static destroyAllMenus(): void {
    for (const user of Object.values(User.users)) {
      user.navigationMenu?.destroyMenuIfExists()
      user.gameMenu?.destroyMenuIfExists()
      for (const notificationMenu of user.NotificationMenus) {
        notificationMenu.destroyMenuIfExists()
      }
    }
  }
}
