import React, { useState, useEffect } from 'react';
import { GamePhase } from '../../types/game';

interface Lobby {
  gameId: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  phase: GamePhase;
  createdAt: string;
}

interface GameLobbyProps {
  onCreateRoom: (playerName: string) => boolean;
  onJoinLobby: (gameId: string, playerName: string) => boolean;
  onGetLobbies: () => boolean;
  lobbies: Lobby[];
  isConnecting: boolean;
}

export function GameLobby({ 
  onCreateRoom, 
  onJoinLobby, 
  onGetLobbies,
  lobbies, 
  isConnecting 
}: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch lobbies when component mounts and every 5 seconds
  useEffect(() => {
    onGetLobbies();
    const interval = setInterval(() => {
      onGetLobbies();
    }, 5000);

    return () => clearInterval(interval);
  }, [onGetLobbies]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    
    setIsCreating(true);
    const success = onCreateRoom(playerName.trim());
    if (!success) {
      setIsCreating(false);
    }
  };

  const handleJoinLobby = (gameId: string) => {
    if (!playerName.trim()) return;
    
    onJoinLobby(gameId, playerName.trim());
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-700 text-white p-6">
          <h1 className="text-4xl font-bold text-center mb-2">
            🍻 Never Have I Ever
          </h1>
          <p className="text-center text-purple-100">
            The ultimate party game with a twist!
          </p>
        </div>

        <div className="p-6">
          {/* Player Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              maxLength={20}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create New Game */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🚀 Create New Game
              </h2>
              <button
                onClick={handleCreateRoom}
                disabled={!playerName.trim() || isCreating || isConnecting}
                className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreating || isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  '➕ Create Room'
                )}
              </button>
            </div>

            {/* Join Existing Game */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  🎮 Join Game
                </h2>
                <button
                  onClick={() => onGetLobbies()}
                  className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                  disabled={isConnecting}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lobbies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>No active games</p>
                    <p className="text-sm">Create a new game to get started!</p>
                  </div>
                ) : (
                  lobbies.map((lobby) => (
                    <div
                      key={lobby.gameId}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {lobby.hostName}'s Game
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              👥 {lobby.playerCount}/{lobby.maxPlayers}
                            </span>
                            <span className="flex items-center gap-1">
                              ⏰ {formatTimeAgo(lobby.createdAt)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              lobby.phase === GamePhase.WAITING 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {lobby.phase === GamePhase.WAITING ? '🟢 Waiting' : '🟡 In Progress'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinLobby(lobby.gameId)}
                          disabled={
                            !playerName.trim() || 
                            lobby.playerCount >= lobby.maxPlayers ||
                            lobby.phase !== GamePhase.WAITING ||
                            isConnecting
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {lobby.playerCount >= lobby.maxPlayers ? 'Full' : 'Join'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📋 How to Play
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">🎭 Statement Phase</h4>
                <p>Each player submits anonymous "Never Have I Ever" statements</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">🔍 Guessing Phase</h4>
                <p>Guess who wrote each statement to earn points</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">🍻 Drinking Phase</h4>
                <p>Drink if you've done what the statement says</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">🏆 Scoring</h4>
                <p>Two scoring systems: guessing accuracy + drink count</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              • 2-4 players required to start • Games auto-refresh every 5 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 