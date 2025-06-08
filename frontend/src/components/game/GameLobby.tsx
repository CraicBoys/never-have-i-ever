import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  Gamepad2, 
  Crown,
  Clock,
  Loader2,
  Zap
} from 'lucide-react';
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
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onCreateRoom: (playerName: string) => Promise<boolean>;
  onJoinLobby: (gameId: string, playerName: string) => Promise<boolean>;
  onRefreshLobbies: () => Promise<boolean>;
  lobbies: Lobby[];
  isConnecting: boolean;
}

export function GameLobby({
  playerName,
  onPlayerNameChange,
  onCreateRoom,
  onJoinLobby,
  onRefreshLobbies,
  lobbies,
  isConnecting
}: GameLobbyProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  // Auto-refresh lobbies every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnecting && !isCreating && !joiningGameId) {
        onRefreshLobbies();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnecting, isCreating, joiningGameId, onRefreshLobbies]);

  // Initial load
  useEffect(() => {
    onRefreshLobbies();
  }, []);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateRoom(playerName.trim());
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLobby = async (gameId: string) => {
    if (!playerName.trim()) return;
    
    setJoiningGameId(gameId);
    try {
      await onJoinLobby(gameId, playerName.trim());
    } finally {
      setJoiningGameId(null);
    }
  };

  const getPhaseColor = (phase: GamePhase) => {
    switch (phase) {
      case GamePhase.WAITING:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case GamePhase.SUBMITTING_STATEMENTS:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case GamePhase.GUESSING:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case GamePhase.DRINKING:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="space-y-8 slide-up">
      {/* Player Setup Card */}
      <Card className="game-card glass-effect max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            Your Player Name
          </CardTitle>
          <CardDescription>
            Enter your name to create or join a game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value)}
              className="text-center text-lg font-medium"
              maxLength={20}
            />
          </div>
          
          <Button
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || isCreating || isConnecting}
            className="w-full game-button"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Game...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create New Game
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lobbies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Available Games
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshLobbies}
            disabled={isConnecting}
            className="game-button"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {lobbies.length === 0 ? (
          <Card className="game-card text-center py-12">
            <CardContent>
              <div className="text-muted-foreground space-y-2">
                <Gamepad2 className="w-16 h-16 mx-auto opacity-50" />
                <h3 className="text-xl font-medium">No games available</h3>
                <p>Be the first to create a game!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lobbies.map((lobby) => (
              <Card 
                key={lobby.gameId} 
                className="game-card hover:game-glow transition-all cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {lobby.hostName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base flex items-center gap-1">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          {lobby.hostName}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(lobby.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPhaseColor(lobby.phase)}`}
                    >
                      {lobby.phase.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {lobby.playerCount}/{lobby.maxPlayers} players
                    </div>
                    {lobby.phase === GamePhase.WAITING && (
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Joining
                      </Badge>
                    )}
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <Button
                    onClick={() => handleJoinLobby(lobby.gameId)}
                    disabled={
                      !playerName.trim() || 
                      lobby.phase !== GamePhase.WAITING ||
                      lobby.playerCount >= lobby.maxPlayers ||
                      joiningGameId === lobby.gameId ||
                      isConnecting
                    }
                    className="w-full game-button group-hover:scale-105"
                    variant={lobby.phase === GamePhase.WAITING ? 'default' : 'secondary'}
                  >
                    {joiningGameId === lobby.gameId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : lobby.phase !== GamePhase.WAITING ? (
                      'Game In Progress'
                    ) : lobby.playerCount >= lobby.maxPlayers ? (
                      'Game Full'
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Join Game
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* How to Play Section */}
      <Card className="game-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">🎯 How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">📝 Statement Phase</h4>
              <p>Each player submits anonymous "Never Have I Ever" statements</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">🔍 Guessing Phase</h4>
              <p>Guess who wrote each statement to earn points</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">🍺 Drinking Phase</h4>
              <p>Drink if you've done what the statement says</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">🏆 Scoring</h4>
              <p>Correct guesses = +1 point, Drinks = tracked separately</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 