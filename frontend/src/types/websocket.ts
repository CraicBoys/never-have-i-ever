import type { Player, Statement, GameResults, GameState } from './game';
import { GamePhase } from './game';

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

export interface GetLobbiesMessage {
  type: 'get-lobbies';
}

export interface JoinLobbyMessage {
  type: 'join-lobby';
  gameId: string;
  playerName: string;
}

export type ClientMessage = 
  | CreateRoomMessage 
  | JoinRoomMessage 
  | SubmitStatementMessage 
  | SubmitGuessMessage 
  | DrinkActionMessage 
  | StartPhaseMessage
  | GetLobbiesMessage
  | JoinLobbyMessage;

// Server -> Client Messages
export interface RoomCreatedMessage {
  type: 'room-created';
  roomCode: string;
  playerId: string;
  gameState: GameState;
}

export interface PlayerJoinedMessage {
  type: 'player-joined';
  player: Player;
  gameState: GameState;
}

export interface PhaseChangedMessage {
  type: 'phase-changed';
  phase: GamePhase;
  gameState: GameState;
}

export interface StatementRevealedMessage {
  type: 'statement-revealed';
  statement: Statement;
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
  gameState: GameState;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface LobbiesListMessage {
  type: 'lobbies-list';
  lobbies: {
    gameId: string;
    hostName: string;
    playerCount: number;
    maxPlayers: number;
    phase: GamePhase;
    createdAt: string;
  }[];
}

export type ServerMessage = 
  | RoomCreatedMessage 
  | PlayerJoinedMessage 
  | PhaseChangedMessage 
  | StatementRevealedMessage 
  | ScoresUpdatedMessage 
  | GameEndedMessage 
  | GameStateMessage
  | ErrorMessage
  | LobbiesListMessage; 