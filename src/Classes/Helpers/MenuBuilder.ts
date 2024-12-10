import { Markup } from 'telegraf'
import { MenuButton } from '../Menus.js'

export class MenuBuilder {
  private buttons: MenuButton[][]

  constructor(buttons: MenuButton[][] = []) {
    this.buttons = buttons
  }

  // Accepts a 2D array of buttons (rows of buttons)
  setButtons(buttons: MenuButton[][]) {
    this.buttons = buttons
  }

  // Build the inline keyboard
  build() {
    // Map buttons into the required structure for Telegraf
    const keyboard = this.buttons.map((row) =>
      row.map((button) =>
        Markup.button.callback(button.text, button.callbackData)
      )
    )
    return Markup.inlineKeyboard(keyboard)
  }

  // Example function to clear the current menu
  reset() {
    this.buttons = []
  }
}
