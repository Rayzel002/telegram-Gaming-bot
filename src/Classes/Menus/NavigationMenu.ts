import { IMenu, Menu, MenuButton } from '../Menus.js'
import { Language } from '../Language.js'

export enum NavigationMenuPages {
  Main = 'main',
  Settings = 'settings',
  Games = 'games',
  OfflineGames = 'offline_games',
  OnlineGames = 'online_games',
  Help = 'help',
}

export enum CallbackActions {
  Back = 'back',
  Exit = 'exit',
  ChangeLanguage = 'change_language',
  HowToPlay = 'how_to_play',
  ticTacToeoffline = 'tic_tac_toe_offline',
  ticTacToeonline = 'tic_tac_toe_online',
}

export class NavigationMenu extends Menu {
  getMenuDefinitions(language: Language): Record<string, IMenu> {
    const createButtons = (
      buttons: { text: string; callbackData: string }[][]
    ): MenuButton[][] =>
      buttons.map((row) =>
        row.map((button) => ({
          text: button.text,
          callbackData: button.callbackData,
        }))
      )

    const menuDefinitions: Record<
      NavigationMenuPages,
      { title: string; buttons: MenuButton[][]; parent?: NavigationMenuPages }
    > = {
      [NavigationMenuPages.Main]: {
        title: language.current.mainMenuTitle,
        buttons: createButtons([
          [
            {
              text: language.current.gamesButtonText,
              callbackData: NavigationMenuPages.Games,
            },
            {
              text: language.current.settingsButtonText,
              callbackData: NavigationMenuPages.Settings,
            },
          ],
          [
            {
              text: language.current.helpButtonText,
              callbackData: NavigationMenuPages.Help,
            },
            {
              text: language.current.exitButtonText,
              callbackData: CallbackActions.Exit,
            },
          ],
        ]),
      },
      [NavigationMenuPages.Games]: {
        title: language.current.gamesMenuTitle,
        buttons: createButtons([
          [
            {
              text: language.current.offlineGamesButtonText,
              callbackData: NavigationMenuPages.OfflineGames,
            },
            {
              text: language.current.onlineGamesButtonText,
              callbackData: NavigationMenuPages.OnlineGames,
            },
          ],
          [
            {
              text: language.current.backButtonText,
              callbackData: CallbackActions.Back,
            },
          ],
        ]),
        parent: NavigationMenuPages.Main,
      },
      [NavigationMenuPages.OfflineGames]: {
        title: language.current.offlineGamesMenuTitle,
        buttons: createButtons([
          // [
          //   {
          //     text: language.current.ticTacToeGameName,
          //     callbackData: CallbackActions.ticTacToeoffline,
          //   },
          // ],
          [
            {
              text: language.current.backButtonText,
              callbackData: CallbackActions.Back,
            },
          ],
        ]),
        parent: NavigationMenuPages.Games,
      },
      [NavigationMenuPages.OnlineGames]: {
        title: language.current.onlineGamesMenuTitle,
        buttons: createButtons([
          [
            {
              text: language.current.ticTacToeGameName,
              callbackData: CallbackActions.ticTacToeonline,
            },
          ],
          [
            {
              text: language.current.backButtonText,
              callbackData: CallbackActions.Back,
            },
          ],
        ]),
        parent: NavigationMenuPages.Games,
      },
      [NavigationMenuPages.Settings]: {
        title: language.current.settingsMenuTitle,
        buttons: createButtons([
          [
            {
              text: language.current.changeLanguageButtonText,
              callbackData: CallbackActions.ChangeLanguage,
            },
          ],
          [
            {
              text: language.current.backButtonText,
              callbackData: CallbackActions.Back,
            },
          ],
        ]),
        parent: NavigationMenuPages.Main,
      },
      [NavigationMenuPages.Help]: {
        title: language.current.helpMenuTitle,
        buttons: createButtons([
          [
            {
              text: language.current.howToPlayButtonText,
              callbackData: CallbackActions.HowToPlay,
            },
          ],
          [
            {
              text: language.current.backButtonText,
              callbackData: CallbackActions.Back,
            },
          ],
        ]),
        parent: NavigationMenuPages.Main,
      },
    }

    // Transform to Record<string, IMenu>
    return Object.entries(menuDefinitions).reduce((acc, [key, menu]) => {
      acc[key] = {
        title: menu.title,
        buttons: menu.buttons,
        parent: menu.parent,
      }
      return acc
    }, {} as Record<string, IMenu>)
  }
}
