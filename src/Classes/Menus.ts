import { Context } from 'telegraf'
import { MenuBuilder } from './Helpers/MenuBuilder.js'
import { Language } from './Language.js'
import { User } from './User.js'

export interface MenuButton {
  text: string
  callbackData: string
}

export interface IMenu {
  title: string
  buttons: MenuButton[][]
  parent?: string // Use strings for generic parent references
}

export abstract class Menu {
  public menuId: number | null = null
  protected abstract getMenuDefinitions(
    language: Language
  ): Record<string, IMenu>
  protected currentMenuPage: string

  constructor(protected userId: number, protected ctx: Context) {
    this.currentMenuPage = ''
  }

  async sendMenu(menuPage: string) {
    const menus = this.getMenuDefinitions(this.getUserLanguage())
    const menu = menus[menuPage]

    if (!menu) {
      console.error(`Menu "${menuPage}" not found.`)
      return
    }

    const menuBuilder = new MenuBuilder(menu.buttons).build()
    this.currentMenuPage = menuPage

    try {
      if (this.menuId) {
        await this.ctx.telegram.editMessageReplyMarkup(
          this.ctx.chat?.id,
          this.menuId,
          undefined,
          { inline_keyboard: menuBuilder.reply_markup.inline_keyboard }
        )
      } else {
        const message = await this.ctx.reply(menu.title, {
          reply_markup: menuBuilder.reply_markup,
        })
        if (message && message.message_id) {
          this.menuId = message.message_id
        } else {
          console.error('Message sent, but no message_id returned.')
        }
      }
    } catch (error) {
      console.error(`Error sending menu: ${error}`)
    }
  }

  async destroyMenuIfExists() {
    if (this.menuId) {
      try {
        await this.ctx.deleteMessage(this.menuId)
        this.menuId = null
      } catch (error) {
        console.error(`Error destroying menu: ${error}`)
      }
    }
  }

  async handleBack() {
    const menus = this.getMenuDefinitions(this.getUserLanguage())
    const parent = menus[this.currentMenuPage]?.parent

    if (parent && menus[parent]) {
      await this.sendMenu(parent)
    } else {
      console.error(`No parent menu for "${this.currentMenuPage}".`)
    }
  }

  protected getUserLanguage(): Language {
    const user = User.findUser(this.userId)
    return user.language
  }
}
