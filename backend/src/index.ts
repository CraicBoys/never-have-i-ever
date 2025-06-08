import { serve } from "bun";
import { GameService } from './services/GameService.js';
import { GamePhase } from './types/Game.js';

const gameService = new GameService();

// CORS headers for development
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

console.log('🎮 Never Have I Ever Game Server starting...');

const server = serve({
  port: 3001,
  
  async fetch(req) {
    const url = new URL(req.url);
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // Get available lobbies
    if (url.pathname === '/api/lobbies' && req.method === 'GET') {
      try {
        const lobbies = gameService.getAvailableLobbies();
        return new Response(JSON.stringify({ lobbies }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to get lobbies' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Create room
    if (url.pathname === '/api/rooms' && req.method === 'POST') {
      try {
        const { playerName } = await req.json();
        const { game, hostPlayer } = gameService.createGame(playerName);
        
        return new Response(JSON.stringify({
          gameId: game.id,
          playerId: hostPlayer.id,
          roomCode: game.roomCode,
          gameState: {
            roomCode: game.roomCode,
            players: Object.values(game.players),
            phase: game.phase,
            currentStatementIndex: game.currentStatementIndex,
            totalStatements: game.statements.length,
            canStart: Object.keys(game.players).length >= game.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to create room' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Join room by game ID
    if (url.pathname === '/api/rooms/join' && req.method === 'POST') {
      try {
        const { gameId, playerName } = await req.json();
        const result = gameService.joinGameById(gameId, playerName);
        
        if (!result) {
          return new Response(JSON.stringify({ error: 'Game not found' }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const { game, player } = result;
        
        return new Response(JSON.stringify({
          gameId: game.id,
          playerId: player.id,
          gameState: {
            roomCode: game.roomCode,
            players: Object.values(game.players),
            phase: game.phase,
            currentStatementIndex: game.currentStatementIndex,
            totalStatements: game.statements.length,
            canStart: Object.keys(game.players).length >= game.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Failed to join room' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Get game state
    if (url.pathname.startsWith('/api/games/') && req.method === 'GET') {
      try {
        const gameId = url.pathname.split('/')[3];
        const game = gameService.getGame(gameId);
        
        if (!game) {
          return new Response(JSON.stringify({ error: 'Game not found' }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        return new Response(JSON.stringify({
          gameState: {
            roomCode: game.roomCode,
            players: Object.values(game.players),
            phase: game.phase,
            currentStatementIndex: game.currentStatementIndex,
            totalStatements: game.statements.length,
            canStart: Object.keys(game.players).length >= game.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to get game state' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Start game phase
    if (url.pathname.startsWith('/api/games/') && url.pathname.endsWith('/start') && req.method === 'POST') {
      try {
        const gameId = url.pathname.split('/')[3];
        const { playerId } = await req.json();
        
        const game = gameService.getGame(gameId);
        if (!game) {
          return new Response(JSON.stringify({ error: 'Game not found' }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const player = game.players[playerId];
        if (!player?.isHost) {
          return new Response(JSON.stringify({ error: 'Only host can start game' }), {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const success = gameService.startStatementPhase(gameId);
        if (!success) {
          return new Response(JSON.stringify({ error: 'Cannot start game' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const updatedGame = gameService.getGame(gameId)!;
        return new Response(JSON.stringify({
          gameState: {
            roomCode: updatedGame.roomCode,
            players: Object.values(updatedGame.players),
            phase: updatedGame.phase,
            currentStatementIndex: updatedGame.currentStatementIndex,
            totalStatements: updatedGame.statements.length,
            canStart: Object.keys(updatedGame.players).length >= updatedGame.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to start game' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Submit statement
    if (url.pathname.startsWith('/api/games/') && url.pathname.endsWith('/statements') && req.method === 'POST') {
      try {
        const gameId = url.pathname.split('/')[3];
        const { playerId, statement } = await req.json();
        
        const success = gameService.submitStatement(gameId, playerId, statement);
        if (!success) {
          return new Response(JSON.stringify({ error: 'Failed to submit statement' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const game = gameService.getGame(gameId)!;
        
        // Mark player as having submitted statement
        if (game.players[playerId]) {
          game.players[playerId].hasSubmittedStatement = true;
        }

        // Check if all players submitted and auto-advance to guessing
        const playerCount = Object.keys(game.players).length;
        if (game.statements.length === playerCount && game.phase === GamePhase.SUBMITTING_STATEMENTS) {
          gameService.startGuessingPhase(gameId);
        }

        const updatedGame = gameService.getGame(gameId)!;
        return new Response(JSON.stringify({
          gameState: {
            roomCode: updatedGame.roomCode,
            players: Object.values(updatedGame.players),
            phase: updatedGame.phase,
            currentStatementIndex: updatedGame.currentStatementIndex,
            totalStatements: updatedGame.statements.length,
            canStart: Object.keys(updatedGame.players).length >= updatedGame.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to submit statement' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Get current statement for guessing
    if (url.pathname.startsWith('/api/games/') && url.pathname.endsWith('/current-statement') && req.method === 'GET') {
      try {
        const gameId = url.pathname.split('/')[3];
        const game = gameService.getGame(gameId);
        
        if (!game) {
          return new Response(JSON.stringify({ error: 'Game not found' }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        if (game.phase !== GamePhase.GUESSING) {
          return new Response(JSON.stringify({ error: 'Not in guessing phase' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const currentStatement = gameService.getCurrentStatement(gameId);
        if (!currentStatement) {
          return new Response(JSON.stringify({ error: 'No current statement' }), {
            status: 404,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        // Return statement without author ID to keep it anonymous
        return new Response(JSON.stringify({
          statement: {
            id: currentStatement.id,
            text: currentStatement.text,
            voteCount: Object.keys(currentStatement.votes).length
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to get current statement' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // Submit guess
    if (url.pathname.startsWith('/api/games/') && url.pathname.endsWith('/guess') && req.method === 'POST') {
      try {
        const gameId = url.pathname.split('/')[3];
        const { playerId, statementId, guessedAuthorId } = await req.json();
        
        const success = gameService.submitGuess(gameId, playerId, statementId, guessedAuthorId);
        if (!success) {
          return new Response(JSON.stringify({ error: 'Failed to submit guess' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          });
        }

        const game = gameService.getGame(gameId)!;
        const currentStatement = gameService.getCurrentStatement(gameId);
        
        // Check if all players voted (excluding the author)
        if (currentStatement) {
          const playerCount = Object.keys(game.players).length;
          const voteCount = Object.keys(currentStatement.votes).length;
          
          if (voteCount >= playerCount - 1) { // -1 because author doesn't vote
            // All votes are in, advance to drinking phase
            gameService.nextStatement(gameId);
          }
        }

        const updatedGame = gameService.getGame(gameId)!;
        return new Response(JSON.stringify({
          gameState: {
            roomCode: updatedGame.roomCode,
            players: Object.values(updatedGame.players),
            phase: updatedGame.phase,
            currentStatementIndex: updatedGame.currentStatementIndex,
            totalStatements: updatedGame.statements.length,
            canStart: Object.keys(updatedGame.players).length >= updatedGame.minPlayers,
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to submit guess' }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  },
});

console.log('🎮 Never Have I Ever Game Server running on http://localhost:3001');
console.log('🔌 HTTP API endpoints:');
console.log('  GET  /health - Health check');
console.log('  GET  /api/lobbies - Get available lobbies');
console.log('  POST /api/rooms - Create new room');
console.log('  POST /api/rooms/join - Join room by game ID');
console.log('  GET  /api/games/:id - Get game state');
console.log('  POST /api/games/:id/start - Start game');
console.log('  POST /api/games/:id/statements - Submit statement');
console.log('  GET  /api/games/:id/current-statement - Get current statement for guessing');
console.log('  POST /api/games/:id/guess - Submit guess');
console.log('🏥 Health check: http://localhost:3001/health');

// Cleanup inactive games every 5 minutes
setInterval(() => {
  gameService.cleanupInactiveGames();
}, 5 * 60 * 1000); 