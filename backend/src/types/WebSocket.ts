import type { Player, Statement, GameResults } from './Game.js';
import { GamePhase } from './Game.js';

// Client -> Server Messages
export interface CreateRoomMessage {
  type: 'create-room';
  playerName: string;
}

export interface JoinRoomMessage {
  type: 'join-room';
  roomCode: string;
  playerName: string;
}

export interface SubmitStatementMessage {
  type: 'submit-statement';
  statement: string;
}

export interface SubmitGuessMessage {
  type: 'submit-guess';
  statementId: string;
  guessedAuthorId: string;
}

export interface DrinkActionMessage {
  type: 'drink-action';
  statementId: string;
}

export interface StartPhaseMessage {
  type: 'start-phase';
  phase: GamePhase;
}

export type ClientMessage = 
  | CreateRoomMessage 
  | JoinRoomMessage 
  | SubmitStatementMessage 
  | SubmitGuessMessage 
  | DrinkActionMessage 
  | StartPhaseMessage;

// Server -> Client Messages
export interface RoomCreatedMessage {
  type: 'room-created';
  roomCode: string;
  playerId: string;
  gameState: GameStateMessage['gameState'];
}

export interface PlayerJoinedMessage {
  type: 'player-joined';
  player: Player;
  gameState: GameStateMessage['gameState'];
}

export interface PhaseChangedMessage {
  type: 'phase-changed';
  phase: GamePhase;
  gameState: GameStateMessage['gameState'];
}

export interface StatementRevealedMessage {
  type: 'statement-revealed';
  statement: Omit<Statement, 'authorId'>; // Hide author during guessing
}

export interface ScoresUpdatedMessage {
  type: 'scores-updated';
  scores: { [playerId: string]: { drinkCount: number; guessScore: number } };
}

export interface GameEndedMessage {
  type: 'game-ended';
  results: GameResults;
}

export interface GameStateMessage {
  type: 'game-state';
  gameState: {
    roomCode: string;
    players: Player[];
    phase: GamePhase;
    currentStatementIndex: number;
    totalStatements: number;
    canStart: boolean;
  };
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type ServerMessage = 
  | RoomCreatedMessage 
  | PlayerJoinedMessage 
  | PhaseChangedMessage 
  | StatementRevealedMessage 
  | ScoresUpdatedMessage 
  | GameEndedMessage 
  | GameStateMessage
  | ErrorMessage; 