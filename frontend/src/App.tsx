import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useGameState } from './hooks/useGameState';
import { GameLobby } from './components/game/GameLobby';
import { WaitingRoom } from './components/game/WaitingRoom';
import { GamePhase } from './types/game';

function App() {
  const {
    isConnected,
    isConnecting,
    gameState,
    currentPlayer,
    canStartGame,
    createRoom,
    joinRoom,
    startGame,
  } = useGameState();

  // Show lobby if no game state or not connected to a game
  if (!gameState || !currentPlayer) {
    return (
      <>
        <GameLobby
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          isConnecting={isConnecting}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  // Show waiting room while waiting for players
  if (gameState.phase === GamePhase.WAITING) {
    return (
      <>
        <WaitingRoom
          gameState={gameState}
          currentPlayer={currentPlayer}
          isConnected={isConnected}
          canStartGame={canStartGame}
          onStartGame={startGame}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  // TODO: Add other game phases
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Game In Progress</h1>
          <p className="text-lg">Phase: {gameState.phase}</p>
          <p className="text-sm opacity-75 mt-2">More game phases coming soon...</p>
        </div>
      </div>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
