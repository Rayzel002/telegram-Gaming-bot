import { Context } from 'telegraf'

// Type guard for checking if the message is a text message
export function isTextMessage(ctx: Context): ctx is Context & { text: string } {
  return typeof ctx.text === 'string'
}
