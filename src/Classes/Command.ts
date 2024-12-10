import { NavigationMenuPages } from './Menus/NavigationMenu.js'
import { Notifications } from './Menus/NotificationMenu.js'
import { User } from './User.js'
import { Context } from 'telegraf'

enum Commands {
  Start = '/start',
  Help = '/help',
  MainMenu = '/mainmenu',
  printMostafa = '/printMostafa',
}

interface ICommands {
  command: Commands
  func: (user: User) => Promise<void>
}

const commandsMap: ICommands[] = [
  {
    command: Commands.Start,
    func: async (user: User) => {
      const username = user.username ?? 'Guest'
      await user.sendNotificationMessage(Notifications.start)
      user.activateNavigationMenu(NavigationMenuPages.Main)
    },
  },
  {
    command: Commands.Help,
    func: async (user: User) => {
      await user.sendNotificationMessage(Notifications.help)
    },
  },
  {
    command: Commands.MainMenu,
    func: async (user: User) => {
      user.activateNavigationMenu(NavigationMenuPages.Main)
    },
  },
  {
    command: Commands.printMostafa,
    func: async (user: User) => {
      await user.sendNotificationMessage(Notifications.commandIsMissing)
    },
  },
]

export async function handleCommands(user: User, ctx: Context) {
  const commandText = ctx.text?.trim()?.toLowerCase()
  if (!commandText) {
    await user.sendNotificationMessage(Notifications.commandIsMissing)
    return
  }

  const command = commandsMap.find(
    (cmd) => cmd.command.toLowerCase() === commandText
  )
  console.log(`command: ${command}, commandText: ${commandText}`)
  if (command) {
    await command.func(user)
  } else {
    await user.sendNotificationMessage(Notifications.unknownCommand)
  }
}
