export class Logger {
  private static instance: Logger

  constructor() {
    if (!Logger.instance) {
      Logger.instance = this
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  static log(message: string) {
    console.log(message)
  }

  static error(message: string) {
    console.error(message)
  }
}
