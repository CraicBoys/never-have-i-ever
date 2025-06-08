export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  drinkCount: number;
  guessScore: number;
  connected: boolean;
  hasSubmittedStatement: boolean;
}

export interface Statement {
  id: string;
  text: string;
  votes: { [playerId: string]: string };
  drinkers: string[];
}

export enum GamePhase {
  WAITING = 'waiting',
  SUBMITTING_STATEMENTS = 'submitting_statements',
  GUESSING = 'guessing',
  DRINKING = 'drinking',
  RESULTS = 'results',
  FINISHED = 'finished'
}

export interface GameState {
  roomCode: string;
  players: Player[];
  phase: GamePhase;
  currentStatementIndex: number;
  totalStatements: number;
  canStart: boolean;
}

export interface GameResults {
  finalScores: {
    playerId: string;
    playerName: string;
    drinkCount: number;
    guessScore: number;
    totalScore: number;
  }[];
  statementResults: {
    statement: string;
    actualAuthor: string;
    guesses: { [playerName: string]: string };
    correctGuessers: string[];
    drinkers: string[];
  }[];
} 