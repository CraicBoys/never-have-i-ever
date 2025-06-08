import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { useGameState } from './hooks/useGameState';
import type { GameState, Player } from './types/game';
import { GamePhase } from './types/game';
import { GameLobby } from './components/game/GameLobby';
import { WaitingRoom } from './components/game/WaitingRoom';
import { GuessStatement } from './components/game/GuessStatement';
import SubmitStatements from './components/SubmitStatements';

// Wrapper component for GuessStatement that manages statement fetching
function GuessStatementWrapper({
  gameState,
  currentPlayer,
  submitGuess,
  getCurrentStatement
}: {
  gameState: GameState;
  currentPlayer: Player | null;
  submitGuess: (statementId: string, guessedAuthorId: string) => Promise<boolean>;
  getCurrentStatement: () => Promise<any>;
}) {
  const [currentStatement, setCurrentStatement] = useState<{id: string; text: string; voteCount: number} | null>(null);
  const [hasSubmittedGuess, setHasSubmittedGuess] = useState(false);

  // Fetch current statement when component mounts or statement index changes
  useEffect(() => {
    const fetchStatement = async () => {
      const statement = await getCurrentStatement();
      if (statement) {
        setCurrentStatement(statement);
        setHasSubmittedGuess(false); // Reset guess status for new statement
      }
    };
    
    fetchStatement();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchStatement, 2000);
    return () => clearInterval(interval);
  }, [getCurrentStatement, gameState.currentStatementIndex]);

  const handleSubmitGuess = useCallback(async (playerId: string) => {
    if (!currentStatement) return;
    
    const success = await submitGuess(currentStatement.id, playerId);
    if (success) {
      setHasSubmittedGuess(true);
    }
  }, [submitGuess, currentStatement]);

  if (!currentStatement) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading statement...</p>
      </div>
    );
  }

  return (
    <GuessStatement
      gameState={gameState}
      currentPlayer={currentPlayer}
      currentStatement={currentStatement.text}
      onSubmitGuess={handleSubmitGuess}
      hasSubmittedGuess={hasSubmittedGuess}
      voteCount={currentStatement.voteCount}
    />
  );
}

function App() {
  const [playerName, setPlayerName] = useState('');
  const {
    gameState,
    currentPlayer,
    isConnected,
    isConnecting,
    isHost,
    canStartGame,
    createRoom,
    joinLobby,
    getLobbies,
    submitStatement,
    submitGuess,
    getCurrentStatement,
    startGame,
    lobbies
  } = useGameState();

  const renderGamePhase = () => {
    if (!isConnected || !gameState) {
      return (
        <GameLobby
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          onCreateRoom={createRoom}
          onJoinLobby={joinLobby}
          onRefreshLobbies={getLobbies}
          lobbies={lobbies}
          isConnecting={isConnecting}
        />
      );
    }

    switch (gameState.phase) {
      case GamePhase.WAITING:
        return (
          <WaitingRoom
            gameState={gameState}
            currentPlayer={currentPlayer}
            onStartGame={startGame}
            canStartGame={canStartGame}
            isConnected={isConnected}
          />
        );
      
      case GamePhase.SUBMITTING_STATEMENTS:
        return (
          <SubmitStatements
            players={gameState.players}
            currentPlayerId={currentPlayer?.id || ''}
            onSubmitStatement={submitStatement}
            isHost={isHost}
            onStartNextPhase={() => {
              // This will be auto-handled by the backend when all statements are submitted
              console.log('All statements submitted, waiting for backend to advance phase');
            }}
          />
        );
      
      case GamePhase.GUESSING:
        return (
          <GuessStatementWrapper
            gameState={gameState}
            currentPlayer={currentPlayer}
            submitGuess={submitGuess}
            getCurrentStatement={getCurrentStatement}
          />
        );
      
      default:
        return (
          <div className="game-container">
            <div className="game-header">
              <h1 className="game-title">Coming Soon</h1>
              <p className="game-subtitle">
                {gameState.phase} phase will be implemented next!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dark">
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title float">🍺 Never Have I Ever</h1>
          <p className="game-subtitle">The ultimate party game with a twist!</p>
        </div>
        
        <main className="max-w-4xl mx-auto">
          {renderGamePhase()}
        </main>
        
        {/* 🤖 MATRIX HACKER BOT 🤖 */}
        <div className="matrix-bot">🤖</div>
        
        {/* ⚡ GLITCH MATRIX CHAOS ⚡ */}
        <div className="matrix-chaos">
          <div className="glitch-text error-1">[ERROR]</div>
          <div className="glitch-text warning-1">[WARNING]</div>
          <div className="glitch-text binary-1">01001000</div>
          <div className="glitch-text system-1">[SYSTEM]</div>
          <div className="glitch-text breach-1">[BREACH]</div>
          <div className="glitch-text access-1">[ACCESS_DENIED]</div>
          <div className="glitch-text hack-1">[HACKING...]</div>
          <div className="glitch-text virus-1">[VIRUS_DETECTED]</div>
          <div className="glitch-text firewall-1">[FIREWALL_DOWN]</div>
          <div className="glitch-text skull">💀</div>
          <div className="glitch-text terminal">💻</div>
          <div className="glitch-text lightning">⚡</div>
          <div className="glitch-text warning-2">[CORRUPTED]</div>
          <div className="glitch-text error-2">[FATAL_ERROR]</div>
        </div>
      </div>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'dark',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
}

export default App;
