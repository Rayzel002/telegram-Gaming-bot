import { randomUUID, UUID } from 'crypto'
import { Context } from 'telegraf'
import { Language } from '../Language.js'
import { IMenu, Menu } from '../Menus.js'
import { User } from '../User.js'

export enum Notifications {
  welcomeBack = 'welcomeBack',
  start = 'start',
  help = 'help',

  commandIsMissing = 'CommandIsMissing',
  unknownCommand = 'unknownCommand',

  gameHasBeenCreated = 'gameHasBeenCreated',
  alreadyInGame = 'alreadyInGame',
  gameStarted = 'gameStarted',
  isNotInARunningGame = 'isNotInARunningGame',
  returnToMainMenu = 'returnToMainMenu',

  printMostafa = 'printMostafa',
  itsNotYourTurn = 'itsNotYourTurn',
  boardIsNotInitialized = 'boardIsNotInitialized',
  cellIsAlreadyOccupied = 'cellIsAlreadyOccupied',

  youWon = 'youWon',
  youLost = 'youLost',
  itsADraw = 'itsADraw',
}

export class NotificationMenu extends Menu {
  private notificationId: UUID
  static notifications: Record<UUID, NotificationMenu> = {}
  constructor(userId: number, ctx: Context) {
    super(userId, ctx)
    this.notificationId = randomUUID()
    NotificationMenu.notifications[this.notificationId] = this
  }
  protected getMenuDefinitions(language: Language): Record<string, IMenu> {
    const userLanguage = User.findUser(this.userId).language.current
    const callbackData = 'got_it*' + this.notificationId
    return {
      [Notifications.welcomeBack]: {
        title: userLanguage.welcomeBackMessage,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.start]: {
        title: userLanguage.startCommandResponse,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.help]: {
        title: userLanguage.helpMenuTitle,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.commandIsMissing]: {
        title: userLanguage.commandIsMissingResponse,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.unknownCommand]: {
        title: userLanguage.unknownCommandResponse,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.alreadyInGame]: {
        title: userLanguage.alreadyInGame,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.isNotInARunningGame]: {
        title: userLanguage.notInARunningGame,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.returnToMainMenu]: {
        title: userLanguage.returnToMainMenu,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.gameHasBeenCreated]: {
        title: userLanguage.gameHasBeenCreated,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.printMostafa]: {
        title: userLanguage.printMostafa,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.gameStarted]: {
        title: userLanguage.gameStarted,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.itsNotYourTurn]: {
        title: userLanguage.itsNotYourTurn,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.boardIsNotInitialized]: {
        title: userLanguage.boardIsNotInitialized,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.cellIsAlreadyOccupied]: {
        title: userLanguage.cellIsAlreadyOccupied,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.youWon]: {
        title: userLanguage.youWon,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.youLost]: {
        title: userLanguage.youLost,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
      [Notifications.itsADraw]: {
        title: userLanguage.itsADraw,
        buttons: [
          [
            {
              text: userLanguage.gotIt,
              callbackData: callbackData,
            },
          ],
        ],
      },
    }
  }

  async sendNotification(notification: Notifications) {
    this.sendMenu(notification)
  }

  static getNotificaionMessageId(notificationId: UUID): number | null {
    return NotificationMenu.notifications[notificationId]?.getMenuId()
  }

  getMenuId(): number | null {
    return this.menuId
  }
}
