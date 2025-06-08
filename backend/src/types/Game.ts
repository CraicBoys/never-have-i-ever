export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  drinkCount: number;
  guessScore: number;
  connected: boolean;
}

export interface Statement {
  id: string;
  text: string;
  authorId: string;
  votes: { [playerId: string]: string }; // playerId -> guessed authorId
  drinkers: string[]; // player IDs who drank for this statement
}

export enum GamePhase {
  WAITING = 'waiting',
  SUBMITTING_STATEMENTS = 'submitting_statements',
  GUESSING = 'guessing',
  DRINKING = 'drinking',
  RESULTS = 'results',
  FINISHED = 'finished'
}

export interface Game {
  id: string;
  roomCode: string;
  players: { [playerId: string]: Player };
  statements: Statement[];
  currentStatementIndex: number;
  phase: GamePhase;
  createdAt: Date;
  lastActivity: Date;
  maxPlayers: number;
  minPlayers: number;
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