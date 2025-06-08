import type { ServerWebSocket } from 'bun';
import type { ClientMessage, ServerMessage } from '../types/WebSocket.js';
import type { Game, Player } from '../types/Game.js';
import { GamePhase } from '../types/Game.js';
import { GameService } from './GameService.js';

interface WebSocketConnection {
  ws: ServerWebSocket<any>;
  playerId?: string;
  gameId?: string;
}

export class WebSocketService {
  private connections = new Map<ServerWebSocket<any>, WebSocketConnection>();
  private gameService: GameService;

  constructor(gameService: GameService) {
    this.gameService = gameService;
  }

  /**
   * Handles new WebSocket connection
   */
  handleConnection(ws: ServerWebSocket<any>): void {
    console.log('New WebSocket connection');
    this.connections.set(ws, { ws });
  }

  /**
   * Handles WebSocket disconnection
   */
  handleDisconnection(ws: ServerWebSocket<any>): void {
    console.log('WebSocket disconnected');
    const connection = this.connections.get(ws);
    
    if (connection?.playerId && connection?.gameId) {
      // Mark player as disconnected
      const game = this.gameService.getGame(connection.gameId);
      if (game && connection.playerId && game.players[connection.playerId]) {
        game.players[connection.playerId].connected = false;
        this.broadcastToGame(connection.gameId, {
          type: 'game-state',
          gameState: this.getGameState(game),
        });
      }
    }
    
    this.connections.delete(ws);
  }

  /**
   * Handles incoming WebSocket messages
   */
  handleMessage(ws: ServerWebSocket<any>, message: string): void {
    try {
      const parsedMessage: ClientMessage = JSON.parse(message);
      console.log('Received message:', parsedMessage.type);

      switch (parsedMessage.type) {
        case 'create-room':
          this.handleCreateRoom(ws, parsedMessage);
          break;
        case 'join-room':
          this.handleJoinRoom(ws, parsedMessage);
          break;
        case 'submit-statement':
          this.handleSubmitStatement(ws, parsedMessage);
          break;
        case 'submit-guess':
          this.handleSubmitGuess(ws, parsedMessage);
          break;
        case 'drink-action':
          this.handleDrinkAction(ws, parsedMessage);
          break;
        case 'start-phase':
          this.handleStartPhase(ws, parsedMessage);
          break;
        default:
          this.sendError(ws, 'Unknown message type');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendError(ws, 'Invalid message format');
    }
  }

  private handleCreateRoom(ws: ServerWebSocket<any>, message: { playerName: string }): void {
    try {
      const { game, hostPlayer } = this.gameService.createGame(message.playerName);
      
      const connection = this.connections.get(ws);
      if (connection) {
        connection.playerId = hostPlayer.id;
        connection.gameId = game.id;
      }

      this.sendMessage(ws, {
        type: 'room-created',
        roomCode: game.roomCode,
        playerId: hostPlayer.id,
        gameState: this.getGameState(game),
      });
    } catch (error) {
      this.sendError(ws, 'Failed to create room');
    }
  }

  private handleJoinRoom(ws: ServerWebSocket<any>, message: { roomCode: string; playerName: string }): void {
    try {
      const result = this.gameService.joinGame(message.roomCode, message.playerName);
      if (!result) {
        this.sendError(ws, 'Room not found');
        return;
      }

      const { game, player } = result;
      
      const connection = this.connections.get(ws);
      if (connection) {
        connection.playerId = player.id;
        connection.gameId = game.id;
      }

      // Send welcome message to new player
      this.sendMessage(ws, {
        type: 'player-joined',
        player,
        gameState: this.getGameState(game),
      });

      // Broadcast to all other players
      this.broadcastToGame(game.id, {
        type: 'game-state',
        gameState: this.getGameState(game),
      }, [player.id]);

    } catch (error) {
      this.sendError(ws, error instanceof Error ? error.message : 'Failed to join room');
    }
  }

  private handleSubmitStatement(ws: ServerWebSocket<any>, message: { statement: string }): void {
    const connection = this.connections.get(ws);
    if (!connection?.playerId || !connection?.gameId) {
      this.sendError(ws, 'Not connected to a game');
      return;
    }

    const success = this.gameService.submitStatement(connection.gameId, connection.playerId, message.statement);
    if (!success) {
      this.sendError(ws, 'Failed to submit statement');
      return;
    }

    const game = this.gameService.getGame(connection.gameId);
    if (game) {
      this.broadcastToGame(connection.gameId, {
        type: 'game-state',
        gameState: this.getGameState(game),
      });

      // Check if all players submitted statements
      const playerCount = Object.keys(game.players).length;
      if (game.statements.length === playerCount && game.phase === GamePhase.SUBMITTING_STATEMENTS) {
        // Auto-advance to guessing phase
        this.gameService.startGuessingPhase(connection.gameId);
        this.startGuessingRound(connection.gameId);
      }
    }
  }

  private handleSubmitGuess(ws: ServerWebSocket<any>, message: { statementId: string; guessedAuthorId: string }): void {
    const connection = this.connections.get(ws);
    if (!connection?.playerId || !connection?.gameId) {
      this.sendError(ws, 'Not connected to a game');
      return;
    }

    const success = this.gameService.submitGuess(
      connection.gameId,
      connection.playerId,
      message.statementId,
      message.guessedAuthorId
    );

    if (!success) {
      this.sendError(ws, 'Failed to submit guess');
      return;
    }

    const game = this.gameService.getGame(connection.gameId);
    if (game) {
      this.broadcastToGame(connection.gameId, {
        type: 'scores-updated',
        scores: this.getScores(game),
      });

      // Check if all players voted
      const currentStatement = this.gameService.getCurrentStatement(connection.gameId);
      if (currentStatement) {
        const playerCount = Object.keys(game.players).length;
        const voteCount = Object.keys(currentStatement.votes).length;
        
        if (voteCount >= playerCount - 1) { // -1 because author doesn't vote
          // Move to drinking phase
          this.gameService.nextStatement(connection.gameId);
          this.startDrinkingPhase(connection.gameId, currentStatement.id);
        }
      }
    }
  }

  private handleDrinkAction(ws: ServerWebSocket<any>, message: { statementId: string }): void {
    const connection = this.connections.get(ws);
    if (!connection?.playerId || !connection?.gameId) {
      this.sendError(ws, 'Not connected to a game');
      return;
    }

    const success = this.gameService.recordDrink(connection.gameId, connection.playerId, message.statementId);
    if (success) {
      const game = this.gameService.getGame(connection.gameId);
      if (game) {
        this.broadcastToGame(connection.gameId, {
          type: 'scores-updated',
          scores: this.getScores(game),
        });
      }
    }
  }

  private handleStartPhase(ws: ServerWebSocket<any>, message: { phase: GamePhase }): void {
    const connection = this.connections.get(ws);
    if (!connection?.playerId || !connection?.gameId) {
      this.sendError(ws, 'Not connected to a game');
      return;
    }

    const game = this.gameService.getGame(connection.gameId);
    if (!game) {
      this.sendError(ws, 'Game not found');
      return;
    }

    // Check if player is host
    const player = game.players[connection.playerId];
    if (!player?.isHost) {
      this.sendError(ws, 'Only host can start phases');
      return;
    }

    switch (message.phase) {
      case GamePhase.SUBMITTING_STATEMENTS:
        const success = this.gameService.startStatementPhase(connection.gameId);
        if (success) {
          this.broadcastToGame(connection.gameId, {
            type: 'phase-changed',
            phase: GamePhase.SUBMITTING_STATEMENTS,
            gameState: this.getGameState(game),
          });
        } else {
          this.sendError(ws, 'Cannot start statement phase');
        }
        break;
      default:
        this.sendError(ws, 'Invalid phase transition');
    }
  }

  private startGuessingRound(gameId: string): void {
    const game = this.gameService.getGame(gameId);
    if (!game) return;

    const currentStatement = this.gameService.getCurrentStatement(gameId);
    if (!currentStatement) return;

    this.broadcastToGame(gameId, {
      type: 'phase-changed',
      phase: GamePhase.GUESSING,
      gameState: this.getGameState(game),
    });

    // Send current statement (without author info)
    this.broadcastToGame(gameId, {
      type: 'statement-revealed',
      statement: {
        id: currentStatement.id,
        text: currentStatement.text,
        votes: currentStatement.votes,
        drinkers: currentStatement.drinkers,
      },
    });
  }

  private startDrinkingPhase(gameId: string, statementId: string): void {
    const game = this.gameService.getGame(gameId);
    if (!game) return;

    this.broadcastToGame(gameId, {
      type: 'phase-changed',
      phase: GamePhase.DRINKING,
      gameState: this.getGameState(game),
    });

    // Auto-advance after 10 seconds or when ready
    setTimeout(() => {
      this.advanceToNextStatement(gameId);
    }, 10000);
  }

  private advanceToNextStatement(gameId: string): void {
    const game = this.gameService.getGame(gameId);
    if (!game) return;

    this.gameService.nextStatement(gameId);
    const updatedGame = this.gameService.getGame(gameId);
    if (!updatedGame) return;

    if (updatedGame.phase === GamePhase.FINISHED) {
      const results = this.gameService.getGameResults(gameId);
      if (results) {
        this.broadcastToGame(gameId, {
          type: 'game-ended',
          results,
        });
      }
    } else {
      // Start next guessing round
      this.startGuessingRound(gameId);
    }
  }

  private getGameState(game: Game) {
    return {
      roomCode: game.roomCode,
      players: Object.values(game.players),
      phase: game.phase,
      currentStatementIndex: game.currentStatementIndex,
      totalStatements: game.statements.length,
      canStart: Object.keys(game.players).length >= game.minPlayers,
    };
  }

  private getScores(game: Game) {
    const scores: { [playerId: string]: { drinkCount: number; guessScore: number } } = {};
    Object.values(game.players).forEach(player => {
      scores[player.id] = {
        drinkCount: player.drinkCount,
        guessScore: player.guessScore,
      };
    });
    return scores;
  }

  private sendMessage(ws: ServerWebSocket<any>, message: ServerMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private sendError(ws: ServerWebSocket<any>, message: string): void {
    this.sendMessage(ws, { type: 'error', message });
  }

  private broadcastToGame(gameId: string, message: ServerMessage, excludePlayerIds: string[] = []): void {
    for (const [ws, connection] of this.connections.entries()) {
      if (connection.gameId === gameId && 
          connection.playerId && 
          !excludePlayerIds.includes(connection.playerId)) {
        this.sendMessage(ws, message);
      }
    }
  }
} 