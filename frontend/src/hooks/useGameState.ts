import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import type { GameState, Player, Statement, GameResults } from '../types/game';
import { GamePhase } from '../types/game';
import type { ServerMessage } from '../types/websocket';
import toast from 'react-hot-toast';

const WS_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://your-domain.com/game' 
  : 'ws://localhost:3001/game';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentStatement, setCurrentStatement] = useState<Statement | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [scores, setScores] = useState<{ [playerId: string]: { drinkCount: number; guessScore: number } }>({});

  const handleMessage = useCallback((message: ServerMessage) => {
    console.log('Received message:', message.type);

    switch (message.type) {
      case 'room-created':
        setGameState(message.gameState);
        const hostPlayer = message.gameState.players.find(p => p.id === message.playerId);
        if (hostPlayer) {
          setCurrentPlayer(hostPlayer);
        }
        toast.success(`Room created! Code: ${message.roomCode}`);
        break;

      case 'player-joined':
        setGameState(message.gameState);
        if (message.player.id === currentPlayer?.id) {
          setCurrentPlayer(message.player);
        }
        toast.success(`${message.player.name} joined the game!`);
        break;

      case 'game-state':
        setGameState(message.gameState);
        break;

      case 'phase-changed':
        setGameState(message.gameState);
        switch (message.phase) {
          case GamePhase.SUBMITTING_STATEMENTS:
            toast.success('Time to submit your statements!');
            break;
          case GamePhase.GUESSING:
            toast.success('Guessing phase started!');
            break;
          case GamePhase.DRINKING:
            toast.success('Time to drink!');
            break;
        }
        break;

      case 'statement-revealed':
        setCurrentStatement(message.statement);
        break;

      case 'scores-updated':
        setScores(message.scores);
        break;

      case 'game-ended':
        setGameResults(message.results);
        toast.success('Game finished! Check out the results!');
        break;

      case 'error':
        toast.error(message.message);
        break;

      default:
        console.warn('Unknown message type:', message);
    }
  }, [currentPlayer?.id]);

  const { isConnected, isConnecting, sendMessage } = useWebSocket(WS_URL, {
    onMessage: handleMessage,
    onConnect: () => {
      toast.success('Connected to game server!');
    },
    onDisconnect: () => {
      toast.error('Disconnected from game server');
    },
    onError: () => {
      toast.error('Connection error');
    },
  });

  const createRoom = useCallback((playerName: string) => {
    return sendMessage({
      type: 'create-room',
      playerName,
    });
  }, [sendMessage]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    return sendMessage({
      type: 'join-room',
      roomCode: roomCode.toUpperCase(),
      playerName,
    });
  }, [sendMessage]);

  const submitStatement = useCallback((statement: string) => {
    return sendMessage({
      type: 'submit-statement',
      statement,
    });
  }, [sendMessage]);

  const submitGuess = useCallback((statementId: string, guessedAuthorId: string) => {
    return sendMessage({
      type: 'submit-guess',
      statementId,
      guessedAuthorId,
    });
  }, [sendMessage]);

  const recordDrink = useCallback((statementId: string) => {
    return sendMessage({
      type: 'drink-action',
      statementId,
    });
  }, [sendMessage]);

  const startGame = useCallback(() => {
    return sendMessage({
      type: 'start-phase',
      phase: GamePhase.SUBMITTING_STATEMENTS,
    });
  }, [sendMessage]);

  const isHost = currentPlayer?.isHost || false;
  const canStartGame = gameState?.canStart && isHost && gameState.phase === GamePhase.WAITING;

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

    // Computed state
    isHost,
    canStartGame,

    // Actions
    createRoom,
    joinRoom,
    submitStatement,
    submitGuess,
    recordDrink,
    startGame,
  };
} 