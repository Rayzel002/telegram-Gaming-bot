import { Context, Telegraf } from 'telegraf'

import dotenv from 'dotenv'
dotenv.config()

import { UUID } from 'crypto'

import { Language } from './Classes/Language.js'
import { User } from './Classes/User.js'
import { isTextMessage } from './Classes/Helpers/MessagesValidation.js'
import { handleCommands } from './Classes/Command.js'
import { gracefullShutDown } from './Classes/Helpers/BotHelper.js'
import { ActionTypes, GameTypes } from './Classes/Game.js'
import {
  TicTacToe,
  TicTacToeAction,
  TicTacToeGameMode,
} from './Classes/Games/TicTacToe.js'
import { GameManager } from './Classes/Managers/GameManager.js'
import { NavigationMenuPages } from './Classes/Menus/NavigationMenu.js'
import {
  NotificationMenu,
  Notifications,
} from './Classes/Menus/NotificationMenu.js'

setInterval(() => {
  const memoryUsage = process.memoryUsage()
  console.log({
    rss: memoryUsage.rss, // Resident Set Size
    heapTotal: memoryUsage.heapTotal, // Total heap allocated
    heapUsed: memoryUsage.heapUsed, // Heap currently used
    external: memoryUsage.external, // External memory usage
  })
}, 5000) // Logs memory usage every 5 seconds

const bot = new Telegraf(process.env.BOT_TOKEN!)

// Start command handler
bot.start(async (ctx) => {
  const isUser = User.isUser(ctx.from.id)
  if (!isUser) {
    await ctx.reply(Language.initialLanguage.welcomeMessage)
  } else {
    const user = User.findUser(ctx.from.id)
    user.sendNotificationMessage(Notifications.welcomeBack)
    user.activateNavigationMenu(NavigationMenuPages.Main)
  }
})

bot.on('message', async (ctx) => {
  if (isTextMessage(ctx)) {
    const userId = ctx.from.id
    const username = ctx.text.trim()

    if (!User.isUser(userId)) {
      User.registerUser(ctx, userId, username)
      if (User.isUser(userId)) {
        const user = User.findUser(userId)
        user.activateNavigationMenu(NavigationMenuPages.Main)
      }
    } else {
      const user = User.findUser(userId)
      if (!user.navigationMenu) {
        handleCommands(user, ctx)
      }
    }
  }
})

async function handleActions(ctx: Context, page: NavigationMenuPages) {
  const userId = ctx.from?.id
  if (!userId) {
    console.error('UserID is undefined')
    return
  }
  const user = User.findUser(ctx.from.id)
  user.navigationMenu.sendMenu(page)
}

bot.action('games', async (ctx) => {
  handleActions(ctx, NavigationMenuPages.Games)
})

bot.action('settings', async (ctx) => {
  handleActions(ctx, NavigationMenuPages.Settings)
})

bot.action('back', async (ctx) => {
  const user = User.findUser(ctx.from.id)
  user.navigationMenu.handleBack()
})
bot.action('help', async (ctx) => {
  handleActions(ctx, NavigationMenuPages.Help)
})
bot.action('offline_games', async (ctx) => {
  handleActions(ctx, NavigationMenuPages.OfflineGames)
})

bot.action('online_games', async (ctx) => {
  handleActions(ctx, NavigationMenuPages.OnlineGames)
})

bot.action('change_language', async (ctx) => {
  const user = User.findUser(ctx.from.id)
  user.changeLanguage(user.language.getNextLanguage())
})

bot.action('exit', async (ctx) => {
  const user = User.findUser(ctx.from.id)
  // Destroy the current menu if it exists
  await user.navigationMenu.destroyMenuIfExists()

  // Send a message instructing the user how to return to the main menu
  await user.sendNotificationMessage(Notifications.returnToMainMenu)
})

bot.action('tic_tac_toe_online', async (ctx) => {
  const user = User.findUser(ctx.from.id)
  const gameManager = GameManager.getInstance()
  if (user.isInRunningGame) {
    user.sendNotificationMessage(Notifications.alreadyInGame)
    return
  }

  const ticTacToeWaitingGame = gameManager.getWaitingGameOfType(
    GameTypes.TicTacToe
  ) as TicTacToe | undefined
  console.log('TicTacToeWaitingGame: ', ticTacToeWaitingGame)

  if (ticTacToeWaitingGame) {
    gameManager.joinTicTacToeGame(ticTacToeWaitingGame, user)

    // Notify both players
    user.sendNotificationMessage(Notifications.gameStarted)
  } else {
    gameManager.createTicTacToeGame(user, TicTacToeGameMode.Solo)
  }
})

bot.on('callback_query', async (ctx) => {
  const user = User.findUser(ctx.from.id)
  const callbackQuery = ctx.callbackQuery
  const game = user.currentGame
  const gameManager = GameManager.getInstance()

  if (!user) {
    console.error('User is not found')
    return
  }

  if (callbackQuery && 'data' in callbackQuery) {
    if (callbackQuery.data.startsWith('got_it*')) {
      const notificationId = callbackQuery.data.split('*')[1] as UUID
      const notificationMessageId =
        NotificationMenu.getNotificaionMessageId(notificationId)
      if (!notificationMessageId) {
        console.error('Notification message ID not found.')
        return
      }
      user.destroyNotificationMessage(notificationMessageId)
    } else if (callbackQuery.data.startsWith('cell_')) {
      const row = callbackQuery.data.split('_')[1]
      const col = callbackQuery.data.split('_')[2]
      const game = user.currentGame
      if (!game && user.isInRunningGame) {
        user.sendNotificationMessage(Notifications.isNotInARunningGame)
        return
      }

      const action: TicTacToeAction = {
        type: ActionTypes.select,
        row: Number(row),
        col: Number(col),
      }
      gameManager.handleUserAction(game!.gameId, user, action)
    }
    {
      console.error('idk')
    }
  }
})

// Launch the bot
bot.launch().then(() => console.log('Bot is running...'))

// Graceful shutdown on SIGINT and SIGTERM
process.once('SIGINT', async () => {
  gracefullShutDown()
  bot.stop('SIGINT')
})

process.once('SIGTERM', async () => {
  gracefullShutDown()
  bot.stop('SIGTERM')
})

// // Simulate a command programmatically
// async function simulateMessage() {
//   const ctx = {
//     reply: (message) => console.log(message),
//     message: { text: '/start' },
//   }
//   await bot.handleUpdate(ctx)
// }

// simulateMessage()
