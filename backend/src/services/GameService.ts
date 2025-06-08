import type { Game, Player, Statement, GameResults } from '../types/Game.js';
import { GamePhase } from '../types/Game.js';
import { generateGameId, generateRoomCode, generatePlayerId, generateStatementId } from '../utils/roomGenerator.js';

export class GameService {
  private games = new Map<string, Game>();
  private roomCodeToGameId = new Map<string, string>();

  /**
   * Creates a new game room
   */
  createGame(hostName: string): { game: Game; hostPlayer: Player } {
    const roomCode = this.generateUniqueRoomCode();
    const gameId = generateGameId();
    const hostId = generatePlayerId();

    const hostPlayer: Player = {
      id: hostId,
      name: hostName,
      isHost: true,
      drinkCount: 0,
      guessScore: 0,
      connected: true,
    };

    const game: Game = {
      id: gameId,
      roomCode,
      players: { [hostId]: hostPlayer },
      statements: [],
      currentStatementIndex: 0,
      phase: GamePhase.WAITING,
      createdAt: new Date(),
      lastActivity: new Date(),
      maxPlayers: 4,
      minPlayers: 2,
    };

    this.games.set(gameId, game);
    this.roomCodeToGameId.set(roomCode, gameId);

    return { game, hostPlayer };
  }

  /**
   * Adds a player to an existing game
   */
  joinGame(roomCode: string, playerName: string): { game: Game; player: Player } | null {
    const gameId = this.roomCodeToGameId.get(roomCode);
    if (!gameId) return null;

    const game = this.games.get(gameId);
    if (!game) return null;

    // Check if game is joinable
    if (game.phase !== GamePhase.WAITING) {
      throw new Error('Game has already started');
    }

    if (Object.keys(game.players).length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    // Check for duplicate names
    const existingNames = Object.values(game.players).map(p => p.name.toLowerCase());
    if (existingNames.includes(playerName.toLowerCase())) {
      throw new Error('Name already taken');
    }

    const playerId = generatePlayerId();
    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      drinkCount: 0,
      guessScore: 0,
      connected: true,
    };

    game.players[playerId] = player;
    game.lastActivity = new Date();

    return { game, player };
  }

  /**
   * Submits a statement for a player
   */
  submitStatement(gameId: string, playerId: string, statementText: string): boolean {
    const game = this.games.get(gameId);
    if (!game || game.phase !== GamePhase.SUBMITTING_STATEMENTS) return false;

    const player = game.players[playerId];
    if (!player) return false;

    // Validate statement
    if (!statementText.trim() || statementText.length > 200) return false;

    // Check if player already submitted
    const existingStatement = game.statements.find(s => s.authorId === playerId);
    if (existingStatement) return false;

    const statement: Statement = {
      id: generateStatementId(),
      text: statementText.trim(),
      authorId: playerId,
      votes: {},
      drinkers: [],
    };

    game.statements.push(statement);
    game.lastActivity = new Date();

    return true;
  }

  /**
   * Submits a guess for who wrote a statement
   */
  submitGuess(gameId: string, playerId: string, statementId: string, guessedAuthorId: string): boolean {
    const game = this.games.get(gameId);
    if (!game || game.phase !== GamePhase.GUESSING) return false;

    const statement = game.statements.find(s => s.id === statementId);
    if (!statement) return false;

    const player = game.players[playerId];
    const guessedPlayer = game.players[guessedAuthorId];
    if (!player || !guessedPlayer) return false;

    // Can't guess yourself
    if (playerId === guessedAuthorId) return false;

    statement.votes[playerId] = guessedAuthorId;
    game.lastActivity = new Date();

    return true;
  }

  /**
   * Records a drink action for a statement
   */
  recordDrink(gameId: string, playerId: string, statementId: string): boolean {
    const game = this.games.get(gameId);
    if (!game || game.phase !== GamePhase.DRINKING) return false;

    const statement = game.statements.find(s => s.id === statementId);
    if (!statement) return false;

    const player = game.players[playerId];
    if (!player) return false;

    // Add to drinkers if not already there
    if (!statement.drinkers.includes(playerId)) {
      statement.drinkers.push(playerId);
      player.drinkCount++;
      game.lastActivity = new Date();
    }

    return true;
  }

  /**
   * Starts the statement submission phase
   */
  startStatementPhase(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game || game.phase !== GamePhase.WAITING) return false;

    const playerCount = Object.keys(game.players).length;
    if (playerCount < game.minPlayers) return false;

    game.phase = GamePhase.SUBMITTING_STATEMENTS;
    game.lastActivity = new Date();
    return true;
  }

  /**
   * Starts the guessing phase
   */
  startGuessingPhase(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game || game.phase !== GamePhase.SUBMITTING_STATEMENTS) return false;

    // Check if all players submitted statements
    const playerCount = Object.keys(game.players).length;
    if (game.statements.length !== playerCount) return false;

    // Shuffle statements for random order
    this.shuffleStatements(game);

    game.phase = GamePhase.GUESSING;
    game.currentStatementIndex = 0;
    game.lastActivity = new Date();
    return true;
  }

  /**
   * Advances to the next statement or phase
   */
  nextStatement(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;

    if (game.phase === GamePhase.GUESSING) {
      // Check if all players voted
      const currentStatement = game.statements[game.currentStatementIndex];
      if (!currentStatement) return false;

      const playerCount = Object.keys(game.players).length;
      const voteCount = Object.keys(currentStatement.votes).length;
      
      if (voteCount < playerCount - 1) return false; // -1 because author doesn't vote

      // Calculate guess scores
      if (currentStatement) {
        this.calculateGuessScores(game, currentStatement);
      }

      game.phase = GamePhase.DRINKING;
      game.lastActivity = new Date();
      return true;
    }

    if (game.phase === GamePhase.DRINKING) {
      // Move to next statement or finish game
      game.currentStatementIndex++;
      
      if (game.currentStatementIndex >= game.statements.length) {
        game.phase = GamePhase.FINISHED;
      } else {
        game.phase = GamePhase.GUESSING;
      }
      
      game.lastActivity = new Date();
      return true;
    }

    return false;
  }

  /**
   * Gets the current statement being guessed
   */
  getCurrentStatement(gameId: string): Statement | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    const statement = game.statements[game.currentStatementIndex];
    return statement || null;
  }

  /**
   * Generates final game results
   */
  getGameResults(gameId: string): GameResults | null {
    const game = this.games.get(gameId);
    if (!game || game.phase !== GamePhase.FINISHED) return null;

    const finalScores = Object.values(game.players).map(player => ({
      playerId: player.id,
      playerName: player.name,
      drinkCount: player.drinkCount,
      guessScore: player.guessScore,
      totalScore: player.guessScore - player.drinkCount, // Higher is better
    })).sort((a, b) => b.totalScore - a.totalScore);

    const statementResults = game.statements.map(statement => {
      const author = game.players[statement.authorId];
      if (!author) {
        throw new Error(`Author not found for statement: ${statement.id}`);
      }

      const guesses: { [playerName: string]: string } = {};
      const correctGuessers: string[] = [];

      Object.entries(statement.votes).forEach(([voterId, guessedId]) => {
        const voter = game.players[voterId];
        const guessedPlayer = game.players[guessedId];
        if (voter && guessedPlayer) {
          guesses[voter.name] = guessedPlayer.name;
          if (guessedId === statement.authorId) {
            correctGuessers.push(voter.name);
          }
        }
      });

      return {
        statement: statement.text,
        actualAuthor: author.name,
        guesses,
        correctGuessers,
        drinkers: statement.drinkers.map(id => {
          const drinker = game.players[id];
          return drinker ? drinker.name : 'Unknown';
        }),
      };
    });

    return { finalScores, statementResults };
  }

  /**
   * Gets a game by ID
   */
  getGame(gameId: string): Game | null {
    return this.games.get(gameId) || null;
  }

  /**
   * Gets a game by room code
   */
  getGameByRoomCode(roomCode: string): Game | null {
    const gameId = this.roomCodeToGameId.get(roomCode);
    return gameId ? this.games.get(gameId) || null : null;
  }

  /**
   * Removes inactive games (older than 30 minutes)
   */
  cleanupInactiveGames(): void {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    for (const [gameId, game] of this.games.entries()) {
      if (game.lastActivity < thirtyMinutesAgo) {
        this.games.delete(gameId);
        this.roomCodeToGameId.delete(game.roomCode);
      }
    }
  }

  private generateUniqueRoomCode(): string {
    let roomCode: string;
    do {
      roomCode = generateRoomCode();
    } while (this.roomCodeToGameId.has(roomCode));
    
    return roomCode;
  }

  private shuffleStatements(game: Game): void {
    for (let i = game.statements.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [game.statements[i], game.statements[j]] = [game.statements[j], game.statements[i]];
    }
  }

  private calculateGuessScores(game: Game, statement: Statement): void {
    Object.entries(statement.votes).forEach(([voterId, guessedId]) => {
      if (guessedId === statement.authorId) {
        const voter = game.players[voterId];
        if (voter) {
          voter.guessScore++;
        }
      }
    });
  }
} 