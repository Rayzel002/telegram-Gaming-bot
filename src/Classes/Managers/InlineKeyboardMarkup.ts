import { InlineKeyboardMarkup, InlineKeyboardButton } from 'telegraf/types'
import { Context } from 'telegraf'

class InlineKeyboardManager {
  private keyboard: InlineKeyboardButton[][] = []
  private messageId: number | null = null
  private chatId: number | string | null = null

  constructor() {
    this.keyboard = []
  }

  // Method to add a button to the inline keyboard
  addButton(text: string, callbackData: string, row: number = 0) {
    // Ensure the row exists in the keyboard
    if (!this.keyboard[row]) {
      this.keyboard[row] = []
    }
    // Add the button to the specified row
    this.keyboard[row].push({ text, callback_data: callbackData })
  }

  // Method to generate the inline keyboard markup
  build(): InlineKeyboardMarkup {
    return {
      inline_keyboard: this.keyboard,
    }
  }

  // Set the message to update (messageId and chatId)
  setMessage(messageId: number, chatId: number | string) {
    this.messageId = messageId
    this.chatId = chatId
  }

  // Update the existing keyboard
  async updateKeyboard(ctx: Context) {
    if (this.messageId && this.chatId) {
      try {
        // Update the inline keyboard using editMessageReplyMarkup
        await ctx.telegram.editMessageReplyMarkup(
          this.chatId,
          this.messageId,
          undefined,
          this.build()
        )
      } catch (error) {
        console.error('Error updating inline keyboard:', error)
      }
    }
  }

  // Optionally, clear the keyboard after each interaction to avoid clutter
  clear() {
    this.keyboard = []
  }
}

export default InlineKeyboardManager
