import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, Crown, Copy, Play, Wifi, WifiOff } from 'lucide-react';
import type { GameState, Player } from '../../types/game';
import toast from 'react-hot-toast';

interface WaitingRoomProps {
  gameState: GameState;
  currentPlayer: Player;
  isConnected: boolean;
  canStartGame: boolean;
  onStartGame: () => void;
}

export function WaitingRoom({ 
  gameState, 
  currentPlayer, 
  isConnected, 
  canStartGame, 
  onStartGame 
}: WaitingRoomProps) {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
    toast.success('Room code copied to clipboard!');
  };

  const connectedPlayers = gameState.players.filter(p => p.connected);
  const playerCount = connectedPlayers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">Never Have I Ever</h1>
          <div className="flex items-center justify-center gap-2 text-lg">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-300" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-300" />
            )}
            <span className={isConnected ? 'text-green-300' : 'text-red-300'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Room Info */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Room: {gameState.roomCode}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomCode}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Code
              </Button>
            </CardTitle>
            <CardDescription>
              Share this code with your friends to join the game
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Players List */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              Players ({playerCount}/4)
            </CardTitle>
            <CardDescription>
              {playerCount < 2 
                ? 'Waiting for more players to join...' 
                : 'Ready to start when you are!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connectedPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    player.id === currentPlayer.id
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      player.connected ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium">
                      {player.name}
                      {player.id === currentPlayer.id && ' (You)'}
                    </span>
                  </div>
                  {player.isHost && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Host</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 4 - playerCount }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/50"
                >
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <span>Waiting for player...</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Start Game Button */}
        {currentPlayer.isHost && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Button
                onClick={onStartGame}
                disabled={!canStartGame || !isConnected}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {playerCount < 2 
                  ? `Need ${2 - playerCount} more player${2 - playerCount === 1 ? '' : 's'}`
                  : 'Start Game'
                }
              </Button>
              {playerCount >= 2 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  All players will submit statements anonymously
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions for non-hosts */}
        {!currentPlayer.isHost && (
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">
                Waiting for <strong>{connectedPlayers.find(p => p.isHost)?.name}</strong> to start the game...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Game Rules Reminder */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>🎯 <strong>Goal:</strong> Score points by guessing who wrote each statement</p>
            <p>📝 <strong>Statements:</strong> Write things you've never done (but others might have)</p>
            <p>🍺 <strong>Drinking:</strong> Drink if you've done what the statement says</p>
            <p>🏆 <strong>Scoring:</strong> Correct guesses = +1 point, Drinks = tracked separately</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 