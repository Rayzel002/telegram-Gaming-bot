import { UUID } from 'crypto'

enum GameStage {
  Start,
  CreatorTurn,
  OponentTurn,
  Final,
  GameOver,
}

interface IGameState {
  gameId: UUID // Unique identifier for the game
  Creator: number // ID of the game creator
  oponent: number // ID of the opponent
  gameStartTime: Date // The start time of the game
  gameStage: GameStage // Current stage of the game
  currentRound: number // Round or level number for game progress
  stageStartTime: Date // The time when the current stage started
  stageLimit: number | null // Time limit for the current stage (optional)
  gameMode: 'solo' | 'multiplayer' | 'timeAttack' // Type of game (solo, multiplayer, time-attack)
  gameHistory: IGameHistory[] // List of actions performed in the game
}

interface IGameAction {
  actionType: 'answer' | 'move' | 'choice' // Action types like answering, moving, or making choices
  timestamp: Date // Time of the action
  result: boolean // Whether the action was successful (e.g., correct answer)
  details?: string // Any additional details (e.g., selected answer)
}

interface IGameHistory {
  gameId: UUID // Unique game identifier
  actions: IGameAction[] // List of actions performed in the game
}
