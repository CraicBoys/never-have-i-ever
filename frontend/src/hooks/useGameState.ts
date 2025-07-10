import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Player, Statement, GameResults } from '../types/game';
import { GamePhase } from '../types/game';
import toast from 'react-hot-toast';

// API configuration
let API_BASE = 'http://localhost:3001/api'; // fallback
let configLoaded = false;

const initializeApiBase = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    API_BASE = config.API_BASE_URL;
    console.log('API Base URL loaded:', API_BASE);
  } catch (error) {
    console.warn('Failed to load API config, using fallback:', API_BASE);
  } finally {
    configLoaded = true;
  }
};

// Initialize API base URL
const configPromise = initializeApiBase();

interface Lobby {
  gameId: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  phase: GamePhase;
  createdAt: string;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentStatement, setCurrentStatement] = useState<Statement | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [scores, setScores] = useState<{ [playerId: string]: { drinkCount: number; guessScore: number } }>({});
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // HTTP client helper - waits for config to load
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    // Wait for config to load first
    await configPromise;
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }, []);

  // Poll for game state updates
  const pollGameState = useCallback(async () => {
    if (!gameId) return;

    try {
      const data = await apiCall(`/games/${gameId}`);
      setGameState(data.gameState);
      
      // Update current player data if we have one
      if (playerId && data.gameState.players) {
        const updatedPlayer = data.gameState.players.find((p: Player) => p.id === playerId);
        if (updatedPlayer) {
          setCurrentPlayer(updatedPlayer);
        }
      }
    } catch (error) {
      console.error('Failed to poll game state:', error);
    }
  }, [gameId, playerId, apiCall]);

  // Start polling when we have a game
  useEffect(() => {
    if (gameId) {
      // Poll immediately
      pollGameState();
      
      // Then poll every 2 seconds
      pollingIntervalRef.current = setInterval(pollGameState, 2000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [gameId, pollGameState]);

  // Get lobbies
  const getLobbies = useCallback(async () => {
    try {
      const data = await apiCall('/lobbies');
      setLobbies(data.lobbies || []);
      return true;
    } catch (error) {
      console.error('Failed to get lobbies:', error);
      toast.error('Failed to get lobbies');
      return false;
    }
  }, [apiCall]);

  // Create room
  const createRoom = useCallback(async (playerName: string) => {
    setIsConnecting(true);
    try {
      const data = await apiCall('/rooms', {
        method: 'POST',
        body: JSON.stringify({ playerName }),
      });

      setGameId(data.gameId);
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      
      // Find the current player
      const player = data.gameState.players.find((p: Player) => p.id === data.playerId);
      if (player) {
        setCurrentPlayer(player);
      }

      toast.success(`Room created! Code: ${data.roomCode}`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create room');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [apiCall]);

  // Join lobby by game ID
  const joinLobby = useCallback(async (lobbyGameId: string, playerName: string) => {
    setIsConnecting(true);
    try {
      const data = await apiCall('/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ gameId: lobbyGameId, playerName }),
      });

      setGameId(data.gameId);
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      
      // Find the current player
      const player = data.gameState.players.find((p: Player) => p.id === data.playerId);
      if (player) {
        setCurrentPlayer(player);
      }

      toast.success(`Joined ${data.gameState.players.find((p: Player) => p.isHost)?.name}'s game!`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join lobby');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [apiCall]);

  // Legacy joinRoom for room codes (keeping for compatibility)
  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    // For now, this functionality is replaced by joinLobby
    toast.error('Room codes are no longer supported. Please use the lobby list instead.');
    return false;
  }, []);

  // Start game
  const startGame = useCallback(async () => {
    if (!gameId || !playerId) return false;

    try {
      const data = await apiCall(`/games/${gameId}/start`, {
        method: 'POST',
        body: JSON.stringify({ playerId }),
      });

      setGameState(data.gameState);
      toast.success('Game started! Time to submit statements.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start game');
      return false;
    }
  }, [gameId, playerId, apiCall]);

  // Submit statement
  const submitStatement = useCallback(async (statement: string) => {
    if (!gameId || !playerId) return false;

    try {
      const data = await apiCall(`/games/${gameId}/statements`, {
        method: 'POST',
        body: JSON.stringify({ playerId, statement }),
      });

      setGameState(data.gameState);
      toast.success('Statement submitted!');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit statement');
      return false;
    }
  }, [gameId, playerId, apiCall]);

  // Submit guess
  const submitGuess = useCallback(async (statementId: string, guessedAuthorId: string) => {
    if (!gameId || !playerId) return false;

    try {
      const data = await apiCall(`/games/${gameId}/guess`, {
        method: 'POST',
        body: JSON.stringify({ playerId, statementId, guessedAuthorId }),
      });

      setGameState(data.gameState);
      toast.success('Guess submitted!');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit guess');
      return false;
    }
  }, [gameId, playerId, apiCall]);

  // Get current statement for guessing
  const getCurrentStatement = useCallback(async () => {
    if (!gameId) return null;

    try {
      const data = await apiCall(`/games/${gameId}/current-statement`);
      return data.statement;
    } catch (error) {
      console.error('Failed to get current statement:', error);
      return null;
    }
  }, [gameId, apiCall]);

  const recordDrink = useCallback(async (statementId: string) => {
    toast.success('Drinking phase coming soon!');
    return false;
  }, []);

  const isHost = currentPlayer?.isHost || false;
  const canStartGame = gameState?.canStart && isHost && gameState.phase === GamePhase.WAITING;
  const isConnected = !!gameId; // We're "connected" if we have a game ID

  return {
    // Connection state
    isConnected,
    isConnecting,

    // Game state
    gameState,
    currentPlayer,
    currentStatement,
    gameResults,
    scores,
    lobbies,

    // Computed state
    isHost,
    canStartGame,

    // Actions
    createRoom,
    joinRoom,
    joinLobby,
    getLobbies,
    submitStatement,
    submitGuess,
    getCurrentStatement,
    recordDrink,
    startGame,
  };
} 