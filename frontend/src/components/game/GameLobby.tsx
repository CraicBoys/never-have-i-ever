import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, Plus, LogIn } from 'lucide-react';

interface GameLobbyProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  isConnecting: boolean;
}

export function GameLobby({ onCreateRoom, onJoinRoom, isConnecting }: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      return;
    }

    if (mode === 'create') {
      onCreateRoom(playerName.trim());
    } else {
      if (!roomCode.trim()) {
        return;
      }
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">Never Have I Ever</h1>
          <p className="text-lg opacity-90">The ultimate party game with a twist!</p>
        </div>

        {/* Mode Selection */}
        <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'create'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Room
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'join'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Join Room
          </button>
        </div>

        {/* Form */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {mode === 'create' ? 'Create New Game' : 'Join Existing Game'}
            </CardTitle>
            <CardDescription>
              {mode === 'create'
                ? 'Start a new game and invite your friends!'
                : 'Enter the room code to join your friends!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playerName">Your Name</Label>
                <Input
                  id="playerName"
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  required
                />
              </div>

              {mode === 'join' && (
                <div className="space-y-2">
                  <Label htmlFor="roomCode">Room Code</Label>
                  <Input
                    id="roomCode"
                    type="text"
                    placeholder="Enter 6-digit room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isConnecting || !playerName.trim() || (mode === 'join' && !roomCode.trim())}
              >
                {isConnecting ? (
                  'Connecting...'
                ) : mode === 'create' ? (
                  'Create Room'
                ) : (
                  'Join Room'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Each player submits anonymous "Never Have I Ever" statements</p>
            <p>• Guess who wrote each statement to earn points</p>
            <p>• Drink if you've done what the statement says</p>
            <p>• Two scoring systems: guessing accuracy + drink count</p>
            <p>• 2-4 players required to start</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 