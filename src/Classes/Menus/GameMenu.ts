import { Context } from 'telegraf'
import { Language } from '../Language.js'
import { IMenu, Menu, MenuButton } from '../Menus.js'
import { Game, GameTypes } from '../Game.js'

export class GameMenu extends Menu {
  constructor(userId: number, ctx: Context, private board: string[][]) {
    super(userId, ctx)
  }

  protected getMenuDefinitions(language: Language): Record<string, IMenu> {
    return {
      [GameTypes.TicTacToe]: {
        title: 'Game Board',
        buttons: this.buildGameBoard(),
      },
    }
  }
  sendGameBoard(GameType: GameTypes) {
    this.sendMenu(GameType)
  }

  buildGameBoard(): MenuButton[][] {
    const board = this.board.map((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        text: cell || ' ',
        callbackData: `cell_${rowIndex}_${colIndex}`,
      }))
    )

    return board
  }
  sendGameMenu(game: Game) {
    this.sendMenu(game.gameType)
  }

  updateBoard(board: string[][]) {
    this.board = board
  }
}
