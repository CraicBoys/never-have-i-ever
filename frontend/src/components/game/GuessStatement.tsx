import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Player, GameState } from '../../types/game';
import { Clock, Users, Target } from 'lucide-react';

interface GuessStatementProps {
  gameState: GameState;
  currentPlayer: Player | null;
  currentStatement: string;
  onSubmitGuess: (playerId: string) => void;
  hasSubmittedGuess: boolean;
  voteCount: number;
}

export function GuessStatement({
  gameState,
  currentPlayer,
  currentStatement,
  onSubmitGuess,
  hasSubmittedGuess,
  voteCount
}: GuessStatementProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(45); // 45 second timer per statement

  // Reset timer when statement changes
  useEffect(() => {
    setTimeLeft(45);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStatement]);

  // Reset selection when statement changes
  useEffect(() => {
    setSelectedPlayerId('');
  }, [currentStatement]);

  // Get other players (excluding current player)
  const otherPlayers = gameState.players.filter(p => p.id !== currentPlayer?.id);
  const totalPlayersNeeded = gameState.players.length - 1; // Everyone except the author
  const progressPercentage = (voteCount / totalPlayersNeeded) * 100;

  const handleSubmitGuess = () => {
    if (selectedPlayerId && !hasSubmittedGuess) {
      onSubmitGuess(selectedPlayerId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with progress */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Statement {gameState.currentStatementIndex + 1} of {gameState.totalStatements}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {voteCount}/{totalPlayersNeeded} voted
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto bg-secondary rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main statement card */}
      <Card className="mx-auto max-w-2xl border-2 border-gradient">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Who do you think wrote this statement?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* The statement */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
            <p className="text-lg font-medium leading-relaxed">
              "Never have I ever {currentStatement}"
            </p>
          </div>

          {/* Player selection */}
          {!hasSubmittedGuess ? (
            <div className="space-y-4">
              <h3 className="text-center font-medium text-muted-foreground">
                Choose who you think wrote this:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {otherPlayers.map((player) => (
                  <Button
                    key={player.id}
                    variant={selectedPlayerId === player.id ? "default" : "outline"}
                    className={`h-12 text-left justify-start ${
                      selectedPlayerId === player.id 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none" 
                        : "hover:border-blue-500/50"
                    }`}
                    onClick={() => setSelectedPlayerId(player.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2 text-sm opacity-75">
                        <span>🍺 {player.drinkCount}</span>
                        <span>🎯 {player.guessScore}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={handleSubmitGuess}
                disabled={!selectedPlayerId}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
              >
                {selectedPlayerId ? 'Submit Guess' : 'Select a Player First'}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-600 font-medium">✅ Guess submitted!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Waiting for other players to vote...
                </p>
              </div>
              
              {/* Show waiting players */}
              <div className="flex flex-wrap justify-center gap-2">
                {otherPlayers.map((player) => (
                  <Badge 
                    key={player.id}
                    variant={voteCount >= totalPlayersNeeded ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {player.name} {player.id === currentPlayer?.id ? "(you)" : ""}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game progress indicator */}
      <div className="text-center text-sm text-muted-foreground">
        <p>After everyone votes, we'll reveal who actually wrote this statement!</p>
      </div>
    </div>
  );
} 