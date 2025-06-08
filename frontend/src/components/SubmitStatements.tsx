import React, { useState } from 'react';
import type { Player } from '../types/game';

interface SubmitStatementsProps {
  players: Player[];
  currentPlayerId: string;
  onSubmitStatement: (statement: string) => void;
  isHost: boolean;
  onStartNextPhase: () => void;
}

export default function SubmitStatements({ 
  players, 
  currentPlayerId, 
  onSubmitStatement,
  isHost,
  onStartNextPhase 
}: SubmitStatementsProps) {
  const [statement, setStatement] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statement.trim()) {
      onSubmitStatement(statement.trim());
      setStatement('');
      setHasSubmitted(true);
    }
  };

  const submittedCount = players.filter(p => p.hasSubmittedStatement).length;
  const allSubmitted = submittedCount === players.length;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          📝 Submit Your Statement
        </h2>
        <p className="text-gray-600">
          Write an anonymous "Never Have I Ever" statement
        </p>
      </div>

      {!hasSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Never Have I Ever...
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="e.g., gone skydiving, eaten sushi, traveled to another continent..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              maxLength={200}
              required
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {statement.length}/200 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={!statement.trim()}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit Statement
          </button>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">
            Statement Submitted!
          </h3>
          <p className="text-gray-600">
            Waiting for other players to submit their statements...
          </p>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {submittedCount}/{players.length} submitted
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(submittedCount / players.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Player status list */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Players:</h4>
        <div className="space-y-2">
          {players.map((player) => (
            <div 
              key={player.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="font-medium">
                {player.name} {player.id === currentPlayerId && '(You)'}
              </span>
              <span className={`text-sm ${player.hasSubmittedStatement ? 'text-green-600' : 'text-gray-400'}`}>
                {player.hasSubmittedStatement ? '✅ Submitted' : '⏳ Waiting'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Start next phase button (host only) */}
      {isHost && allSubmitted && (
        <div className="mt-8 text-center">
          <button
            onClick={onStartNextPhase}
            className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
          >
            🎯 Start Guessing Phase
          </button>
        </div>
      )}
    </div>
  );
} 